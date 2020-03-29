<template>
  <div
    ref="wrapper"
    class="villain-block-wrapper">
    <div
      ref="content"
      :class="hovering ? 'villain-hover' : ''"
      :data-type="block.type"
      class="villain-block">
      <slot></slot>
      <div class="villain-block-actions">
        <div
          v-if="!locked"
          ref="handle"
          class="villain-block-action villain-move">
          <FontAwesomeIcon
            v-popover.left="'Skift blokkens posisjon'"
            icon="arrows-alt"
            size="xs"
            fixed-width />
        </div>
        <div
          v-if="hasHelpSlot"
          class="villain-block-action villain-help"
          @click="helpBlock">
          <FontAwesomeIcon
            v-popover.left="'Vis hjelp for blokken'"
            icon="question-circle"
            size="xs"
            fixed-width />
        </div>
        <div
          v-if="hasConfigSlot && block.type !== 'template'"
          class="villain-block-action villain-config"
          @click="openConfig">
          <FontAwesomeIcon
            v-popover.left="'Endre blokkens oppsettsvalg'"
            icon="cog"
            size="xs"
            fixed-width />
        </div>
        <div
          v-else-if="hasConfigSlot && block.type === 'template'"
          class="villain-block-action villain-config"
          @click="openConfig">
          <FontAwesomeIcon
            v-popover.left="'Endre malens oppsettsvalg'"
            icon="file"
            size="xs"
            fixed-width />
        </div>
        <div
          class="villain-block-action villain-delete"
          @click="deleteBlock">
          <FontAwesomeIcon
            v-popover.left="'Slett blokken'"
            icon="trash-alt"
            size="xs"
            fixed-width />
        </div>
      </div>
      <div class="villain-block-info">
        {{ getBlockDisplayName(block.type) }}
      </div>
    </div>

    <div
      v-show="showHelp"
      ref="help"
      class="villain-block villain-block-help">
      <div class="villain-block-help-content">
        <h5>Hjelpetekst &rarr;</h5>

        <div
          v-if="icon"
          class="display-icon">
          <i
            :class="icon"
            class="fa fa-fw" />
        </div>

        <slot name="help" />

        <div class="villain-help-content-buttons">
          <button
            type="button"
            class="btn btn-primary mt-3"
            @click="showHelp = false">
            Lukk
          </button>
        </div>
      </div>
    </div>


    <KModal
      v-if="showConfig"
      v-shortkey="['esc']"
      ref="modal"
      ok-text="Lukk konfigurasjon"
      @shortkey.native="closeConfig"
      @ok="closeConfig">
      <template #header>
        <h5>{{ getBlockDisplayName(block.type) }}</h5>
      </template>
      <div
        ref="config"
        class="villain-block-config">
        <div class="villain-block-config-content">
          <slot name="config" />
        </div>
      </div>
    </KModal>

    <template v-if="!locked">
      <VillainPlus
        v-if="block.type !== 'columns'"
        :after="block.uid"
        :parent="parent"
        @add="$emit('add', $event)"
        @move="$emit('move', $event)" />
      <VillainPlus
        v-else
        :after="block.uid"
        @add="$emit('add', $event)"
        @move="$emit('move', $event)" />
    </template>
  </div>
</template>

<script>
import { VTooltip } from 'v-tooltip'
import gsap from 'gsap'

