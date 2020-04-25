<template>
  <div class="villain-builder-wrapper">
    <div class="villain-builder-header">
      <span class="text-mono">
        <template v-if="currentTemplate">
          Editérer {<strong> {{ currentTemplate.data.class }} </strong>}
          <ButtonSmall
            position="static"
            @click.native="deleteTemplate(currentTemplate)">
            Slett
          </ButtonSmall>
        </template>
      </span>
      <div
        v-if="currentTemplate"
        class="villain-builder-svg">
        <template v-if="currentTemplate.data.svg">
          <div
            @drop.prevent="dropSvg"
            @dragover.prevent
            v-html="currentTemplate.data.svg" />
        </template>
        <template v-else>
          <div
            class="villain-builder-svg-drop"
            @drop.prevent="dropSvg"
            @dragover.prevent>
            Legg til ikon
          </div>
        </template>
      </div>
    </div>

    <div class="villain-builder-editor-wrapper">
      <div
        id="builder-template"
        class="villain-builder-editor">
      </div>
    </div>

    <aside class="villain-builder-content-aside">
      <div class="villain-builder-aside-header">
        Maler
      </div>

      <button
        key="createTemplateButton"
        type="button"
        class="btn btn-primary btn-block mb-2"
        @click="createTemplate">
        Ny mal
      </button>
      <div
        v-for="(templates, key) in nonGeneralNamespacedTemplates"
        :key="key"
        class="template-group"
        @click="namespaceOpen.includes(key) ? namespaceOpen.splice(namespaceOpen.indexOf(key), 1) : namespaceOpen.push(key)">
        <div
          class="template-namespace">
          <IconDropdown :open="namespaceOpen.includes(key)" /><strong>{{ key.toUpperCase() }}</strong>
        </div>
        <VueSlideUpDown
          :active="namespaceOpen.includes(key)"
          :duration="350">
          <transition-group
            v-sortable="{handle: 'li', animation: 500, store: {get: getOrder, set: storeOrder}}"
            name="fade-move"
            tag="ul">
            <li
              v-for="t in templates"
              :key="t && t.data && t.data.id"
              :data-id="t && t.data && t.data.id"
              class="template-entry"
              :class="isSelected(t) ? 'selected' : ''"
              @click.stop="selectTemplate(t)">
              <template v-if="t.data.svg">
                <div
                  class="template-svg"
                  v-html="t.data.svg" />
              </template>
              <div class="template-class">
                {{ t.data.name }}
              </div>
            </li>
          </transition-group>
        </VueSlideUpDown>
      </div>
      <template v-if="namespacedTemplates && namespacedTemplates.general">
        <div class="template-group">
          <transition-group
            v-sortable="{handle: 'li', animation: 500, store: {get: getOrder, set: storeOrder}}"
            name="fade-move"
            tag="ul">
            <li
              v-for="(tp, idx) in namespacedTemplates.general"
              :key="'general-' + idx"
              :data-id="tp.data && tp.data.id"
              class="template-entry"
              :class="isSelected(tp) ? 'selected' : ''"
              @click="selectTemplate(tp)">
              <template v-if="tp.data.svg">
                <div
                  class="template-svg"
                  v-html="tp.data.svg" />
              </template>
              <div class="template-class">
                {{ tp.data.name }}
              </div>
            </li>
          </transition-group>
        </div>
      </template>
    </aside>

    <div class="villain-builder-refs">
      <div
        id="builder-ref"
        class="villain-builder-ref">
      </div>
    </div>

    <div class="villain-builder-vars">
      <div
        id="builder-var"
        class="villain-builder-var">
      </div>
    </div>

    <aside class="villain-builder-refs-aside">
      <template v-if="currentTemplate && currentTemplate.data.refs">
        <div class="villain-builder-aside-header">
          REFs
        </div>
        <ul>
          <button
            type="button"
            :disabled="currentTemplate === null"
            class="btn btn-primary btn-block mb-2"
            @click="showBlockPicker = true">
            Ny REF
          </button>
          <li
            v-for="ref in currentTemplate.data.refs"
            :key="ref.name"
            class="text-mono padded"
            @click="selectRef(ref)">
            %{<strong>{{ ref.name }}</strong>}
            <button
              v-if="prevRefName === ref.name"
              type="button"
              class="btn btn-negative btn-sm"
              @click.prevent.stop="saveRef()">
              Lagre
            </button>
            <button
              v-if="prevRefName === ref.name"
              type="button"
              class="btn btn-negative btn-sm"
              @click.prevent.stop="delRef(ref)">
              Slett
            </button>
          </li>
        </ul>
      </template>
    </aside>

    <aside class="villain-builder-vars-aside">
      <template v-if="currentTemplate">
        <div class="villain-builder-aside-header">
          VARs
        </div>
        <ul>
          <button
            type="button"
            :disabled="currentTemplate === null"
            class="btn btn-primary btn-block mb-2"
            @click="createVar()">
            Ny VAR
          </button>
          <li
            v-for="(val, variable) in currentTemplate.data.vars"
            :key="variable"
            class="text-mono padded"
            @click="selectVar(variable)">
            ${<strong>{{ variable }}</strong>}
            <button
              v-if="prevVarName === variable"
              type="button"
              class="btn btn-negative btn-sm"
              @click.prevent.stop="saveVar()">
              Lagre
            </button>
          </li>
        </ul>
      </template>
    </aside>
    <div class="villain-builder-footer">
      <div
        v-if="!showBlockPicker && !showNamer && currentTemplate"
        class="villain-builder-block-attributes">
        <label class="float-left">Klasse</label>
        <input
          v-model="currentTemplate.data.class"
          class="form-control float-left d-inline"
          type="input">
        <label class="float-left">Navn</label>
        <input
          v-model="currentTemplate.data.name"
          class="form-control float-left d-inline"
          type="input">
        <label class="float-left">Kategori</label>
        <input
          v-model="currentTemplate.data.namespace"
          class="form-control float-left d-inline"
          type="input">
        <label class="float-left">Hjelpetekst</label>
        <input
          v-model="currentTemplate.data.help_text"
          class="form-control float-left d-inline"
          type="input">
        <label class="float-left">Multi</label>
        <input
          v-model="currentTemplate.data.multi"
          class="form-control float-left d-inline"
          type="checkbox">
        <label class="float-left">Wrapper</label>
        <textarea
          v-model="currentTemplate.data.wrapper"
          class="form-control float-left d-inline"
          rows="3"></textarea>
      </div>
      <div
        v-if="showBlockPicker"
        class="villain-builder-block-picker">
        <div class="villain-builder-block-picker-available">
          <div
            v-for="b in available.blocks"
            :key="b.name"
            class="villain-editor-plus-available-block"
            @mouseover="setHover(b.name)"
            @click="addBlock(b)">
            <div>
              <i
                :class="b.icon"
                class="fa fa-fw" />
            </div>
          </div>
        </div>
        <div class="villain-builder-block-picker-header">
          &rarr; {{ hoveredBlock }}
        </div>
      </div>
      <div
        v-if="showNamer"
        class="villain-builder-block-picker-namer">
        <label class="float-left">Navngi ref</label>
        <input
          v-model="refName"
          class="form-control float-left d-inline"
          type="input">
        <button
          type="button"
          class="btn btn-outline-secondary float-left"
          @click="saveName">
          Opprett ref
        </button>
      </div>
      <div class="villain-builder-save-wrapper">
        <button
          v-shortkey="['meta', 's']"
          type="button"
          class="btn btn-outline-primary"
          @shortkey="saveTemplate()"
          @click="saveTemplate()">
          Lagre (⌘S)
        </button>
      </div>
    </div>
  </div>
