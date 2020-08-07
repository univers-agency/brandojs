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
      <KInput
        v-model="block.data.value"
        :label="block.data.label"
        :placeholder="block.data.placeholder"
        :helpText="block.data.help_text"
        name="data[value]" />
    </Block>
    <BlockConfig
      ref="config">
      <template #default>
        <KInput
          v-model="block.data.label"
          label="Label"
          placeholder="Label"
          name="data[label]" />

        <KInput
          v-model="block.data.placeholder"
          label="Placeholder"
          placeholder="Placeholder"
          name="data[placeholder]" />

        <KInput
          v-model="block.data.help_text"
          label="Help text"
          placeholder="Help text"
          name="data[help_text]" />
      </template>
    </BlockConfig>
  </div>
</template>

<script>
import Block from '../system/Block'

export default {
  name: 'InputBlock',

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
      uid: null
    }
  },

  created () {
    console.debug('<InputBlock /> created')
  }
}
</script>
