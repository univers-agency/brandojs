<template>
  <div>
    <Block
      ref="block"
      :block="block"
      :parent="parent"
      @add="$emit('add', $event)"
      @move="$emit('move', $event)"
      @duplicate="$emit('duplicate', $event)"
      @delete="$emit('delete', $event)">
      <div class="villain-block-datasource-info">
        <div
          v-if="block.data.module"
          class="inside">
          <i class="fa fa-fw fa-database"></i>
          <p>Datakilde — {{ block.data.description }}</p>
          <p><small><code>{{ block.data.module }}<br>{{ block.data.type }}|{{ block.data.query }}</code></small></p>
          <div v-if="block.data.type === 'selection'">
            <ButtonPrimary
              class="mt-2"
              @click="selectEntries">
              Velg oppføringer
            </ButtonPrimary>
            <template v-if="selectedEntries.length">
              <transition-group
                v-sortable="{handle: '.sort-handle', animation: 0, store: {get: getOrder, set: storeOrder}}"
                name="fade-move"
                tag="div"
                class="sort-container">
                <div
                  v-for="e in selectedEntries"
                  :key="e.id"
                  :data-id="e.id"
                  class="selected-entry sort-handle">
                  #{{ e.id }} — {{ e.label }}
                </div>
              </transition-group>
            </template>
          </div>
          <div class="helpful-actions">
            <ButtonTiny
              @click="$refs.config.openConfig()">
              Konfigurér datakilde
            </ButtonTiny>
          </div>
        </div>
        <div
          v-else
          class="villain-block-datasource-empty">
          <i class="fa fa-fw fa-database"></i>
          <div class="actions">
            <ButtonTiny
              @click="$refs.config.openConfig()">
              Konfigurér datakilde
            </ButtonTiny>
          </div>
        </div>
      </div>
      <BlockConfig
        ref="config">
        <template #default>
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
              <div v-else>
                Fant ingen tilgjengelige maler!
              </div>

              <KInputNumber
                v-if="block.data.type === 'selection'"
                v-model="block.data.limit"
                name="data[limit]"
                label="Maks antall" />

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
      </BlockConfig>
      <KModal
        v-if="showAvailableEntries"
        ref="availableEntriesModal"
        v-shortkey="['esc', 'enter']"
        ok-text="Lukk"
        @shortkey.native="closeAvailableEntriesModal"
        @ok="closeAvailableEntriesModal">
        <template #header>
          Velg oppføringer
        </template>
        <ContentList
          :selectable="false"
          :tools="false"
          :entries="availableEntries">
          <template v-slot:row="{ entry }">
            <div
              class="row-wrap"
              :class="{selected: block.data.ids.includes(parseInt(entry.id))}">
              <div>#{{ entry.id }} — {{ entry.label }}</div>

              <ButtonTiny
                v-if="!block.data.ids.includes(parseInt(entry.id))"
                @click="addSelectedEntry(entry.id)">
                Legg til
              </ButtonTiny>
              <ButtonTiny
                v-else
                @click="removeSelectedEntry(entry.id)">
                Fjern
              </ButtonTiny>
            </div>
          </template>
        </ContentList>
      </KModal>
    </block>
  </div>
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
      showAvailableEntries: false,
      availableEntries: [],
      availableModules: [],
      availableModuleKeys: [],
      availableModuleTypes: [],
      availableModuleQueries: [],
      selectedEntries: [],
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

  async created () {
    console.debug('<DatasourceBlock /> created')
    this.getModules()
    this.getTemplates()
    if (this.block.data.module) {
      this.getModuleKeys()
    }

    if (this.block.data.ids.length) {
      await this.listAvailableEntries()
      this.refreshSelectedEntries()
    }
  },

  methods: {
    refreshSelectedEntries () {
      this.selectedEntries = this.block.data.ids.map(id => this.availableEntries.find(e => parseInt(e.id) === parseInt(id)))
    },

    getOrder (sortable) {
      return this.block.data.ids
    },

    storeOrder (sortable) {
      this.sortedArray = sortable.toArray().map(Number)
      this.block.data.ids = this.sortedArray
    },

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

    selectEntries () {
      this.listAvailableEntries()
      this.showAvailableEntries = true
    },

    listAvailableEntries () {
      return new Promise((resolve, reject) => {
        this.adminChannel.channel
          .push('datasource:list_available_entries', { module: this.block.data.module, query: this.block.data.query })
          .receive('ok', payload => {
            this.availableEntries = payload.available_entries
            if (!this.block.data.ids) {
              this.block.data = {
                ...this.block.data,
                ids: []
              }
            }
            resolve()
          })
      })
    },

    async closeAvailableEntriesModal () {
      await this.$refs.availableEntriesModal.close()
      this.showAvailableEntries = false
      this.refreshSelectedEntries()
    },

    addSelectedEntry (id) {
      if (this.block.data.limit) {
        if (this.block.data.ids.length >= this.block.data.limit) {
          this.$alerts.alertError('Feil', `Kan kun velge ${this.block.data.limit} oppføringer`)
          return
        }
      }
      this.block.data.ids.push(id)
    },

    removeSelectedEntry (id) {
      const newIds = this.block.data.ids.filter(i => i !== id)
      this.$set(this.block.data, 'ids', newIds)
      this.refreshSelectedEntries()
    },

    createUID () {
      return (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase()
    }
  }
}
</script>

<style lang="postcss" scoped>
  .row-wrap {
    display: flex;
    width: 100%;
    justify-content: space-between;
  }

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

  .selected-entry {
    margin-top: 15px;
    padding: 7px 0;
    border-bottom: 1px solid theme(colors.peach);
  }
</style>