</template>

<script>

import VueSlideUpDown from 'vue-slide-up-down'
import IconDropdown from '../components/icons/IconDropdown'
import CodeMirror from 'codemirror'
import 'codemirror/mode/htmlmixed/htmlmixed.js'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/addon/display/autorefresh.js'

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
      namespaceOpen: []
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
    this.codeMirror = CodeMirror(document.querySelector('#builder-template'), {
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
    getToken () {
      return localStorage.getItem('token')
    },

    isSelected (t) {
      return t === this.currentTemplate
    },

    dropSvg (e) {
      console.log(e.dataTransfer.files)
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
        console.log(event.target.result)
        this.currentTemplate.data.svg = event.target.result
      }

      reader.readAsText(f)
    },

    createVar () {
      this.$alerts.alertPrompt('Variabelnavn', ({ data }) => {
        if (data) {
          console.log(data)
          if (!this.currentTemplate.data.hasOwnProperty('vars')) {
            this.currentTemplate.data = {
              ...this.currentTemplate.data,
              vars: {}
            }
          }
          const v = {
            type: 'string',
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
        data: { type: b.component.toLowerCase(), data: b.dataTemplate }
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

        &.selected {
          background-color: theme(colors.blue);
        }

        .template-svg {
          >>> svg {
            width: 100%;
            height: 100%;
          }
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
