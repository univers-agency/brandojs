<template>
  <Block
    v-if="!block.data.type"
    :block="block"
    :parent="parent"
    @add="$emit('add', $event)"
    @move="$emit('move', $event)"
    @duplicate="$emit('duplicate', $event)"
    @delete="$emit('delete', $event)">
    <div class="villain-block-media">
      <div
        class="villain-block-media-empty">
        <div class="choose">
          Velg medietype for blokken
        </div>
        <div class="actions">
          <ButtonTiny
            v-for="(component, idx) in block.data.available_components"
            :key="idx"
            @click="selectComponent(component)">
            {{ getComponentName(component) }}
          </ButtonTiny>
        </div>
      </div>
    </div>
  </Block>
</template>

<script>
import Block from '../system/Block'

export default {
  name: 'MediaBlock',

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

  inject: [
    'available'
  ],

  data () {
    return {
      customClass: '',
      uid: null,
      showConfig: false
    }
  },

  created () {
    console.debug('<MediaBlock /> created')
  },

  methods: {
    getComponentName ({ component }) {
      const foundBlock = this.available.blocks.find(b => b.component === component)
      if (foundBlock) {
        return foundBlock.name
      }
      return '--'
    },

    selectComponent ({ component, dataTemplate }) {
      const foundBlock = this.available.blocks.find(b => b.component === component)
      if (foundBlock) {
        this.$set(this.block, 'type', foundBlock.component.toLowerCase())
        this.$set(this.block, 'data', { ...foundBlock.dataTemplate, ...dataTemplate })
      }
    }
  }
}
</script>

<style lang="postcss" scoped>

  .choose {
    text-align: center;
    margin-bottom: 15px;
  }

  .actions {
    display: flex;
    justify-content: center;

    button {
      @space margin-x 2px;
    }
  }
</style>
