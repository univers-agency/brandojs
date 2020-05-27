<template>
  <KFieldBase
    :name="name"
    :label="label"
    :rules="rules"
    :maxlength="maxlength"
    :helpText="helpText"
    :value="value">
    <template v-slot>
      <div
        ref="wrapper"
        class="code-input-wrapper"
        :class="{ transparent }">
        <textarea
          ref="txt"
          :rows="rows"
          class="code-input"></textarea>
      </div>
      <input
        :id="id"
        ref="input"
        v-model="innerValue"
        :name="name"
        type="hidden">
    </template>
  </KFieldBase>
</template>

<script>
import CodeMirror from 'codemirror'
import 'codemirror/mode/htmlmixed/htmlmixed.js'
import 'codemirror/addon/display/autorefresh.js'

export default {
  props: {
    disabled: {
      type: Boolean,
      default: false
    },

    transparent: {
      type: Boolean,
      default: false
    },

    lineNumbers: {
      type: Boolean,
      default: true
    },

    rows: {
      type: Number,
      default: 5
    },

    helpText: {
      type: String,
      default: null
    },

    label: {
      type: String,
      required: false,
      default: null
    },

    maxlength: {
      type: Number,
      default: null
    },

    placeholder: {
      type: String,
      required: false,
      default: null
    },

    rules: {
      type: String,
      default: null
    },

    monospace: {
      type: Boolean,
      default: false
    },

    invert: {
      type: Boolean,
      default: false
    },

    name: {
      type: String,
      required: true
    },

    value: {
      type: [String, Number],
      default: ''
    }
  },

  data () {
    return {
      editor: null,
      customClass: '',
      linkUrl: null,
      linkMenuIsActive: false,
      actionButtonUrl: null,
      actionButtonMenuIsActive: false
    }
  },

  computed: {
    id () {
      return this.name.replace('[', '_').replace(']', '_')
    },

    innerValue: {
      get () { return this.value },
      set (innerValue) { this.$emit('input', innerValue) }
    }
  },

  created () {
    if (this.value) {
      this.innerValue = this.value
    }

    this.$nextTick(() => {
      this.bindEditor()
    })
  },

  destroy () {
    // garbage cleanup
    const element = this.codeMirror.doc.cm.getWrapperElement()
    element && element.remove && element.remove()
  },

  methods: {
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
        lineNumbers: this.lineNumbers,
        styleSelectedText: true
      })

      this.codeMirror.setValue(this.innerValue)

      this.codeMirror.on('change', cm => {
        this.innerValue = cm.getValue()
      })
    },

    focus () {
      this.$refs.txt.focus()
    }
  }
}

</script>
<style lang="postcss" scoped>
  .code-input-wrapper {
    width: 100%;

    &.transparent {
      >>> .CodeMirror {
        background-color: transparent !important;
      }
    }

    >>> .CodeMirror {
      background-color: theme(colors.input) !important;

      .CodeMirror-scroll {
        overflow: visible !important;
      }
    }
  }

  .code-input {
    border: 0;
    width: 100%;
    font-family: "SF Mono", "Menlo", "Monaco", "Inconsolata", "Fira Mono", "Droid Sans Mono", "Source Code Pro", monospace;
  }
</style>
