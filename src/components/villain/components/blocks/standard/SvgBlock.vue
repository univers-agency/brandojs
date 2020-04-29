<template>
  <Block
    ref="block"
    :block="block"
    :parent="parent"
    @add="$emit('add', $event)"
    @move="$emit('move', $event)"
    @delete="$emit('delete', $event)">
    <div class="villain-block-description">
      SVG
    </div>
    <div class="villain-block-svg">
      <div
        v-if="block.data.code"
        ref="svg"
        class="villain-svg-output"
        v-html="block.data.code">
      </div>
      <div
        v-else
        class="villain-block-svg-empty">
        <FontAwesomeIcon
          icon="draw-polygon"
          size="6x" />
      </div>
      <div class="helpful-actions">
        <ButtonTiny
          @click="config">
          Konfigurér SVG
        </ButtonTiny>
      </div>
    </div>

    <template slot="config">
      <div class="form-group mb-2">
        <label>SVG kode</label>
        <div
          ref="wrapper"
          class="villain-svg-input-wrapper">
          <textarea
            ref="txt"
            rows="5"
            class="villain-svg-input"></textarea>
        </div>
      </div>

      <KInput
        v-model="block.data.class"
        name="data[class]"
        label="CSS klasser" />
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

  methods: {
    config () {
      this.$refs.block.openConfig()
      this.$nextTick(() => {
        this.bindEditor()
      })
    },

    bindEditor () {
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
}
</script>

<style lang="postcss" scoped>
  .villain-block-svg {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .villain-block-svg-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    svg {
      height: auto;
      max-width: 250px;
    }
  }

  .villain-svg-output {
    >>> svg {
      width: 100%;
      height: 100%;
      max-width: 500px;
    }
  }
</style>
