<template>
</template>

<script>

import VueSlideUpDown from 'vue-slide-up-down'
import IconDropdown from '../components/icons/IconDropdown'
import CodeMirror from 'codemirror'
import updateCodeMirrorInstance from '@128technology/codemirror-liquid-mode'
import '@128technology/codemirror-liquid-mode/liquid.css'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/addon/display/autorefresh.js'
import 'codemirror/addon/mode/overlay.js'

import fetchTemplates from '../utils/fetchTemplates'
import storeTemplate from '../utils/storeTemplate'
import deleteTemplate from '../utils/deleteTemplate'
import storeTemplateSequence from '../utils/storeTemplateSequence'

export default {
  components: {
    VueSlideUpDown,
    IconDropdown
  },

  data () {
    return {
      hoveredBlock: 'Velg blokk',
      showBlockPicker: false,
      showNamer: false,
      showTemplateAttrs: false,
      codeMirror: null,
      refMirror: null,
      varMirror: null,
      refName: '',
      varName: '',
      currentTemplate: null,
      currentRef: null,
      currentVar: null,
      prevRefName: null,
      prevVarName: null,
      templates: [],
      templateSequence: [],
      namespaceOpen: [],
      selectedTemplatesForExport: []
    }
  },

  computed: {
    namespacedTemplates () {
      if (!this.templates.length) {
        return null
      }
      return this.templates.reduce((objectsByKeyValue, obj) => {
        const value = obj.data.namespace
        objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj)
        return objectsByKeyValue
      }, {})
    },

    nonGeneralNamespacedTemplates () {
      if (this.namespacedTemplates) {
        const { general, ...other } = this.namespacedTemplates
        return other
      } else {
        return null
      }
    }
  },

  inject: [
    'available',
    'headers',
    'urls'
  ],

  async mounted () {
    this.templates = await fetchTemplates('all', { authorization: `Bearer ${this.getToken()}` }, this.urls.templates)
    updateCodeMirrorInstance(CodeMirror)
    this.codeMirror = CodeMirror(document.querySelector('#builder-template'), {
      mode: 'liquid',
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

    this.refMirror = CodeMirror(document.querySelector('#builder-ref'), {
      mode: 'javascript',
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

    this.varMirror = CodeMirror(document.querySelector('#builder-var'), {
      mode: 'javascript',
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
  },

  methods: {
    exportTemplates () {
      const exportJSON = this.selectedTemplatesForExport.map(st => {
        return this.templates.find(t => t.data.class === st)
      })
      navigator.clipboard.writeText(JSON.stringify(exportJSON))
      this.$toast.success({ message: 'Kopiert til utklippstavlen' })
    },

    importTemplates () {
      navigator.clipboard.readText().then(clipText => {
        const importedTemplates = JSON.parse(clipText)
        importedTemplates.forEach(t => {
          if (!t.data?.class) {
            this.$toast.error({ message: 'Feil i modulformat. Mangler data.class' })
            return
          }
          this.$alerts.alertConfirm('OBS', `Er du sikker på at du vil importere denne modulen?<br><br>${t.data.namespace}: <strong>${t.data.class}</strong>`, async (data) => {
            if (!data) {
              return
            }
            this.storeTemplate(t)
            this.templates.push(t)
          })
        })
      })
    },

    toggleSelectedTemplateForExport (cls) {
      if (this.selectedTemplatesForExport.includes(cls)) {
        this.selectedTemplatesForExport = this.selectedTemplatesForExport.filter(t => t !== cls)
      } else {
        this.selectedTemplatesForExport.push(cls)
      }
    },

    getToken () {
      return localStorage.getItem('token')
    },

    isSelected (t) {
      return t === this.currentTemplate
    },

    dropSvg (e) {
      if (e.dataTransfer.files.length > 1) {
        this.$alerts.alertError('Feil', 'Slipp kun én fil her.')
        return
      }

      const f = e.dataTransfer.files[0]

      if (f.type !== 'image/svg+xml') {
        this.$alerts.alertError('Feil', 'Kun SVG-fil tillatt')
        return
      }

      const reader = new FileReader()

      reader.onload = event => {
        this.currentTemplate.data.svg = event.target.result
      }

      reader.readAsText(f)
    },

    createVar () {
      this.$alerts.alertPrompt('Variabelnavn', ({ data }) => {
        if (data) {
          if (!this.currentTemplate.data.hasOwnProperty('vars')) {
            this.currentTemplate.data = {
              ...this.currentTemplate.data,
              vars: {}
            }
          }
          const v = {
            type: 'text',
            value: 'Default value',
            label: 'Field name'
          }

          this.currentVar = v
          this.currentVarName = data

          this.currentTemplate.data = {
            ...this.currentTemplate.data,
            vars: {
              ...this.currentTemplate.data.vars,
              [data]: v
            }
          }
        }
      })
    },

    getOrder (sortable) {
      return this.templateSequence
    },

    storeOrder (sortable) {
      this.templateSequence = sortable.toArray()
      storeTemplateSequence(this.templateSequence, this.headers.extra, this.urls.templateSequence, this.$toast)
    },

    deleteTemplate (tpl) {
      this.$alerts.alertConfirm('OBS!', 'Er du sikker på at du vil slette denne malen?', async data => {
        if (data) {
          const result = await deleteTemplate(tpl, this.headers.extra, this.urls.templates, this.$toast)
          if (result.status === 200) {
            this.templates = await fetchTemplates('all', this.headers.extra, this.urls.templates)
          }
        }
      })
    },

    createTemplate () {
      const template = {
        type: 'template',
        data: {
          class: 'header text centered',
          code: '<article data-v=""></article>',
          help_text: 'Hjelpetekst',
          name: 'Navn på mal',
          namespace: 'general',
          svg: null,
          refs: [],
          vars: {}
        }
      }

      this.resetRef()
      this.currentTemplate = template

      this.codeMirror.setValue(template.data.code)
      this.codeMirror.refresh()
    },

    duplicateTemplate (template) {
      const newTemplate = this.$utils.clone(template)
      delete newTemplate.data.id
      newTemplate.data.name = `${newTemplate.data.name} kopi`

      this.resetRef()
      this.currentTemplate = newTemplate

      this.codeMirror.setValue(newTemplate.data.code)
      this.codeMirror.refresh()
    },

    setHover (name) {
      this.hoveredBlock = name
    },

    saveName () {
      this.currentRef.name = this.refName
      this.refName = ''
      this.showNamer = false

      this.refMirror.setValue(JSON.stringify(this.currentRef, null, 2))
      this.refMirror.refresh()

      this.currentTemplate.data.refs = [
        ...this.currentTemplate.data.refs,
        this.currentRef
      ]

      this.selectRef(this.currentRef)
    },

    saveRef () {
      // get this ref
      const newRef = JSON.parse(this.refMirror.getValue())
      // find ref to replace
      const oldRef = this.currentTemplate.data.refs.find(r => r.name === this.prevRefName)
      if (oldRef) {
        const idx = this.currentTemplate.data.refs.indexOf(oldRef)
        if (idx >= 0) {
          this.currentTemplate.data.refs = [
            ...this.currentTemplate.data.refs.slice(0, idx),
            newRef,
            ...this.currentTemplate.data.refs.slice(idx + 1)
          ]
          this.resetRef()
        }
      }
    },

    delRef (ref) {
      const idx = this.currentTemplate.data.refs.indexOf(ref)
      if (idx >= 0) {
        this.currentTemplate.data.refs = [
          ...this.currentTemplate.data.refs.slice(0, idx),
          ...this.currentTemplate.data.refs.slice(idx + 1)
        ]
        this.resetRef()
      }
    },

    saveVar () {
      // get this ref
      const newVar = JSON.parse(this.varMirror.getValue())
      // find ref to replace
      const oldVar = this.currentTemplate.data.vars[this.currentVarName]
      if (oldVar) {
        this.currentTemplate.data = {
          ...this.currentTemplate.data,
          vars: {
            ...this.currentTemplate.data.vars,
            [this.currentVarName]: newVar
          }
        }
        this.resetVar()
      } else {
        console.error('==> VillainBuilder/saveVar — var not found', this.currentVarName, this.currentTemplate.data.vars)
      }
    },

    resetVar () {
      this.currentVar = {}
      this.currentVarName = ''
      this.prevVarName = null
      this.varMirror.setValue('')
    },

    resetRef () {
      this.currentRef = {}
      this.prevRefName = null
      this.refMirror.setValue('')
    },

    addBlock (b) {
      const ref = {
        name: b.component.toUpperCase(),
        data: { type: b.component.toLowerCase(), data: b.dataTemplate },
        description: ''
      }

      this.currentRef = { ...ref }
      this.showNamer = true
      this.showBlockPicker = false
    },

    selectTemplate (t) {
      this.resetRef()
      this.currentTemplate = t
      this.codeMirror.setValue(this.currentTemplate.data.code)
      this.codeMirror.refresh()
    },

    selectRef (r) {
      this.currentRef = { ...r }
      this.prevRefName = this.currentRef.name

      this.refMirror.setValue(JSON.stringify(this.currentRef, null, 2))
      this.refMirror.refresh()
    },

    selectVar (v) {
      this.currentVar = v
      this.prevVarName = this.currentVar
      this.currentVarName = this.currentVar

      this.varMirror.setValue(JSON.stringify(this.currentTemplate.data.vars[this.currentVar], null, 2))
      this.varMirror.refresh()
    },

    async saveTemplate () {
      this.currentTemplate = {
        ...this.currentTemplate,
        data: {
          ...this.currentTemplate.data,
          code: this.codeMirror.getValue()
        }
      }

      const result = await storeTemplate(this.currentTemplate, this.headers.extra, this.urls.templates, this.$toast)
      if (result.status === 200) {
        this.templates = await fetchTemplates('all', this.headers.extra, this.urls.templates)
      }
    }
  }
}
</script>

<style lang="postcss" scoped>
.mb-2 {
  margin-bottom: 15px;
}

.villain-builder-wrapper {
  display: grid;

  grid-template-areas:
    "header header"
    "content aside_content"
    "refs aside_refs"
    "vars aside_vars"
    "footer footer";

  grid-template-columns: minmax(0, 1fr) 250px;
  grid-template-rows: min-content 1fr auto auto 50px;
  grid-gap: 10px;
  height: 100%;

  .text-mono {
    font-family: "SF Mono", "Menlo", "Monaco", "Inconsolata", "Fira Mono", "Droid Sans Mono", "Source Code Pro", monospace;
  }

  .villain-builder-editor-wrapper {
    grid-area: content;
  }

  .villain-builder-refs {
    grid-area: refs;
  }

  .villain-builder-vars {
    grid-area: vars;
  }

  .villain-builder-footer {
    grid-area: footer;
    align-self: center;
    border-top: 1px solid gray;
    padding-top: 10px;
    padding-bottom: 10px;

    display: flex;
    justify-content: space-between;

    button.save {
      display: block;
    }
  }

  .villain-builder-header {
    grid-area: header;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;

    border-bottom: 1px solid gray;
    padding-top: 10px;
    padding-bottom: 10px;

    .villain-builder-svg {
      display: inline-block;
      width: 250px !important;

      >>> svg {
        width: 250px !important;
        height: 100% !important;
      }

      .villain-builder-svg-drop {
        width: 250px;
        height: 85px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: theme(colors.peach);
      }
    }
  }

  aside {
    &.villain-builder-content-aside {
      grid-area: aside_content;
    }

    &.villain-builder-refs-aside {
      grid-area: aside_refs;
    }

    &.villain-builder-vars-aside {
      grid-area: aside_vars;
    }

    .villain-builder-aside-header {
      display: block;
      border-bottom: 1px solid gray;
      background-color: theme(colors.peach);
      text-align: center;
      padding-top: .5rem;
      padding-bottom: .5rem;
      margin-bottom: 1rem;
    }

    .template-namespace {
      cursor: pointer;
      background-color: theme(colors.blue);
      text-align: center;
      font-weight: 300;
      color: theme(colors.peach);
      padding-top: 15px;
      padding-bottom: 15px;
      margin-bottom: 5px;
      position: relative;
      height: 58px;

      strong {
        position: absolute;
        left: 0;
        width: 100%;
      }

      .svg-icon {
        width: 30px;
        height: 30px;
        float: left;
        margin-right: 30px;
        margin-left: 15px;
        fill: theme(colors.peach);
      }
    }

    ul {
      margin: 0;
      padding: 0;
      li {
        font-size: 17px;
        font-weight: 400;
        cursor: pointer;
        list-style-type: none;
        text-align: center;
        margin-bottom: .5rem;
        z-index: 9999;
        background-color: black;
        color: white;
        position: relative;

        &.selected {
          background-color: theme(colors.blue);
        }

        .template-svg {
          >>> svg {
            width: 100%;
            height: 100%;
          }
        }

        > svg {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translate(-25px, -50%);
          color: black;
        }

        .template-class {
          padding-top: 15px;
          padding-bottom: 15px;
          padding-left: 10px;
          padding-right: 10px;
        }
      }
    }
  }

  .padded {
    padding-top: 15px;
    padding-bottom: 15px;
    padding-left: 10px;
    padding-right: 10px;
  }

  .villain-builder-block-attributes {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    margin-right: 1rem;

    label {
      font-size: 80%;
      margin-bottom: 0;
      margin-right: 1rem;
    }
    input {
      font-size: 80%;
      width: 135px;
      margin-right: 1rem;

      &:nth-of-type(3) {
        width: 80px;
      }

      &:nth-of-type(4) {
        width: 100%;
        margin-right: 0;
      }
    }
  }

  .villain-builder-block-picker-namer {
    display: flex;
    flex-direction: row;
    align-items: center;
    float: left;

    label {
      margin-bottom: 0;
      margin-right: 1rem;
    }
    input {
      width: 300px;
      margin-right: 1rem;
    }
  }

  .villain-builder-block-picker {
    display: flex;
    float: left;

    .villain-builder-block-picker-available {
      display: flex;
      align-items: center;
    }

    .villain-builder-block-picker-header {
      align-self: center;
      font-size: 80%;
    }
    .villain-editor-plus-available-block {
      cursor: pointer;
      background-color: lightgray;
      padding: 4px 8px;
      margin-right: 5px;
    }
  }
}

.villain-builder-editor-wrapper {
  .villain-builder-editor {
    width: 100%;
    height: 100%;
    position: relative;
  }
}

.villain-builder-refs {
  .villain-builder-ref {
    width: 100%;
    height: 100%;
    position: relative;
  }
}

.btn-negative {
  @color fg peach;
  border: 1px solid theme(colors.peach);
  border: 1px solid #0047FF;
  margin-top: 15px;
  background-color: transparent;
  display: block;
  width: 100%;
  padding: 15px;
}
</style>
