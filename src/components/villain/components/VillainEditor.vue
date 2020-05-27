<template>
  <div
    v-if="builderMode"
    class="villain-builder">
    <VillainBuilder />
  </div>
  <div
    v-else
    :class="fullscreen ? 'villain-fullscreen': ''"
    class="villain-editor">
    <div class="villain-editor-backdrop" />
    <div
      v-if="showAutosaves"
      class="villain-editor-autosave-list-popup">
      Autolagrede versjoner
      <div
        v-for="(a, idx) in autosaveEntries"
        :key="idx"
        class="villain-editor-autosave-list-popup-item">
        <div class="villain-editor-autosave-list-popup-item-date">
          <i class="fa fa-fw fa-file mr-2" /> {{ format(a.timestamp, 'nb_NO') }}
        </div>
        <ButtonSmall
          @click.native.prevent="restoreAutosave(a)">
          Gjenopprett denne versjonen
        </ButtonSmall>
      </div>
    </div>
    <div class="villain-editor-toolbar">
      <div
        class="villain-editor-instructions">
        <template v-if="showPlus">
          Trykk på "+" under for å legge til en innholdsblokk
        </template>
      </div>
      <div class="villain-editor-controls float-right">
        <div class="villain-editor-autosave-status">
          {{ autosaveStatus }}
        </div>
        <div
          v-popover="'Vis autolagrede versjoner'"
          @click="toggleAutosaves">
          <IconAutosave />
        </div>
        <div
          v-popover="showSource ? 'Lukk kildekodevisning' : 'Vis kildekode'"
          @click="toggleSource()">
          <template v-if="showSource">
            <IconClose />
          </template>
          <template v-else>
            <IconSource />
          </template>
        </div>
        <div
          v-popover="fullscreen ? 'Lukk fullskjermsmodus' : 'Vis fullskjermsmodus'"
          @click="toggleFullscreen()">
          <template v-if="fullscreen">
            <IconClose />
          </template>
          <template v-else>
            <IconFullscreen />
          </template>
        </div>
      </div>
    </div>
    <template
      v-if="showSource">
      <div class="villain-editor-source">
        <textarea
          ref="tasource"
          v-model="src" />
        <div class="d-flex justify-content-center">
          <button
            type="button"
            class="btn btn-primary mt-4"
            @click="updateSource">
            Oppdatér
          </button>
        </div>
      </div>
    </template>
    <template
      v-else>
      <BlockContainer
        v-if="blocks && blocks.length"
        :blocks="blocks"
        @add="addBlock($event)"
        @move="moveBlock($event)"
        @delete="deleteBlock"
        @order="orderBlocks" />
      <BlockContainer
        v-else
        :blocks="blocks"
        @add="addBlock($event)"
        @move="moveBlock($event)"
        @delete="deleteBlock" />
    </template>
  </div>
</template>

<script>
import Vue from 'vue'
import autosize from 'autosize'
import cloneDeep from 'lodash/cloneDeep'
import { format, register } from 'timeago.js'
import nbNO from 'timeago.js/lib/lang/nb_NO'
import { VTooltip } from 'v-tooltip'
import shortid from 'shortid'

import VillainBuilder from './VillainBuilder'
import standardComponents from './blocks/standard'
import systemComponents from './blocks/system'
import toolsComponents from './blocks/tools'
import IconAutosave from './icons/IconAutosave'
import IconClose from './icons/IconClose'
import IconFullscreen from './icons/IconFullscreen'
import IconSource from './icons/IconSource'
import STANDARD_BLOCKS from '../config/standardBlocks.js'
import fetchTemplates from '../utils/fetchTemplates.js'
import { alerts } from '../../../utils/alerts'
import { addAutoSave, getAutoSaves } from '../utils/autoSave.js'
import getTimestamp from '../utils/getTimestamp.js'
import { AUTOSAVE_INTERVAL } from '../config/autoSave.js'
import { TweenMax } from 'gsap'

for (const key in standardComponents) {
  if (standardComponents.hasOwnProperty(key)) {
    Vue.component(key, standardComponents[key])
  }
}

