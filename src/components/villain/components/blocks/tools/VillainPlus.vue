<template>
  <transition @appear="appear">
    <div
      ref="plus"
      class="villain-editor-plus">
      <div
        key="plus"
        :class="active ? 'villain-editor-plus-active' : 'villain-editor-plus-inactive'">
        <a
          ref="plusLink"
          @click="clickPlus">
          <template v-if="draggingOver">
            Flytt blokken hit
          </template>
          <template v-if="!draggingOver">
            <svg
              :class="active ? 'villain-svg-plus-open' : ''"
              class="villain-svg-plus"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 300 300">
              <circle
                cx="150"
                cy="150"
                r="142.7"
                stroke="#FFF"
                stroke-miterlimit="10" />
              <path
                fill="#FFF"
                d="M224.3 133.3v31.3H166v58.3h-31.3v-58.3H76.4v-31.3h58.3V75H166v58.3h58.3z" />
            </svg>
          </template>
        </a>

        <VueSlideUpDown
          :active="active"
          :duration="350">
          <div class="villain-editor-plus-block-name">
            {{ hoveredBlock }}
          </div>
          <div
            v-if="!vTemplateMode"
            ref="blocks"
            class="villain-editor-plus-available-blocks">
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

            <div
              class="villain-editor-plus-available-block"
              @mouseover="setHover('moduler')"
              @click="showTemplates">
              <div>
                <i class="fa fa-fw fa-window-restore" />
              </div>
            </div>
          </div>
        </VueSlideUpDown>
        <VueSlideUpDown
          :active="showingTemplates"
          :duration="350">
          <div
            v-if="namespacedTemplates"
            ref="templates"
            class="villain-editor-plus-available-templates">
            <div
              v-for="(tpls, key) in namespacedTemplates"
              v-if="key !== 'general'"
              :key="key"
              @click="namespaceOpen === key ? namespaceOpen = null : namespaceOpen = key">
              <div
                class="villain-editor-plus-available-templates-namespace">
                <IconDropdown :open="namespaceOpen === key" /><strong>{{ key.toUpperCase() }}</strong>
              </div>
              <VueSlideUpDown
                :active="namespaceOpen === key"
                :duration="350">
                <div
                  v-for="(tp, idx) in tpls"
                  :key="'key-' + idx"
                  class="villain-editor-plus-available-template"
                  @click="addTemplate(tp)">
                  <div class="villain-editor-plus-available-templates-title">{{ tp.data.name }}</div>
                  <div class="villain-editor-plus-available-templates-help">{{ tp.data.help_text }}</div>
                </div>
              </VueSlideUpDown>
            </div>

            <div
              v-for="(tp, idx) in namespacedTemplates.general"
              :key="'general-' + idx"
              class="villain-editor-plus-available-template"
              @click="addTemplate(tp)">
              <div class="villain-editor-plus-available-templates-title">{{ tp.data.name }}</div>
              {{ tp.data.help_text }}
            </div>
          </div>
          <div
            v-else
            class="mt-4">
            Ingen registrerte maler.
          </div>
        </VueSlideUpDown>
      </div>
    </div>
  </transition>
</template>

<script>

import VueSlideUpDown from 'vue-slide-up-down'
import { TweenMax } from 'gsap'
import IconDropdown from '../../icons/IconDropdown'

function createUID () {
  return (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase()
}

export default {
  name: 'VillainPlus',

  components: {
    VueSlideUpDown,
    IconDropdown
  },

  props: {
    parent: {
      type: String,
      default: null
    },

    after: {
      type: String,
      default: null
    }
  },

  data () {
    return {
      active: false,
      draggingOver: false,
      namespaceOpen: null,
      showingTemplates: false,
      hoveredBlock: 'Velg blokktype'
    }
  },

  computed: {
    namespacedTemplates () {
      if (!this.available.templates.length) {
        return null
      }
      return this.available.templates.reduce((objectsByKeyValue, obj) => {
        const value = obj.data.namespace
        objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj)
        return objectsByKeyValue
      }, {})
    }
  },

  inject: [
    'available',
    'vTemplateMode'
  ],

  created () {
    console.debug('<VillainPlus /> created')
  },

  mounted () {
    this.$refs.plusLink.addEventListener('dragenter', this.dragEnter)
    this.$refs.plusLink.addEventListener('dragover', this.dragOver)
    this.$refs.plusLink.addEventListener('dragleave', this.dragLeave)
    this.$refs.plusLink.addEventListener('drop', this.onDrop)
  },

  methods: {
    appear (el, done) {
      TweenMax.fromTo(el, 1.2, { x: -3, opacity: 0 }, { x: 0, opacity: 1, onComplete: done })
    },

    setHover (name) {
      this.hoveredBlock = name
    },

    showTemplates () {
      this.showingTemplates = !this.showingTemplates
      if (this.showingTemplates) {
        setTimeout(() => {
          if (this.$refs.templates) {
            let elTop = this.$refs.templates.getBoundingClientRect().top
            let docBot = document.body.scrollTop + window.innerHeight
            let elHeight = this.$refs.templates.clientHeight
            let elBot = elTop + elHeight

            if (elBot > docBot) {
              let distance = elBot - docBot
              window.scrollBy({
                top: distance,
                behavior: 'smooth'
              })
            }
          }
        }, 250)
      }
    },

    clickPlus () {
      this.active = !this.active

      if (this.active && this.$refs.blocks) {
        setTimeout(() => {
          let elTop = this.$refs.blocks.getBoundingClientRect().top
          let docBot = document.body.scrollTop + window.innerHeight
          let elHeight = this.$refs.blocks.clientHeight
          let elBot = elTop + elHeight

          if (elBot > docBot) {
            let distance = elBot - docBot
            window.scrollBy({
              top: distance,
              behavior: 'smooth'
            })
          }
        }, 250)
      } else {
        this.showingTemplates = false
      }

      if (this.vTemplateMode) {
        this.showTemplates()
      }
    },

    addBlock (b) {
      let block = { ...b, uid: createUID() }
      this.active = false
      this.$emit('add', { block: block, after: this.after, parent: this.parent })
    },

    addTemplate (tp) {
      let block = { ...tp, uid: createUID() }
      this.active = false
      this.showingTemplates = false
      this.$emit('add', { block: block, after: this.after, parent: this.parent })
    },

    onDrop (ev) {
      ev.preventDefault()

      let blockData = ev.dataTransfer.getData('application/villain')
      let block = JSON.parse(blockData)

      ev.currentTarget.classList.remove('villain-drag-over')
      this.draggingOver = false

      this.$emit('move', { block, after: this.after, parent: this.parent })
    },

    dragEnter (ev) {
      ev.preventDefault()
      ev.stopPropagation()
    },

    dragOver (ev) {
      ev.dataTransfer.dropEffect = 'copy'
      ev.currentTarget.classList.add('villain-drag-over')
      this.draggingOver = true
      ev.preventDefault()
      ev.stopPropagation()
    },

    dragLeave (ev) {
      ev.currentTarget.classList.remove('villain-drag-over')
      this.draggingOver = false
      ev.preventDefault()
      ev.stopPropagation()
    }
  }
}
</script>

