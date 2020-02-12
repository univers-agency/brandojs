<template>
  <Block
    :block="block"
    :parent="parent"
    :config="showConfig"
    @add="$emit('add', $event)"
    @move="$emit('move', $event)"
    @delete="$emit('delete', $event)"
    @toggle-config="showConfig = $event">
    <div class="villain-block-description">
      SVG
    </div>
    <div
      ref="svg"
      class="villain-svg-output"
      v-html="block.data.code">
    </div>
    <template slot="config">
      <div class="form-group">
        <label>SVG kode</label>
        <div
          ref="wrapper"
          class="villain-svg-input-wrapper">
          <textarea
            ref="txt"
            class="villain-svg-input"></textarea>
        </div>
      </div>

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
import CodeMirror from 'codemirror'
import 'codemirror/mode/htmlmixed/htmlmixed.js'
import 'codemirror/addon/display/autorefresh.js'
import Block from '../system/Block'

export default {
  name: 'SvgBlock',

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
    console.debug('<SvgBlock /> created')
  },

  mounted () {
    this.codeMirror = CodeMirror.fromTextArea(this.$refs.txt, {
      autoRefresh: true,
      mode: 'htmlmixed',
      theme: 'duotone-light',
      tabSize: 2,
      line: true,
      gutters: ['CodeMirror-linenumbers'],
      matchBrackets: true,
      showCursorWhenSelecting: true,
      styleActiveLine: true,
      lineNumbers: true,
      styleSelectedText: true
    })

    this.codeMirror.setValue(this.block.data.code)

    this.codeMirror.on('change', cm => {
      this.block.data.code = cm.getValue()
    })
  }
}
</script>
