<template>
  <Block
    :block="block"
    :parent="parent"
    @add="$emit('add', $event)"
    @move="$emit('move', $event)"
    @delete="$emit('delete', $event)">
    <div class="villain-template-description">
      {{ getBlockName }}{{ block.data.multi ? ' — Multi' : '' }}
    </div>
    <div
      v-if="!block.data.multi"
      class="template-entry"
      @click="handleClick">
      <component
        :is="buildWrapper({refs: block.data.refs, vars: block.data.vars})"
        @delete="deleteBlock($event)"
        @update="updateBlock($event)" />
      <div class="entry-toolbar">
        <div class="helpful-actions">
          <TemplateConfig
            :templateId="block.data.id"
            :refs="block.data.refs"
            :vars="block.data.vars"
            @updateVars="updateVars"
            @updateRefs="updateRefs" />
        </div>
      </div>
    </div>
    <template v-else>
      <transition-group
        v-if="block.data.entries"
        v-sortable="{handle: '.template-entry', animation: 0 }"
        name="fade-move"
        tag="div"
        class="sort-container">
        <div
          v-for="entry in block.data.entries"
          :key="entry.id"
          :data-id="entry.id"
          class="template-entry"
          @click="handleClick">
          <component
            :is="buildWrapper(entry)"
            @delete="deleteBlock($event)"
            @update="updateBlock($event)" />
          <div class="entry-toolbar">
            <div class="helpful-actions">
              <ButtonTiny
                right
                @click="deleteEntry(entry)">
                Slett
              </ButtonTiny>
              <TemplateConfig
                :templateId="block.data.id"
                :entryId="entry.id"
                :refs="entry.refs"
                :vars="entry.vars"
                @updateVars="updateVars"
                @updateRefs="updateRefs" />
            </div>
          </div>
        </div>
      </transition-group>
    </template>

    <div v-if="block.data.multi">
      <div
        class="add-multi-entry"
        @click="addMultiEntry">
        Legg til nytt objekt i &laquo;{{ getBlockName }}&raquo;
      </div>
    </div>
  </Block>
</template>

<script>

import Vue from 'vue'
import TemplateConfig from './TemplateConfig'
import IconRefresh from '../../icons/IconRefresh'
import cloneDeep from 'lodash/cloneDeep'
import camelCase from 'lodash/camelCase'
import shortid from 'shortid'

