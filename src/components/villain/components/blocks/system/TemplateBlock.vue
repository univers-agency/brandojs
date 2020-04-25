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
    <template
      v-if="!block.data.multi">
      <component
        :is="buildWrapper({refs: block.data.refs, vars: block.data.vars})"
        @delete="deleteBlock($event)"
        @update="updateBlock($event)" />
    </template>
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
          class="template-entry">
          <component
            :is="buildWrapper(entry)"
            @delete="deleteBlock($event)"
            @update="updateBlock($event)" />
          <div class="entry-toolbar">
            <div>
              <ButtonTiny right>
                Slett
              </ButtonTiny>
            </div>
            <TemplateConfig :entry="entry" />
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

    <!-- <template slot="config">
      <div>
        <label>Blokkvariabler</label>
        <button
          class="btn-secondary"
          type="button"
          @click.prevent="refetchVars">
          Hent variabler på nytt
        </button>
      </div>

      <div
        v-for="(value, key) in block.data.vars"
        :key="key">
        <div class="field-wrapper">
          <div class="label-wrapper">
            <label class="control-label">
              {{ value.label }}
            </label>
          </div>
          <input
            :name="`vars[${key}]`"
            :value="localVars[key].value"
            type="text"
            @input="localVars[key].value = $event.target.value">
        </div>
      </div>

      <button
        class="btn-secondary"
        type="button"
        @click.prevent="updateVars">
        Lagre nye variabelverdier
      </button>

      <div class="form-group">
        <label>Refererte blokker [{{ block.data.refs.length }}]</label>
        <button
          v-for="(ref, idx) in block.data.refs"
          :key="idx"
          type="button"
          class="btn-secondary"
          @click="replaceRefWithSource(ref)">
          {{ ref.name }} — Erstatt med referanseblokk
        </button>
      </div>
    </template> -->
  </Block>
</template>

<script>

import Vue from 'vue'
import TemplateConfig from './TemplateConfig'
import IconRefresh from '../../icons/IconRefresh'
import cloneDeep from 'lodash/cloneDeep'
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
    this.setLocalVars()

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

  methods: {
    buildWrapper (entry) {
      console.log('==> buildWrapper()')
      const replacedContent = this.replaceContent(entry)
      this.createTemplateContentWrapperComponent(replacedContent)
      const builtSlots = this.buildSlots(entry.refs)
      const template = `
        <TemplateContentWrapper>
          ${replacedContent}
          ${builtSlots}
        </TemplateContentWrapper>
      `

      const data = this.buildData(entry.refs)

      return {
        name: 'buildwrapper',
        template,
        data () {
          return data
        }
      }
    },

    replaceContent ({ refs, vars }) {
      console.log('=> replaceContent')
      // replace all variables
      const srcWithReplacedVars = this.replaceVars()
      // replace all refs
      const srcWithReplacedVarsRefs = this.replaceRefs(srcWithReplacedVars, refs)
      return srcWithReplacedVarsRefs
    },

    replaceVars () {
      console.log('=> replaceVars')
      const srcCode = this.getSourceCode()
      const replacedVarsCode = srcCode.replace(/\${(\w+)}/g, this.replaceVar)

      return replacedVarsCode
    },

    replaceVar (exp, varName) {
      return this.findVar(varName)
    },

    replaceRefs (srcCode, refs) {
      console.log('=> replaceRefs')
      const replacedRefsCode = srcCode.replace(/%{(\w+)}/g, (exp, refName) => {
        return this.replaceRef(exp, refName, refs)
      })

      return replacedRefsCode
    },

    replaceRef (exp, refName, refs) {
      const ref = this.findRef(refName, refs)

      console.log(ref, refs, refName)

      if (ref.deleted) {
        return ''
      }
      return `<slot name="${refName}"></slot>`
    },

    findRef (refName, refs) {
      return refs.find(r => r.name === refName)
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

    setLocalVars () {
      console.log('=> setLocalVars()')
      this.localVars = cloneDeep(this.block.data.vars)
    },

    updateVars () {
      console.log('=> updateVars()')
      console.log(this.localVars)
      this.$set(this.block.data, 'vars', cloneDeep(this.localVars))
      this.refresh(false)
    },

    replaceRefWithSource (ref) {
      console.log('=> replaceRefWithSource')
      const foundTemplate = this.available.templates.find(t => t.data.id === this.block.data.id)
      const foundRef = foundTemplate.data.refs.find(r => r.name === ref.name)

      // replace our ref with foundRef
      const refIdx = this.block.data.refs.indexOf(ref)

      const newRefs = [
        ...this.block.data.refs.slice(0, refIdx),
        foundRef,
        ...this.block.data.refs.slice(refIdx + 1)
      ]

      this.$set(this.block.data, 'refs', newRefs)
      this.refresh(false)
    },

    refetchVars () {
      console.log('=> refetchVars')
      const foundTemplate = this.available.templates.find(t => t.data.id === this.block.data.id)
      this.$set(this.block.data, 'vars', foundTemplate.data.vars)
      this.refresh(false)
      this.setLocalVars()
    },

    /** remove props we don't want to store */
    deleteProps () {
      console.log('=> deleteProps')
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
      console.log('=> getSourceCode')
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

      if (this.block.data.vars.hasOwnProperty(varName)) {
        return this.block.data.vars[varName].value
      }

      return `\${${varName}}`
    },

    buildData (refs) {
      console.log('buildData')
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
        refs: newRefs
      }
    },

    buildSlots (refs, copyMissing = true) {
      console.log('=> buildSlots')
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
              data-ref="${ref.name}"
              :block="refs.${ref.name}"
              @delete="$emit('delete', {event: $event, ref: '${ref.name}'})" />
          </div>
        `
      }
      return template
    },

    copyMissingRefs (refs) {
      console.log('=> copyMissingRefs')
      let foundTemplate
      const id = this.block.data.id

      if (!id) {
        foundTemplate = this.available.templates.find(t => t.data.class === this.block.data.class)
      } else {
        foundTemplate = this.available.templates.find(t => parseInt(t.data.id) === parseInt(this.block.data.id))
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

    /**
     * This wrapper has all the slot placeholders
     * When we inject our builtSlots into this, they will populate automatically
     */
    createTemplateContentWrapperComponent (content) {
      console.log('==> createTemplateContentWrapperComponent()')
      Vue.component('TemplateContentWrapper', {
        template: `<div>${content}</div>`
      })
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
    letter-spacing: -1px;
    text-transform: uppercase;
    cursor: pointer;

    &:hover {
      background-color: #fafafa;
    }
  }
</style>
