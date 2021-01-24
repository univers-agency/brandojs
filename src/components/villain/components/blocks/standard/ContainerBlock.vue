<template>
  <div>
    <Block
      :block="block"
      :parent="null"
      @add="$emit('add', $event)"
      @move="$emit('move', $event)"
      @duplicate="$emit('duplicate', $event)"
      @delete="$emit('delete', $event)">
      <section :b-section="block.data.class">
        <div v-if="block.data.blocks.length">
          <div class="villain-block-container">
            <div class="villain-block-wrapper">
              <VillainPlus
                :parent="block.uid"
                @add="$emit('add', $event)"
                @move="$emit('move', $event)" />
            </div>
          </div>
          <transition-group name="bounce">
            <div
              v-for="b in block.data.blocks"
              :key="b.uid"
              class="villain-block-container">
              <component
                :is="b.type + 'Block'"
                :block="b"
                :parent="block.uid"
                :after="b.uid"
                @add="$emit('add', $event)"
                @move="$emit('move', $event)"
                @delete="$emit('delete', $event)" />
            </div>
          </transition-group>
        </div>
        <div v-else>
          <div class="villain-block-container">
            <div class="villain-block-wrapper">
              <VillainPlus
                :parent="block.uid"
                @add="$emit('add', $event)"
                @move="$emit('move', $event)" />
            </div>
          </div>
        </div>
      </section>

      <div class="helpful-actions">
        <ButtonTiny
          @click="$refs.config.openConfig()">
          Konfigurér seksjon
        </ButtonTiny>
      </div>
    </Block>
    <BlockConfig
      ref="config">
      <template #default>
        Konfig!
      </template>
    </BlockConfig>
  </div>
</template>

<script>
import systemComponents from '../system'
import standardComponents from '.'

export default {
  name: 'ContainerBlock',

  components: {
    ...systemComponents,
    ...standardComponents
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
      showConfig: false,
      uid: null
    }
  },

  created () {
    console.debug('<ContainerBlock /> created')
    if (!this.block.data.class) {
      this.showConfig = true
    }
  },

  methods: {
    createUID () {
      return (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase()
    }
  }
}
</script>
