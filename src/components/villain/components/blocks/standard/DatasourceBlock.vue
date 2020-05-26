<template>
  <Block
    ref="block"
    :block="block"
    :parent="parent"
    @add="$emit('add', $event)"
    @move="$emit('move', $event)"
    @delete="$emit('delete', $event)">
    <div class="villain-block-description">
      Datakilde<span v-if="block.data.description"> — {{ block.data.description }}</span>
    </div>
    <div class="villain-block-datasource-info">
      <div
        v-if="block.data.module"
        class="inside">
        <i class="fa fa-fw fa-database"></i>
        <p>Datakilde — {{ block.data.description }}</p>
        <p><small><code>{{ block.data.module }}<br>{{ block.data.type }}|{{ block.data.query }}</code></small></p>
      </div>
      <div
        v-else
        class="villain-block-datasource-empty">
        <i class="fa fa-fw fa-database"></i>
        <div class="actions">
          <ButtonSecondary
            @click="$refs.block.openConfig()">
            Konfigurér datakilde
          </ButtonSecondary>
        </div>
      </div>
    </div>
    <template slot="config">
      <div class="panes">
        <div>
          <KInput
            v-model="block.data.description"
            rules="required"
            name="data[description]"
            label="Beskrivelse"
            placeholder="Beskrivelse av datakilden" />

          <KInputRadios
            v-model="block.data.module"
            rules="required"
            :options="availableModules"
            optionValueKey="module"
            optionLabelKey="module"
            name="data[module]"
            label="Kildemodul" />

          <KInputRadios
            v-model="block.data.type"
            rules="required"
            :options="availableModuleTypes"
            name="data[type]"
            label="Type" />

          <KInputRadios
            v-model="block.data.query"
            rules="required"
            :options="availableModuleQueries"
            name="data[query]"
            label="Spørring" />

          <KInput
            v-model="block.data.arg"
            name="data[arg]"
            label="Argument" />
        </div>
        <div>
          <KInputSelect
            v-if="templates.length"
            v-model="block.data.template"
            rules="required"
            :options="templates"
            optionValueKey="id"
            optionLabelKey="name"
            name="data[template]"
            label="Mal" />

          <KInputTextarea
            v-model="block.data.wrapper"
            :monospace="true"
            :rows="8"
            name="data[wrapper]"
            label="Wrapper"
            help-text="Bruk ${CONTENT} for innhold" />
        </div>
      </div>
    </template>
  </Block>
</template>

<script>
import Block from '../system/Block'

export default {
  name: 'DatasourceBlock',

  components: {
    Block
  },

  props: {
    block: {
      type: Object,
      default: () => {}
    },

    parent: {
      type: String,
      default: null
    }
  },

  data () {
    return {
      customClass: '',
      uid: null,
      showConfig: false,
      availableModules: [],
      availableModuleKeys: [],
      availableModuleTypes: [],
      availableModuleQueries: [],
      templates: []
    }
  },

  watch: {
    'block.data.module' (val) {
      this.getModuleKeys(val)
    },

    'block.data.type' (val) {
      this.getModuleQueries(val)
    },

    'block.data.arg' (val) {
      if (val === '') {
        this.block.data.arg = null
      }
    }
  },

  inject: [
    'urls',
    'headers',
    'available',
    'adminChannel'
  ],

  created () {
    console.debug('<DatasourceBlock /> created')
    this.getModules()
    this.getTemplates()
    if (this.block.data.module) {
      this.getModuleKeys()
    }
  },

  methods: {
    getModules () {
      this.adminChannel.channel
        .push('datasource:list_modules')
        .receive('ok', payload => {
          this.availableModules = payload.available_modules
        })
    },

    getModuleKeys () {
      this.adminChannel.channel
        .push('datasource:list_module_keys', { module: this.block.data.module })
        .receive('ok', payload => {
          this.availableModuleKeys = payload.available_module_keys
          this.availableModuleTypes = Object.keys(payload.available_module_keys).map(t => ({ name: t, value: t }))
          if (this.block.data.type) {
            this.availableModuleQueries = this.availableModuleKeys[this.block.data.type].map(t => ({ name: t, value: t }))
          }
        })
    },

    getModuleQueries (val) {
      this.availableModuleQueries = this.availableModuleKeys[val].map(t => ({ name: t, value: t }))
    },

    getTemplates () {
      this.adminChannel.channel
        .push('templates:list_templates')
        .receive('ok', payload => {
          this.templates = payload.templates
        })
    },

    createUID () {
      return (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase()
    }
  }
}
</script>

<style lang="postcss" scoped>
  .villain-block-datasource-info,
  .villain-block-datasource-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .inside {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }

    svg {
      width: 30%;
      height: 30%;
      max-width: 250px;
      margin-bottom: 25px;
    }
  }
</style>
