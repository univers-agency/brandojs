<template>
  <Block
    :block="block"
    :parent="parent"
    @add="$emit('add', $event)"
    @move="$emit('move', $event)"
    @delete="$emit('delete', $event)">
    <textarea
      v-model="block.data.text"
      class="villain-blockquote-content" />
    <input
      v-model="block.data.cite"
      class="villain-blockquote-cite">
    <template slot="config">
      <div class="form-group">
        <label>CSS klasser</label>
        <input
          v-model="block.data.class"
          class="form-control"
          type="input">
      </div>
    </template>
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