export default {
  directives: { popover: VTooltip },
  props: {
    block: {
      type: Object,
      default: () => {}
    },

    parent: {
      type: String,
      default: null
    },

    config: {
      type: Boolean,
      default: false
    },

    icon: {
      type: String,
      default: ''
    },

    showOk: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      showConfig: false,
      showHelp: false,
      dragEl: null,
      hovering: false,
      moving: false,
      width: null
    }
  },

  computed: {
    hasConfigSlot () {
      return this.$slots.hasOwnProperty('config')
    },

    hasHelpSlot () {
      return this.$slots.hasOwnProperty('help')
    },

    locked () {
      return this.block.hasOwnProperty('locked') && this.block.locked
    },

    hasConfigListener () {
      return this.$listeners && this.$listeners.config
    }
  },

  watch: {
    help (v) {
      this.showHelp = v
    }
  },

  inject: [
    'available'
  ],

  mounted () {
    this.$refs.content.addEventListener('mouseover', this.onMouseOver)
    this.$refs.content.addEventListener('mouseleave', this.onMouseLeave)

    if (this.$refs.handle) {
      this.$refs.handle.addEventListener('dragstart', this.onDragStart)
      this.$refs.handle.addEventListener('dragend', this.onDragEnd)
      this.$refs.handle.addEventListener('mousedown', this.onMouseDown)
    }
  },

  methods: {
    getBlockDisplayName (blkType) {
      let foundBlock = this.available.blocks.find(b => {
        return b.component.toLowerCase() === blkType
      })
      if (foundBlock) {
        return foundBlock.name
      }
      return ''
    },

    helpBlock () {
      this.showHelp = true
    },

    openConfig () {
      this.showConfig = true
      if (this.hasConfigListener) {
        this.$nextTick(() => {
          this.$emit('config')
        })
      }
    },

    async closeConfig () {
      await this.$refs.modal.close()
      this.showConfig = false
    },

    deleteBlock () {
      this.$alerts.alertConfirm('OBS!', 'Er du sikker på at du vil slette denne blokken?', data => {
        if (data) {
          console.log('emitting delete!', this)
          this.$emit('delete', this.block)
        }
      })
    },

    onDragStart (ev) {
      ev.stopPropagation()

      let data = this.block
      let block = this.$refs.content
      let handle = this.$refs.handle
      let hCR = handle.getBoundingClientRect()

      this.dragEl = block.cloneNode(true)
      this.dragEl.classList.add('villain-drag-element')

      this.dragEl.style.top = `${block.offsetTop}px`
      this.dragEl.style.left = `${block.offsetLeft}px`

      block.parentNode.appendChild(this.dragEl)

      ev.dataTransfer.dropEffect = 'move'
      ev.dataTransfer.setDragImage(this.dragEl, hCR.left, 1)
      ev.dataTransfer.setData('application/villain', JSON.stringify(data, null, 2))

      this.$refs.content.classList.add('villain-dragging-block')
    },

    onDragEnd (ev) {
      ev.stopPropagation()

      if (this.$refs.content) {
        // might be removed when recreated in another column
        this.$refs.content.classList.remove('villain-dragging-block')
        this.$refs.handle.setAttribute('draggable', 'false')
      }

      this.dragEl.parentNode.removeChild(this.dragEl)
    },

    onMouseDown (ev) {
      this.$refs.handle.setAttribute('draggable', 'true')
    },

    onMouseOver (ev) {
      ev.stopPropagation()
      this.hovering = true
    },

    onMouseLeave (ev) {
      ev.stopPropagation()
      this.hovering = false
    }
  }
}
</script>

<style lang="postcss">
.villain-block-wrapper {
  margin: 1rem;
  position: relative;
}

.villain-extra-padding {
  .villain-block {
    padding: 2rem 2rem 1rem 0rem;
  }
}

