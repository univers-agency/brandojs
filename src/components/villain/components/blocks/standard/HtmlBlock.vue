<template>
  <Block
    :block="block"
    :parent="parent"
    class="villain-extra-padding"
    @add="$emit('add', $event)"
    @move="$emit('move', $event)"
    @delete="$emit('delete', $event)">
    <div class="villain-block-description">
      HTML
    </div>
    <div
      ref="wrapper"
      class="villain-markdown-input-wrapper">
      <textarea
        ref="txt"
        class="villain-html-input"></textarea>
    </div>
  </Block>
</template>

<script>
import CodeMirror from 'codemirror'
import 'codemirror/mode/htmlmixed/htmlmixed.js'
import 'codemirror/addon/display/autorefresh.js'

import Block from '../system/Block'

export default {
  name: 'HtmlBlock',

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
      codeMirror: null
    }
  },

  inject: ['available'],

  created () {
    console.debug('<HtmlBlock /> created')
  },

  mounted () {
    this.codeMirror = CodeMirror.fromTextArea(this.$refs.txt, {
      mode: 'htmlmixed',
      theme: 'duotone-light',
      autoRefresh: true,
      tabSize: 2,
      line: true,
      gutters: ['CodeMirror-linenumbers'],
      matchBrackets: true,
      showCursorWhenSelecting: true,
      styleActiveLine: true,
      lineNumbers: true,
      styleSelectedText: true
    })

    this.codeMirror.setValue(this.block.data.text)

    this.codeMirror.on('change', cm => {
      this.block.data.text = cm.getValue()
    })
  }
}
</script>
