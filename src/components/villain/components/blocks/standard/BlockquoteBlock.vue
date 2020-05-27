<template>
  <Block
    ref="block"
    :block="block"
    :parent="parent"
    @add="$emit('add', $event)"
    @move="$emit('move', $event)"
    @delete="$emit('delete', $event)">
    <KInputTextarea
      v-model="block.data.text"
      label="Sitat"
      name="data[text]" />
    <KInput
      v-model="block.data.cite"
      label="Sitatforfatter"
      name="data[cite]" />
  </Block>
</template>

<script>
import Block from '../system/Block'

export default {
  name: 'BlockquoteBlock',

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
      uid: null
    }
  },

  created () {
    console.debug('<BlockquoteBlock /> created')
  }
}
</script>