.villain-block {
  background-color: theme(colors.villain.blockBackground);
  padding: 1rem;
  padding-right: 2rem;
  min-height: 105px;
  position: relative;
  border: 1px solid theme(colors.villain.blockBorder);
  border-radius: 10px;
  transition: border 500ms ease;

  input:focus, textarea:focus {
    outline: none !important;
    border: none;
    box-shadow: none;
  }

  &.villain-drag-element {
    background: #fff;
    box-shadow: 3px 3px #f00 inset, -3px -3px #f00 inset ;
    position: absolute;
    width: 100%;
    z-index: -1;
    opacity: .5;

    .st-block-addition {
      display:none;
    }
  }

  &.villain-dragging-block {
    background:#f6f7f9;

    & > * {
      opacity:0;
    }

    &.st-block-addition {
      opacity:1;
    }
  }

  &.villain-drag-over {
    &.st-block-addition {
      opacity:0;
    }
  }

  &.villain-hover {
    border: 1px solid theme(colors.villain.main);

    > .villain-block-actions {
      opacity: 1;
    }

    .villain-template-description, .villain-block-description {
      transition: opacity 300ms ease;
      opacity: 1;
    }
  }

  &.villain-block-help {
    padding: 2rem;

    .villain-block-help-content {
      max-width: 600px;
      margin: 0 auto;
      padding: 2rem;
      font-size: 95%;

      background-color: theme(colors.villain.secondary);

      .villain-help-content-buttons {
        margin: 0 auto;
        text-align: center;
      }
    }
  }

  &[data-type=datatable], &[data-type=slideshow], &[data-type=image] {
    display: flex;
    align-items: center;
    min-height: 150px;
  }

  &[data-type="comment"] {
    background-color: lightyellow;
  }

  &[data-type="columns"] {
    .row {
      .col-2 {
        width: 16%;
        max-width: 16%;
        flex-basis: 16%;
      }
      .col-3 {
        width: 25%;
        max-width: 25%;
        flex-basis: 25%;
      }
      .col-4 {
        width: 33%;
        max-width: 33%;
        flex-basis: 33%;
      }
      .col-6 {
        width: 50%;
        max-width: 50%;
        flex-basis: 50%;
      }
      .col-12 {
        width: 100%;
        max-width: 100%;
        flex-basis: 100%;
      }
    }
  }

  .villain-template-description, .villain-block-description {
    background-color: #fafafa;
    color: #000;
    font-size: 9px;
    border-radius: 8px 0 0 0;
    padding: 3px 5px;
    font-weight: normal;
    display: inline-block;
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0;
    transition: opacity 300ms ease;
    text-transform: uppercase;

    &:before {
      content: '→';
    }
  }

  .villain-block-info {
    font-size: 8px;
    text-transform: uppercase;
    text-align: right;
    margin-left: 1rem;
    color: #aaa;
    display: none;
  }

  .villain-block-actions {
    opacity: 0;
    position: absolute;
    right: 0;
    top: 0;
    transition: 500ms opacity ease;

    .villain-block-action {
      padding: 3px 6px;
      background-color: transparent;
      color: theme(colors.villain.mainFaded);

      &:hover {
        color: theme(colors.villain.main);
      }
    }
  }
}

.villain-block-image {
  padding: 0;
  width: 100%;

  img {
    min-width: 100%;
  }
}

.villain-image-library {
  > .col-12 {
    width: 100%;
    flex-basis: 100%;
    max-width: 100%;
  }

  .villain-image-table-selected {
    opacity: 0.5;
    cursor: not-allowed;
  }

  table.villain-image-table {
    td {
      border: 0;
      padding: .25rem .25rem .25rem 0;

      &:first-of-type {
        width: 60px;
      }

      &:last-of-type {
        text-align: right;
      }

      img {
        max-width: 46px;
      }

      table {
        margin-bottom: 0;

        td {
          padding: .75rem .75rem;
          font-size: 12px;

        }
      }
    }
  }
  img {
    max-width: 100px;
    padding: .3rem;
    border: 1px solid #dee2e6;
    background-color: #fff;
    cursor: pointer;

    &:hover {
      box-shadow: 0px 0px 5px #85003838;
      border-color: #aaa;
    }
  }
}

.villain-block-video {
  padding-right: 0;

  .villain-block-video-content {
    height: 0;
    padding-top: 56.25%;
    position: relative;
    width: 100%;

    iframe {
      height: 100%;
      left: 0;
      position: absolute;
      top: 0;
      width: 100%;
    }
  }

  video.villain-video-file {
    width: 100%;
  }
}

.fade-move-enter-active,
.fade-move-leave-active {
  transition: opacity 0.3s;
}

