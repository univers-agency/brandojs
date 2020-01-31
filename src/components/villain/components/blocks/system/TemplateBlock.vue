<template>
  <Block
    :block="block"
    :parent="parent"
    @add="$emit('add', $event)"
    @move="$emit('move', $event)"
    @delete="$emit('delete', $event)">
    <div class="villain-template-description">
      {{ getBlockName }}
    </div>
    <component :is="buildWrapper()" />
    <template slot="config">
      <div>
        <label>Blokkvariabler</label>
        <button
          class="btn-secondary"
          type="button"
          @click.prevent="refetchVars">
          Hent variabler
        </button>
      </div>
      <div
        v-for="(v, idx) in localVars"
        :key="idx"
        class="form-group">
        <template v-show="v.type === 'string'">
          <label>{{ v.label }} — ${{ idx }}</label>
          <input
            :key="'input-' + idx"
            v-model.lazy="v.value"
            type="text"
            class="form-control" />
        </template>
      </div>

      <button
        class="btn-secondary"
        type="button"
        @click.prevent="updateVars">
        Oppdatér variabelverdier i malen
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
    </template>
  </Block>
</template>

<script>

import Vue from 'vue'
import IconRefresh from '../../icons/IconRefresh'
import cloneDeep from 'lodash/cloneDeep'

export default {
  name: 'TemplateBlock',

  components: {
    IconRefresh
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
      customClass: '',
      uid: null,
      localVars: {}
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
    }
  },

  created () {
    console.log(this.block)
    console.debug('<TemplateBlock /> created')
    this.deleteProps()
    this.createTemplateContentWrapperComponent()
    this.setLocalVars()
  },

  methods: {
    setLocalVars () {
      this.localVars = cloneDeep(this.block.data.vars)
      console.log(this.localVars, 'is now')
    },

    updateVars () {
      console.log('updating vars! :)')
      this.$set(this.block.data, 'vars', cloneDeep(this.localVars))
      this.refresh(false)
    },

    replaceRefWithSource (ref) {
      let foundTemplate = this.available.templates.find(t => t.data.id === this.block.data.id)
      let foundRef = foundTemplate.data.refs.find(r => r.name === ref.name)

      // replace our ref with foundRef
      let refIdx = this.block.data.refs.indexOf(ref)

      const newRefs = [
        ...this.block.data.refs.slice(0, refIdx),
        foundRef,
        ...this.block.data.refs.slice(refIdx + 1)
      ]

      this.$set(this.block.data, 'refs', newRefs)
      this.refresh(false)
    },

    refetchVars () {
      let foundTemplate = this.available.templates.find(t => t.data.id === this.block.data.id)
      this.$set(this.block.data, 'vars', foundTemplate.data.vars)
      this.refresh(false)
      this.setLocalVars()
    },

    /** remove props we don't want to store */
    deleteProps () {
      // only delete props here if we don't have an ID
      if (!this.block.data.hasOwnProperty('id')) {
        return
      }

      if (this.block.data.hasOwnProperty('namespace')) {
        this.$delete(this.block.data, 'namespace')
      }

      if (this.block.data.hasOwnProperty('code')) {
        this.$delete(this.block.data, 'code')
      }

      if (this.block.data.hasOwnProperty('class')) {
        this.$delete(this.block.data, 'class')
      }

      if (this.block.data.hasOwnProperty('name')) {
        this.$delete(this.block.data, 'name')
      }

      if (this.block.data.hasOwnProperty('help_text')) {
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

    replaceContent () {
      const srcWithReplacedVars = this.replaceVars()
      const srcWithReplacedVarsRefs = this.replaceRefs(srcWithReplacedVars)
      return srcWithReplacedVarsRefs
      // return this.getSourceCode()
    },

    replaceVars () {
      let srcCode = this.getSourceCode()
      let replacedVarsCode = srcCode.replace(/\${(\w+)}/g, this.replaceVar)

      return replacedVarsCode
    },

    replaceVar (exp, varName) {
      return this.findVar(varName)
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

    replaceRefs (srcCode) {
      let replacedRefsCode = srcCode.replace(/%{(\w+)}/g, this.replaceRef)

      return replacedRefsCode
    },

    replaceRef (exp, refName) {
      return `<slot name="${refName}">REPLACE</slot>`
    },

    findRef (refName) {
      return this.block.data.refs.find(r => r.name === refName)
    },

    buildData () {
      // build it by {refname: data}
      let refs = {}
      for (let i = 0; i < this.block.data.refs.length; i++) {
        let ref = this.block.data.refs[i]
        refs[ref.name] = { ...ref.data, locked: true }
      }

      return {
        refs
      }
    },

    buildSlots () {
      let template = ''
      this.copyMissingRefs()

      for (let i = 0; i < this.block.data.refs.length; i++) {
        let ref = this.block.data.refs[i]
        template += `<div slot="${ref.name}"><component is="${ref.data.type}Block" :block="refs.${ref.name}" /></div>`
      }
      return template
    },

    copyMissingRefs () {
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

      let templateSourceRefs = foundTemplate.data.refs
      let blockRefs = this.block.data.refs

      for (let i = 0; i < templateSourceRefs.length; i++) {
        if (!blockRefs.find(b => b.name === templateSourceRefs[i].name)) {
          this.block.data.refs = [
            ...this.block.data.refs,
            templateSourceRefs[i]
          ]
        }
      }
    },

    buildWrapper () {
      const builtSlots = this.buildSlots()
      let template = `
        <TemplateContentWrapper>
          ${builtSlots}
        </TemplateContentWrapper>
      `

      let data = this.buildData()

      return {
        name: 'buildwrapper',
        template,
        data () {
          return data
        }
      }
    },

    createTemplateContentWrapperComponent () {
      const replacedContent = this.replaceContent()
      Vue.component('TemplateContentWrapper', {
        template: replacedContent
      })
    }
  }
}
</script>
