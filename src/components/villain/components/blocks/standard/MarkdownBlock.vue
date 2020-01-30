<template>
  <Block
    :block="block"
    :parent="parent"
    class="villain-extra-padding"
    @add="$emit('add', $event)"
    @move="$emit('move', $event)"
    @delete="$emit('delete', $event)">
    <div class="villain-block-description">
      Markdown
    </div>
    <div
      ref="wrapper"
      class="villain-markdown-input-wrapper">
      <textarea
        ref="txt"
        class="villain-markdown-input"></textarea>
    </div>
    <template slot="help">
      <p>
        Markdown formatering er en ryddig måte å formatere tekst til nettsider på.
        Her er noen av de vanligste formatene du kan bruke i denne blokka:
      </p>
      <code>*Kursiv tekst*</code> &rarr; <em>Kursiv tekst</em><br>
      <code>**Uthevet tekst**</code> &rarr; <strong>Uthevet tekst</strong><br>
      <code>[Lenke-tekst](https://www.nrk.no)</code> &rarr; <a href="https://nrk.no">Lenke-tekst</a><br>
    </template>
  </Block>
</template>

<script>
import CodeMirror from 'codemirror'
import 'codemirror/mode/gfm/gfm.js'
import 'codemirror/addon/display/autorefresh.js'

import Block from '../system/Block'

export default {
  name: 'MarkdownBlock',

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
      codeMirror: null
    }
  },

  created () {
    console.debug('<MarkdownBlock /> created')
  },

  mounted () {
    this.codeMirror = CodeMirror.fromTextArea(this.$refs.txt, {
      mode: 'gfm',
      theme: 'duotone-light',
      autoRefresh: true,
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
  },

  destroy () {
    // garbage cleanup
    const element = this.codeMirror.doc.cm.getWrapperElement()
    element && element.remove && element.remove()
  }
}
</script>