for (const key in systemComponents) {
  if (systemComponents.hasOwnProperty(key)) {
    Vue.component(key, systemComponents[key])
  }
}

for (const key in toolsComponents) {
  if (toolsComponents.hasOwnProperty(key)) {
    Vue.component(key, toolsComponents[key])
  }
}

export default {
  name: 'VillainEditor',

  components: {
    VillainBuilder,
    IconAutosave,
    IconClose,
    IconFullscreen,
    IconSource
  },

  directives: { popover: VTooltip },

  props: {
    builderMode: {
      type: Boolean,
      default: false
    },

    json: {
      type: [String, Array],
      default: '[]'
    },

    entryData: {
      type: Object,
      default: () => {}
    },

    maxBlocks: {
      type: Number,
      default: 0
    },

    templateMode: {
      type: Boolean,
      default: false
    },

    server: {
      type: String,
      default: ''
    },

    baseURL: {
      type: String,
      default: '/admin/api/villain/'
    },

    browseURL: {
      type: String,
      default: '/admin/api/villain/browse/'
    },

    slideshowsURL: {
      type: String,
      default: '/admin/api/villain/slideshows/'
    },

    templatesURL: {
      type: String,
      default: '/admin/api/villain/templates/'
    },

    templateSequenceURL: {
      type: String,
      default: '/admin/api/villain/templates/sequence/'
    },

    imageSeries: {
      type: String,
      default: 'post'
    },

    extraHeaders: {
      type: Object,
      default: () => {}
    },

    extraBlocks: {
      type: Array,
      default: () => []
    },

    showTemplates: {
      type: Boolean,
      default: true
    },

    visibleBlocks: {
      type: Array,
      default: () => []
    },

    templates: {
      type: String,
      default: null
    }
  },

  data () {
    return {
      autosaveEntries: [],
      autosaveStatus: '',
      blockCount: 0,
      blocks: [],
      lastAutosavedAt: null,
      needsRefresh: false,
      showAutosaves: false,
      showSource: false,
      fullscreen: false,
      availableTemplates: []
    }
  },

  computed: {
    src: {
      get () {
        const bx = cloneDeep(this.blocks)
        return JSON.stringify(bx.map(b => this.stripMeta(b)), null, 2)
      },

      set (v) {
        this.updatedSource = v
      }
    },

    showPlus () {
      if (this.maxBlocks === 0) {
        return true
      }
      if (this.maxBlocks > 0 && this.blockCount === this.maxBlocks) {
        return false
      }
      return true
    },

    availableBlocks () {
      let availableBlocks = STANDARD_BLOCKS

      if (this.extraBlocks.length) {
        availableBlocks = availableBlocks + STANDARD_BLOCKS
      }

      if (this.visibleBlocks.length) {
        // filter according to visibleBlocks
        availableBlocks = availableBlocks.filter(b => this.visibleBlocks.includes(b.component))
      }

      return availableBlocks
    }
  },

  provide () {
    const state = {}
    const available = {}
    const headers = {}
    const urls = {}

    Object.defineProperty(state, 'showPlus', {
      enumerable: true,
      get: () => this.showPlus
    })

    Object.defineProperty(state, 'showTemplates', {
      enumerable: true,
      get: () => this.showTemplates
    })

    Object.defineProperty(available, 'blocks', {
      enumerable: true,
      get: () => this.availableBlocks
    })

    Object.defineProperty(available, 'templates', {
      enumerable: true,
      get: () => this.availableTemplates
    })

    Object.defineProperty(available, 'entryData', {
      enumerable: true,
      get: () => this.entryData
    })

    Object.defineProperty(headers, 'extra', {
      enumerable: true,
      get: () => this.extraHeaders
    })

    /**
     * URLS
     */
    Object.defineProperty(urls, 'base', {
      enumerable: true,
      get: () => `${this.server}${this.baseURL}`
    })
    Object.defineProperty(urls, 'browse', {
      enumerable: true,
      get: () => `${this.server}${this.browseURL}`
    })
    Object.defineProperty(urls, 'slideshows', {
      enumerable: true,
      get: () => `${this.server}${this.slideshowsURL}`
    })
    Object.defineProperty(urls, 'templates', {
      enumerable: true,
      get: () => `${this.server}${this.templatesURL}`
    })
    Object.defineProperty(urls, 'templateSequence', {
      enumerable: true,
      get: () => `${this.server}${this.templateSequenceURL}`
    })

    return {
      vTemplateMode: this.templateMode,
      available,
      headers,
      urls,
      state,
      refresh: this.refresh
    }
  },

  watch: {
    blocks: {
      handler: function (val, oldVal) {
        this.lastEdit = getTimestamp()
        const bx = cloneDeep(val)
        if (bx.length) {
          this.blockCount = bx.length
          this.$emit('input', JSON.stringify(bx.map(b => this.stripMeta(b)), null, 2))
        } else {
          this.$emit('input', null)
        }
        return val
      },
      deep: true
    }
  },

  async created () {
    console.debug('==> VILLAIN EDITOR INITIALIZING')

    if (this.templates) {
      this.availableTemplates = await fetchTemplates(this.templates, this.extraHeaders, `${this.server}${this.templatesURL}`)
    }

    // convert data to blocks
    if (!this.json || this.json === '') {
      this.blocks = []
    } else {
      // check if it needs to be parsed!
      if (typeof (this.json) === 'object') {
        this.blocks = cloneDeep(this.json)
      } else {
        this.blocks = JSON.parse(this.json)
      }
      this.blocks = this.addUIDs()
      this.blockCount = this.blocks.length
    }

    // validate each block!
    for (let idx = 0; idx < this.blocks.length; idx++) {
      const block = this.blocks[idx]
      this.validateBlock(block)
    }

    // reconvert to start fresh if there are added props
    if (this.needsRefresh) {
      this.refresh(false)
      console.debug('==> Refreshed Villain Blocks due to missing props.')
    }

    register('nb_NO', nbNO)

    this.lastEdit = getTimestamp()

    // setup autosave interval
    setInterval(() => {
      // Only autosave if there are changes
      if (this.lastEdit > this.lastAutosavedAt) {
        this.lastAutosavedAt = getTimestamp()
        this.autosaveStatus = 'autolagrer...'
        setTimeout(() => {
          this.autosaveStatus = ''
        }, 2500)
        addAutoSave(this.blocks)
      }
    }, AUTOSAVE_INTERVAL)
  },

  mounted () {
    this.animateIn()
  },

  methods: {
    validateBlock (block) {
      const bpBlock = this.availableBlocks.find(b => b.component.toLowerCase() === block.type)
      if (bpBlock) {
        switch (block.type) {
          case 'datatable':
            if (Array.isArray(block.data)) {
              console.log('==> Converting datatable [] to new format {}')
              const rows = block.data
              this.$set(block, 'data', { rows })
              this.needsRefresh = true
            }
            break

          case 'timeline':
            if (Array.isArray(block.data)) {
              console.log('==> Converting timeline [] to new format {}')
              const rows = block.data
              this.$set(block, 'data', { rows })
              this.needsRefresh = true
            }
            break
        }

        const blueprint = bpBlock.dataTemplate
        for (const blueprintProp in blueprint) {
          if (!block.data.hasOwnProperty(blueprintProp)) {
            this.$set(block.data, blueprintProp, blueprint[blueprintProp])
            console.debug(`==> Added missing property '${blueprintProp}' to '${block.type}'`)
            this.needsRefresh = true
          }
        }
      } else {
        if (block.type === 'template') {
          if (!block.data.hasOwnProperty('multi')) {
            this.$set(block.data, 'multi', false)
          }
          if (block.data.refs && block.data.refs.length) {
            for (let idx = 0; idx < block.data.refs.length; idx++) {
              const refBlock = block.data.refs[idx].data
              this.validateBlock(refBlock)
            }
          }

          if (block.data.entries && block.data.entries.length) {
            for (let idx = 0; idx < block.data.entries.length; idx++) {
              const entry = block.data.entries[idx]

              if (!entry.hasOwnProperty('id')) {
                console.log('==> entry in TemplateBlock is lacking an `id`')
                this.$set(entry, 'id', shortid.generate())
                // this.$set(block.data, 'multi', false)
              }

              for (let xdx = 0; xdx < entry.refs.length; xdx++) {
                const refBlock = entry.refs[xdx].data
                this.validateBlock(refBlock)
              }
            }
          }
        }
      }
    },

    format (time, locale) {
      return format(time, locale)
    },

    toggleAutosaves () {
      if (this.showAutosaves) {
        this.showAutosaves = false
        return
      }
      this.autosaveEntries = getAutoSaves()
      this.showAutosaves = true
    },

    restoreAutosave (a) {
      alerts.alertConfirm('OBS!', 'Du er i ferd med å erstatte innholdet med data fra en autolagret versjon. Er du sikker på at du vil fortsette?', data => {
        if (data) {
          this.blocks = a.content
          this.showAutosaves = false
        }
      })
    },

    animateIn (speed = 1) {
      const instructions = this.$el.querySelector('.villain-editor-instructions')
      const controls = this.$el.querySelector('.villain-editor-controls')

      TweenMax.fromTo(this.$el, speed, { opacity: 0 }, { opacity: 1 })

      if (instructions) {
        TweenMax.fromTo(instructions, speed, { x: -5, opacity: 0 }, { x: 0, opacity: 1, delay: 0.9 })
      }
      if (controls) {
        TweenMax.fromTo(controls, speed, { x: -5, opacity: 0 }, { x: 0, opacity: 1, delay: 0.5 })
        TweenMax.staggerFromTo(this.$el.querySelectorAll('.villain-editor-controls > div'), speed, { x: -3, opacity: 0 }, { x: 0, opacity: 1, delay: 1.2 }, 0.1)
      }
    },

    async updateTemplates () {
      this.availableTemplates = await fetchTemplates(this.templates, this.extraHeaders, `${this.server}${this.templatesURL}`)
    },

    updateSource () {
      this.blocks = JSON.parse(this.updatedSource)
      this.blocks = this.addUIDs()
      this.toggleSource()
    },

    toggleSource () {
      if (this.showSource) {
        this.showSource = false
      } else {
        const bx = cloneDeep(this.blocks)
        this.updatedSource = JSON.stringify(bx.map(b => this.stripMeta(b)), null, 2)
        this.showSource = true
        autosize(this.$refs.tasource)
      }
    },

    refresh (animate = true) {
      const bx = cloneDeep(this.blocks)
      this.updatedSource = JSON.stringify(bx.map(b => this.stripMeta(b)), null, 2)
      this.blocks = JSON.parse(this.updatedSource)
      this.blocks = this.addUIDs()

      if (animate) {
        this.animateIn(0.5)
      }
    },

    toggleFullscreen () {
      this.fullscreen = !this.fullscreen
    },

    addUIDs () {
      return [...this.blocks].map(b => {
        return { ...b, uid: this.createUID() }
      })
    },

    createUID () {
      return (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase()
    },

    /*
    ** Strip out uid and locked properties
    **/
    stripMeta (obj) {
      if (!obj) {
        return obj
      }

      if (obj.hasOwnProperty('uid')) {
        delete obj.uid
      }

      if (obj.hasOwnProperty('locked')) {
        delete obj.locked
      }

      return obj
    },

    addBlock ({ block: blockTpl, after, parent }) {
      let block
      // a standard component blueprint
      if (blockTpl.hasOwnProperty('component')) {
        if (blockTpl.component === 'Columns' || blockTpl.component === 'Datatable') {
          block = {
            type: blockTpl.component.toLowerCase(),
            data: [...blockTpl.dataTemplate],
            uid: blockTpl.uid
          }
        } else {
          block = {
            type: blockTpl.component.toLowerCase(),
            data: { ...blockTpl.dataTemplate },
            uid: blockTpl.uid
          }
        }
      } else {
        // a template block
        block = cloneDeep(blockTpl)
      }

      // no after, no parent = + at the top OR first one if empty
      if (!after && !parent) {
        // if we have blocks, it's the top + so we add to top
        if (this.blocks.length) {
          this.blocks = [
            block,
            ...this.blocks
          ]
        } else {
          this.blocks = [
            ...this.blocks,
            block
          ]
        }
        return
      }

      if (parent) {
        // child of a column
        const mainBlock = this.blocks.find(b => {
          if (b.type === 'columns') {
            for (const key of Object.keys(b.data)) {
              const x = b.data[key]
              if (x.uid === parent) {
                return x
              }
            }
          }
        })
        let parentBlock = null
        if (mainBlock) {
          // we have the main block -- add to the correct parent
          for (const key of Object.keys(mainBlock.data)) {
            const y = mainBlock.data[key]
            if (y.uid === parent) {
              parentBlock = y
            }
          }

          if (after) {
            const p = parentBlock.data.find(b => b.uid === after)
            if (!p) {
              console.error('--- NO UID FOR "AFTER"-BLOCK')
            }
            const idx = parentBlock.data.indexOf(p)

            if (idx + 1 === parentBlock.data.length) {
              // index is last, just add to list
              parentBlock.data = [
                ...parentBlock.data,
                block
              ]
              return
            }

            // we're adding in the midst of things
            parentBlock.data = [
              ...parentBlock.data.slice(0, idx + 1),
              block,
              ...parentBlock.data.slice(idx + 1)
            ]
          } else {
            parentBlock.data = [
              block,
              ...parentBlock.data
            ]
          }
        }
        return
      }

      if (after) {
        const p = this.blocks.find(b => b.uid === after)
        if (!p) {
          console.error('--- NO UID FOR "AFTER"-BLOCK')
        }
        const idx = this.blocks.indexOf(p)

        if (idx + 1 === this.blocks.length) {
          // index is last, just add to list
          this.blocks = [
            ...this.blocks,
            block
          ]
          return
        }

        // we're adding in the midst of things
        this.blocks = [
          ...this.blocks.slice(0, idx + 1),
          block,
          ...this.blocks.slice(idx + 1)
        ]
      }
    },

    moveBlock ({ block, after, parent }) {
      this.deleteBlock(block)

      if (!after && !parent) {
        // if we have blocks, it's the top + so we add to top
        if (this.blocks.length) {
          this.blocks = [
            block,
            ...this.blocks
          ]
        } else {
          this.blocks = [
            block
          ]
        }
      }

      /*
      ** Block is moved into a column
      */
      if (parent) {
        // child of a column
        const mainBlock = this.blocks.find(b => {
          if (b.type === 'columns') {
            for (const key of Object.keys(b.data)) {
              const x = b.data[key]
              if (x.uid === parent) {
                return x
              }
            }
          }
        })

        let parentBlock = null
        if (mainBlock) {
          // we have the main block -- add to the correct parent
          for (const key of Object.keys(mainBlock.data)) {
            const y = mainBlock.data[key]
            if (y.uid === parent) {
              parentBlock = y
            }
          }

          if (after) {
            const p = parentBlock.data.find(b => b.uid === after)
            if (!p) {
              console.error('--- NO UID FOR "AFTER"-BLOCK')
            }
            const idx = parentBlock.data.indexOf(p)

            if (idx + 1 === parentBlock.data.length) {
              // index is last, just add to list
              parentBlock.data = [
                ...parentBlock.data,
                block
              ]
              return
            }

            // we're adding in the midst of things
            parentBlock.data = [
              ...parentBlock.data.slice(0, idx + 1),
              block,
              ...parentBlock.data.slice(idx + 1)
            ]
          } else {
            parentBlock.data = [
              block,
              ...parentBlock.data
            ]
          }
        }
        return
      }

      /*
      ** Block is moved after another block, but not to a columns object
      */
      if (after) {
        const p = this.blocks.find(b => b.uid === after)
        if (!p) {
          if (this.blocks.length) {
            console.error('--- NO UID FOR "AFTER"-BLOCK')
            this.blocks = [
              ...this.blocks,
              block
            ]
            return
          } else {
            this.blocks = [
              block
            ]
            return
          }
        }
        const parentIdx = this.blocks.indexOf(p)

        if (parentIdx + 1 === this.blocks.length) {
          // index is last, just add to list
          this.blocks = [
            ...this.blocks,
            block
          ]
          return
        }

        // we're adding in the midst of things
        this.blocks = [
          ...this.blocks.slice(0, parentIdx + 1),
          block,
          ...this.blocks.slice(parentIdx + 1)
        ]
      }

      // if template block, we refresh
      if (block.type === 'template') {
        this.refresh()
      }
    },

    deleteBlock ({ uid, ref }) {
      const block = this.blocks.find(b => {
        if (b.type === 'columns') {
          for (const col of b.data) {
            for (const colBlock of col.data) {
              if (colBlock.uid === uid) {
                const colIdx = col.data.indexOf(colBlock)
                col.data = [
                  ...col.data.slice(0, colIdx),
                  ...col.data.slice(colIdx + 1)
                ]
              }
            }
          }
        }
        return b.uid === uid
      })
      if (block) {
        if (ref) {
          const idx = this.blocks.indexOf(block)
          console.log('idx', idx)
          // a TemplateBlock that wants to get rid of a ref!
          const foundRef = block.data.refs.find(r => r.name === ref)
          const refIdx = block.data.refs.indexOf(foundRef)

          if (refIdx > -1) {
            this.blocks = [
              ...this.blocks.slice(0, idx),
              {
                ...block,
                data: {
                  ...block.data,
                  refs: [
                    ...block.data.refs.slice(0, refIdx),
                    { ...foundRef, deleted: true },
                    ...block.data.refs.slice(refIdx + 1)
                  ]
                }
              },
              ...this.blocks.slice(idx + 1)
            ]

            console.log(this.blocks)
          } else {
            console.log('ref not found...')
          }
        } else {
          const idx = this.blocks.indexOf(block)
          this.blocks = [
            ...this.blocks.slice(0, idx),
            ...this.blocks.slice(idx + 1)
          ]
        }
      }
    },

    orderBlocks (blocks) {
      this.blocks = [...blocks]
    }
  }

}
</script>
<style lang="postcss">
.villain-editor-backdrop {
  z-index: 25;
  background-color: theme(colors.blue);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  display: none;
}

.tooltip {
  font-size: 16px;
  display: block !important;
  z-index: 10000;

  .tooltip-inner {
    @color fg peach;
    @color bg blue;
    border-radius: 12px;
    padding: 5px 15px 5px;
  }

  .tooltip-arrow {
    width: 0;
    height: 0;
    border-style: solid;
    position: absolute;
    margin: 5px;
    border-color: theme(colors.blue);
    z-index: 1;
  }

  &[x-placement^="top"] {
    margin-bottom: 5px;

    .tooltip-arrow {
      border-width: 5px 5px 0 5px;
      border-left-color: transparent !important;
      border-right-color: transparent !important;
      border-bottom-color: transparent !important;
      bottom: -5px;
      left: calc(50% - 5px);
      margin-top: 0;
      margin-bottom: 0;
    }
  }

  &[x-placement^="bottom"] {
    margin-top: 5px;

    .tooltip-arrow {
      border-width: 0 5px 5px 5px;
      border-left-color: transparent !important;
      border-right-color: transparent !important;
      border-top-color: transparent !important;
      top: -5px;
      left: calc(50% - 5px);
      margin-top: 0;
      margin-bottom: 0;
    }
  }

  &[x-placement^="right"] {
    margin-left: 5px;

    .tooltip-arrow {
      border-width: 5px 5px 5px 0;
      border-left-color: transparent !important;
      border-top-color: transparent !important;
      border-bottom-color: transparent !important;
      left: -5px;
      top: calc(50% - 5px);
      margin-left: 0;
      margin-right: 0;
    }
  }

  &[x-placement^="left"] {
    margin-right: 5px;

    .tooltip-arrow {
      border-width: 5px 0 5px 5px;
      border-top-color: transparent !important;
      border-right-color: transparent !important;
      border-bottom-color: transparent !important;
      right: -5px;
      top: calc(50% - 5px);
      margin-left: 0;
      margin-right: 0;
    }
  }

  &.popover {
    .popover-inner {
      background: #ffffff;
      color: black;
      padding: 24px;
      border-radius: 5px;
      box-shadow: 0 5px 30px rgba(black, .1);
    }

    .popover-arrow {
      border-color: theme(colors.villain.popover);
    }
  }

  &[aria-hidden='true'] {
    visibility: hidden;
    opacity: 0;
    transition: opacity .15s, visibility .15s;
  }

  &[aria-hidden='false'] {
    visibility: visible;
    opacity: 1;
    transition: opacity .15s;
  }
}

.villain-editor {
  background-color: theme(colors.peach);
  background: repeating-linear-gradient(
    -45deg,
    #fff,
    #fff 2px,
    theme(colors.villain.stripe) 2px,
    theme(colors.villain.stripe) 2px * 2
  );
  padding-top: 1rem;
  padding-bottom: 1rem;

  &.villain-fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    z-index: 999999;
  }

  /* decrease spacing inside templates */
  [data-type="template"] .villain-block-wrapper {
    margin: 0 0 15px 0;
  }

  .villain-editor-autosave-list-popup {
    padding: 2rem 3rem;
    min-width: 650px;
    margin-left: auto;
    margin-right: 0;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: white;
    border: 1px solid #eee;
    position: fixed;
    z-index: 99999;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);

    strong {
      text-align: right;
      display: block;
      padding-bottom: 2rem;
    }

    .villain-editor-autosave-list-popup-item {
      display: flex;
      min-width: 500px;
      justify-content: space-between;
      align-items: center;
      padding-bottom: .5rem;

      .villain-editor-autosave-list-popup-item-date {
      }
    }
  }

  a.action-button {
    display: inline-block;
    height: 50px;
    border-radius: 33px;
    padding-top: 15px;
    padding-bottom: 14px;
    padding-left: 23px;
    padding-right: 23px;
    border: 1px solid theme(colors.dark);
    line-height: 1;
    font-size: 18px;
  }

  .text-mono {
    font-family: "SF Mono", "Menlo", "Monaco", "Inconsolata", "Fira Mono", "Droid Sans Mono", "Source Code Pro", monospace;
  }

  .container {
    /** OVERRIDE THIS TO PREVENT TEMPLATES FROM SCREWING UP **/
    max-width: 100%;
  }

  .villain-editor-toolbar {
    padding: 0 1rem;
    text-align: center;

    .villain-editor-instructions {
      font-size: 18px;
      padding: .1rem .5rem;
      display: inline-block;
      background-color: theme(colors.villain.blockBackground);
    }

    .villain-editor-controls {
      padding: .35rem .5rem;
      background-color: #fff;
      display: flex;
      justify-content: space-between;

      .svg-icon {
        width: 30px;

        svg {
          fill: theme(colors.peachDarkest);
          &:hover {
            fill: theme(colors.villain.main);
          }
        }
      }

      div {
        padding: 0 .2rem;

        i {
          color: theme(colors.peachDarkest);
          &:hover {
            color: theme(colors.villain.main);
          }
        }
      }
    }
  }

  .villain-editor-source {
    padding: 1rem;
    textarea {
      padding: 1rem;
      width: 100%;
      height: 100%;
      min-height: 500px;
      font-family: "SF Mono", "Menlo", "Monaco", "Inconsolata", "Fira Mono", "Droid Sans Mono", "Source Code Pro", monospace;
      border: 0;
    }
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 650ms;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

.fade-fast-enter-active, .fade-fast-leave-active {
  transition: opacity 250ms;
}
.fade-fast-enter, .fade-fast-leave-to {
  opacity: 0;
}

.bounce-enter-active {
  animation: bounce-in .5s;
}

.bounce-leave-active {
  animation: bounce-out .5s;
}

@keyframes bounce-in {
  0% {
    opacity: .5;
    transform: scale(0.85);
  }
  50% {
    opacity: .75;
    transform: scale(1.02);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes bounce-out {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  20% {
    transform: scale(1.001);
  }
  100% {
    opacity: 0;
    transform: scale(0.85);
  }
}

select.form-control {
  clear: both;
  width: 100%;
}

</style>
