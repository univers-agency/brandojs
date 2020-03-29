<template>
  <Block
    :block="block"
    :parent="parent"
    @add="$emit('add', $event)"
    @move="$emit('move', $event)"
    @delete="$emit('delete', $event)">
    <div class="villain-block-description">
      Kommentar (vises ikke)
    </div>
    <div class="villain-block-comment">
      <code><pre>{{ block.data.text }}</pre></code>
    </div>
    <template slot="config">
      <KInputTextarea
        v-model="block.data.text"
        :monospace="true"
        name="data[text]"
        label="Kommentar" />
    </template>
  </Block>
</template>

<script>
import Block from '../system/Block'

export default {
  name: 'CommentBlock',

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
      uid: null,
      showConfig: false
    }
  },

  created () {
    console.debug('<CommentBlock /> created')
  }
}
</script>