<style lang="postcss" scoped>
.villain-editor-plus {
  margin-top: 1rem;
  color: theme(colors.villain.main);
  text-align: center;

  &.villain-drag-over {
    .villain-editor-plus-inactive {
      a {
        color: #fff;
        background-color: theme(colors.villain.main) !important;
        border: 0;
        text-decoration: none;

        &:hover {
          border: 0;
          text-decoration: none;
        }
      }
    }
  }

.villain-editor-plus-available-templates {
  background-color: theme(colors.villain.blockBackground);
  padding: 1rem;
  max-width: 500px;
  margin: 0 auto;
  margin-top: 5px;
  font-size: 18px;

  .villain-editor-plus-available-template {
    cursor: pointer;
    padding: 1rem 1rem 1rem calc(1rem + 60px);
    text-align: left;

    &:hover {
      color: #fff;
      background-color: theme(colors.villain.main) !important;
    }
  }

  .villain-editor-plus-available-templates-title {
    font-weight: bold;
    text-transform: uppercase;
    margin-bottom: 6px;
    font-size: 15px;
  }

  .villain-editor-plus-available-templates-namespace {
    cursor: pointer;

    padding: 1rem;
    display: flex;
    align-items: center;

    &:hover {
      color: #fff;
      background-color: theme(colors.villain.main) !important;

      .svg-icon {
        fill: white;
      }
    }

    strong {
      font-size: 18px;
      font-weight: 400;
    }

    .svg-icon {
      width: 30px;
      height: 30px;
      float: left;
      margin-right: 30px;
    }
  }
}

  .villain-editor-plus-available-blocks {
    background-color: theme(colors.villain.blockBackground);
    position: relative;

    .villain-editor-plus-close {
      position: absolute;
      right: 5px;
      color: #fff;
      top: 5px;
    }

    .villain-editor-plus-available-block {
      color: theme(colors.dark);
      background-color: transparent;
      display: inline-block;
      padding: .5rem 1rem;
      margin: .25rem;
      cursor: pointer;
      transition: 500ms background-color ease, 500ms color ease;

      &:hover {
        background-color: theme(colors.blue);
        color: #fff;
        border: 0;
      }

      .villain-editor-plus-available-block-text {
        text-transform: uppercase;
        font-size: .7rem;
        font-weight: bold;
      }
    }
  }
}

.villain-svg-plus {
  width: 30px;
  transition: transform 1s ease;
  transform: rotateZ(0deg);

  circle {
    transition: fill 750ms ease;
    fill: theme(colors.villain.mainFaded);
  }

  path {
    transition: fill 350ms ease;
    fill: #fff;
  }

  &.villain-svg-plus-open {
    transform: rotateZ(135deg);

    circle {
      transition: fill 750ms ease;
      fill: transparent;
    }

    path {
      transition: fill 350ms ease;
      fill: theme(colors.villain.main);
    }
  }
}

.villain-editor-plus-inactive {
  * {
    pointer-events: none;
  }

  a {
    pointer-events: auto;
    * {
      pointer-events: none;
    }
  }
}

.villain-editor-plus-inactive, .villain-editor-plus-active {
  a {
    display: inline-block;
    font-size: 2.5rem;
    line-height: 2.5rem;
    font-weight: bold;
    cursor: pointer;
    color: theme(colors.villain.main);
    background-color: transparent;
    transition: all 250ms ease;
    border: 0;
    text-decoration: none;

    &:hover {
      background-color: transparent;
      border: 0;
      text-decoration: none;
    }
  }
}

.villain-editor-plus-block-name {
  text-transform: uppercase;
  font-size: .65rem;
  margin-bottom: 10px;
  font-weight: bold;
  display: inline-block;
  background: theme(colors.villain.blockBackground);
  padding: 3px 7px;
}

.villain-editor-plus-inactive {
  a {
    &:hover {
      background-color: transparent;
      .villain-svg-plus {
        circle {
          transition: fill 350ms ease;
          fill: theme(colors.villain.main);
        }
      }
    }
  }
}

</style>