.fade-move-enter,
.fade-move-leave-to {
  opacity: 0;
}

.fade-move-move {
  transition: transform 1s;
}

.villain-block-slideshow {
  width: 100%;
  position: relative;

  .villain-block-slideshow-popup-wrapper {
    .villain-block-slideshow-popup {
      padding: 2rem 3rem;
      min-width: 760px;
      margin-left: auto;
      margin-right: 0;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      background-color: white;
      border: 1px solid #eee;
      position: fixed;
      z-index: 99999;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  .villain-block-slideshow-images-meta {
    margin: 0 auto;
    margin-top: 40px;
    margin-bottom: 10px;
    max-width: 275px;

    label {
      text-align: center;
      width: 100%;
    }

    input:focus {
      border: 1px solid #ced4da;
    }
  }

  .villain-block-slideshow-images {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    width: 100%;
    justify-content: center;

    .villain-block-slideshow-image {
      position: relative;
      padding: .5rem;
      user-select: none;
      width: 25%;
      cursor: pointer;

      .info {
        position: absolute;
        left: 50%;
        top: 50%;
        color: #fff;
        font-size: 3em;
        transform: translateX(-50%) translateY(-50%);
        transition: opacity 0.75s ease;
        opacity: 0;
      }

      &.hover {
        .info {
          opacity: 0.8;
        }
      }

      .villain-block-slideshow-image-delete-overlay {
        user-select: none;
        display: flex;
        justify-content: center;
        align-items: center;
        color: rgba(0,0,0,0.3);
        position: absolute;
        opacity: 0;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        cursor: no-drop;
        display: none;
      }

      .villain-block-slideshow-image-overlay {
        user-select: none;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #fff;
        background-color: #000fe0cf;
        position: absolute;
        opacity: 1;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;

        i {
          padding: 0 15px;
          cursor: pointer;
        }
      }
    }
  }
}

.villain-block-datatable-table {
  tr {
    td {
      border: 0;
      padding: 5px;

      &:first-of-type {
        width: 35%;
      }

      input[type=input] {
        font-size: 90%;
      }
    }
  }
}

.villain-header-input {
  border: 0;
  width: 100%;
  padding: 0;
  line-height: 1.1;
}

.villain-markdown-input,
.villain-svg-input,
.villain-html-input {
  border: 0;
  width: 100%;
  font-family: "SF Mono", "Menlo", "Monaco", "Inconsolata", "Fira Mono", "Droid Sans Mono", "Source Code Pro", monospace;
}

.villain-svg-output {
  max-width: 250px;
  user-select: none;
  pointer-events: none;
}

.villain-block-divider {
  padding-left: 2rem;
  padding-top: 2rem;

  hr {
    border-bottom: 1px solid #ddd;
    border-left: none;
    border-right: none;
    border-top: none;
    margin: 1.5em 0;
  }
}

.villain-blockquote-content {
  width: 100%;
  border: 0;
  padding: 1.5rem;
  font-size: 2rem;
  font-style: italic;
}

.villain-blockquote-cite {
  width: 100%;
  border: 0;
  padding: 0 1.5rem 1.5rem;
  font-size: 1rem;
  font-style: italic;
}

.villain-text-editor {
  strong {
    font-weight: 500;
  }

  p {
    @fontsize base(0.95);
    margin-bottom: 22px;

    &:last-of-type {
      margin-bottom: 0;
    }

    a {
      border-bottom: 2px solid theme(colors.peachDarkest);
      padding-bottom: 3px;
    }
  }

  &.lead, &.lede {
    p {
      @fontsize xl;
    }
  }

  h2 {
    @fontsize lg;
    font-weight: 500;
    margin-top: 0;
    margin-bottom: 25px;
  }

  h3 {
    @fontsize sm;
    font-weight: 500;
    margin-top: 0;
    margin-bottom: 5px;
    text-transform: uppercase;
  }
}

.villain-svg-input-wrapper {
  width: 100%;
}

</style>
