<template>
  <Block
    :block="block"
    :parent="parent"
    @add="$emit('add', $event)"
    @move="$emit('move', $event)"
    @duplicate="$emit('duplicate', $event)"
    @delete="$emit('delete', $event)">
    <template #description> (vises ikke)</template>
    <div class="villain-block-comment">
      <KInputCode
        v-model="block.data.text"
        transparent
        :line-numbers="false"
        name="data[text]"
        label="Kommentar" />
    </div>
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
  },

  methods: {
    handleInput (e) {
      const start = e.target.selectionStart
      this.$nextTick(() => {
        e.target.selectionStart = e.target.selectionEnd = start
      })
    }
  }
}
</script>

<style lang="postcss" scoped>
  >>> textarea {
    background-color: transparent;
  }
</style>