export default {
  name: 'TemplateBlock',

  components: {
    IconRefresh,
    TemplateConfig
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
      showConfig: false,
      customClass: '',
      uid: null
    }
  },

  inject: [
    'available',
    'refresh'
  ],

  computed: {
    getBlockName () {
      if (this.block.data.name) {
        return this.block.data.name
      }

      let foundTemplate
      const id = this.block.data.id

      if (id) {
        foundTemplate = this.available.templates.find(t => t.data.id === id)
      }

      if (!foundTemplate) {
        return '?'
      }

      return foundTemplate.data.name
    },

    /**
     * Check if refs has `entries` key, that means we have converted it
     * to a multi.
     */
    hasEntries () {
      return Object.prototype.hasOwnProperty.call(this.block.data, 'entries')
    }
  },

  created () {
    console.debug('<TemplateBlock /> created')
    this.deleteProps()

    // if this is a multi but refs is not an array of arrays
    // we convert.

    if (this.block.data.multi && !this.hasEntries) {
      this.$set(this.block.data, 'entries', [{
        id: shortid.generate(),
        refs: this.block.data.refs,
        vars: this.block.data.vars
      }])
      delete this.block.data.refs
    }
  },

  updated () {
    console.debug('<TemplateBlock /> updated')
  },

  methods: {
    handleClick (e) {
      if (e.target.matches('[data-type="template"] *')) {
        e.preventDefault()
      }
    },

    buildWrapper (entry) {
      const replacedContent = this.replaceContent(entry)
      const builtSlots = this.buildSlots(entry.refs)

      const template = `
        <component :is="buildCmp()" :entryData="entryData">
          ${replacedContent}
          ${builtSlots}
        </component>
      `

      const data = this.buildData(entry.refs)
      const entryData = this.available.entryData

      return {
        name: 'BuildWrapper',
        template,
        created () {
          console.debug('<BuildWrapper /> created')
        },
        updated () {
          console.debug('<BuildWrapper /> updated')
        },
        data () {
          return data
        },
        methods: {
          buildCmp () {
            return {
              data () {
                return {
                  entryData: entryData
                }
              },

              template: `
                <div>${replacedContent}</div>
              `
            }
          }
        }
      }
    },

    deleteEntry (entry) {
      this.$delete(this.block.data.entries, this.block.data.entries.indexOf(entry))
    },

    replaceContent ({ refs, vars }) {
      const srcCode = this.getSourceCode()
      // replace all variables
      const srcWithReplacedVars = this.replaceVars(srcCode)
      const srcWithReplacedEntry = this.replaceEntries(srcWithReplacedVars)
      // replace all refs
      const srcWithReplacedVarsRefs = this.replaceRefs(srcWithReplacedEntry, refs)
      return srcWithReplacedVarsRefs
    },

    replaceVars (srcCode) {
      const replacedVarsCode = srcCode.replace(/\${(\w+)}/g, this.replaceVar)
      return replacedVarsCode
    },

    replaceVar (exp, varName) {
      return this.findVar(varName)
    },

    updateVars ({ newVars, entryId }) {
      if (entryId) {
        const entry = this.findEntry(entryId)
        if (entry) {
          this.$set(entry, 'vars', newVars)
        }
      } else {
        this.$set(this.block.data, 'vars', newVars)
      }
    },

    replaceEntries (srcCode) {
      if (this.available.entryData !== {}) {
        const replacedEntriesCode = srcCode.replace(/\${entry:(\w+)}/g, this.replaceEntry)
        return replacedEntriesCode
      }
      return srcCode
    },

    replaceEntry (exp, entryVar) {
      if (this.available.entryData) {
        return `<span v-popover="'\${entry:${entryVar}}'" class="villain-entry-var">${this.lookupEntryVar(entryVar)}</span>`
      } else {
        return '${entry:' + entryVar + '}'
      }
      // return `${this.available.entryData[entryVar] || 'mangler entryData'}`
    },

    lookupEntryVar (entryVar) {
      const camelCasedVar = camelCase(entryVar)
      return `{{ entryData.${camelCasedVar} }}`
      // return `${this.available.entryData[entryVar] || 'mangler entryData'}`
    },

    updateRefs ({ newRefs, entryId }) {
      if (entryId) {
        const entry = this.findEntry(entryId)
        if (entry) {
          this.$set(entry, 'refs', newRefs)
        }
      } else {
        this.$set(this.block.data, 'refs', newRefs)
      }
    },

    replaceRefs (srcCode, refs) {
      const replacedRefsCode = srcCode.replace(/%{(\w+)}/g, (exp, refName) => {
        return this.replaceRef(exp, refName, refs)
      })

      return replacedRefsCode
    },

    replaceRef (exp, refName, refs) {
      const ref = this.findRef(refName, refs)

      if (ref.deleted) {
        return ''
      }
      return `<slot name="${refName}"></slot>`
    },

    findRef (refName, refs) {
      return refs.find(r => r.name === refName)
    },

    findEntry (entryId) {
      return this.block.data.entries.find(e => e.id === entryId)
    },

    addMultiEntry () {
      const foundTemplate = this.available.templates.find(t => t.data.id === this.block.data.id)
      this.$set(this.block.data, 'entries', [
        ...this.block.data.entries, {
          id: shortid.generate(),
          refs: cloneDeep(foundTemplate.data.refs),
          vars: cloneDeep(foundTemplate.data.vars)
        }
      ])
    },

    /** remove props we don't want to store */
    deleteProps () {
      // only delete props here if we have an ID
      if (!Object.prototype.hasOwnProperty.call(this.block.data, 'id')) {
        return
      }

      if (Object.prototype.hasOwnProperty.call(this.block.data, 'namespace')) {
        this.$delete(this.block.data, 'namespace')
      }

      if (Object.prototype.hasOwnProperty.call(this.block.data, 'code')) {
        this.$delete(this.block.data, 'code')
      }

      if (Object.prototype.hasOwnProperty.call(this.block.data, 'wrapper')) {
        this.$delete(this.block.data, 'wrapper')
      }

      if (Object.prototype.hasOwnProperty.call(this.block.data, 'class')) {
        this.$delete(this.block.data, 'class')
      }

      if (Object.prototype.hasOwnProperty.call(this.block.data, 'name')) {
        this.$delete(this.block.data, 'name')
      }

      if (Object.prototype.hasOwnProperty.call(this.block.data, 'svg')) {
        this.$delete(this.block.data, 'svg')
      }

      if (Object.prototype.hasOwnProperty.call(this.block.data, 'help_text')) {
        this.$delete(this.block.data, 'help_text')
      }
    },

    getSourceCode () {
      let foundTemplate
      const id = this.block.data.id

      if (!id) {
        foundTemplate = this.available.templates.find(t => t.data.class === this.block.data.class)
      } else {
        foundTemplate = this.available.templates.find(t => t.data.id === id)
      }

      if (!foundTemplate) {
        console.error('==> missing template', this.block.data)
        return '<div>!! template not found !!</div>'
      }

      this.$set(this.block.data, 'id', foundTemplate.data.id)
      this.deleteProps()
      return foundTemplate.data.code
    },

    findVar (varName) {
      if (!this.block.data.vars) {
        return `\${${varName}}`
      }

      if (Object.prototype.hasOwnProperty.call(this.block.data.vars, varName)) {
        return this.block.data.vars[varName].value
      }

      return `\${${varName}}`
    },

    buildData (refs) {
      // build it by {refname: data}
      const newRefs = {}
      for (let i = 0; i < refs.length; i++) {
        const ref = refs[i]
        if (ref.deleted) {
          continue
        }
        newRefs[ref.name] = { ...ref.data, locked: true }
      }

      return {
        refs: newRefs,
        entryData: this.available.entryData
      }
    },

    buildSlots (refs, copyMissing = true) {
      let template = ''
      if (copyMissing) {
        this.copyMissingRefs(refs)
      }

      for (let i = 0; i < refs.length; i++) {
        const ref = refs[i]
        if (ref.deleted) {
          continue
        }
        template += `
          <div slot="${ref.name}">
            <component
              is="${ref.data.type}Block"
              data-description="${ref.description || ''}"
              data-ref="${ref.name}"
              :block="refs.${ref.name}"
              @delete="$emit('delete', {event: $event, ref: '${ref.name}'})" />
          </div>
        `
      }
      return template
    },

    copyMissingRefs (refs) {
      let foundTemplate
      const id = this.block.data.id

      if (!id) {
        foundTemplate = this.available.templates.find(t => t.data.class === this.block.data.class)
      } else {
        foundTemplate = this.available.templates.find(t => parseInt(t.data.id) === parseInt(id))
      }

      if (!foundTemplate) {
        console.error('VILLAIN: template not found')
        return
      }

      const templateSourceRefs = foundTemplate.data.refs
      const blockRefs = refs

      for (let i = 0; i < templateSourceRefs.length; i++) {
        if (!blockRefs.find(b => b.name === templateSourceRefs[i].name)) {
          refs = [
            ...refs,
            templateSourceRefs[i]
          ]
        }
      }
    },

    deleteBlock ({ ref, block }) {
      this.$emit('delete', { ...this.block, ref })
    }
  }
}
</script>
<style lang="postcss" scoped>
  .template-entry {
    margin-top: 1rem;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    background-color: #fbfbfb;
    border-radius: 10px;
  }

  .entry-toolbar {
    display: flex;
    justify-content: flex-end;
    align-items: baseline;
    padding-left: 1rem;
    padding-right: 1rem;

    > * + * {
      margin-left: 0.25rem;
    }
  }

  .add-multi-entry {
    @font mono xs/1;
    background-color: #efefef;
    padding: 1rem;
    border-top: 1px solid #dcdcdc;
    margin-top: 1rem;
    text-align: center;
    text-transform: uppercase;
    cursor: pointer;

    &:hover {
      background-color: #fafafa;
    }
  }

  >>> .villain-entry-var {
    &:hover {
      border-radius: 5px;
      background-color: yellow;
      cursor: help;
    }
  }
</style>
