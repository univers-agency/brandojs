<template>
  <div
    ref="wrapper"
    class="villain-block-wrapper">
    <div
      v-show="!showConfig"
      ref="content"
      :class="hovering ? 'villain-hover' : ''"
      :data-type="block.type"
      class="villain-block">
      <slot></slot>
      <div class="villain-block-actions">
        <div
          v-if="!locked"
          ref="handle"
          v-popover="'Skift blokkens posisjon'"
          class="villain-block-action villain-move">
          <i class="fa fa-fw fa-arrows-alt" />
        </div>
        <div
          v-if="locked"
          ref="handle"
          class="villain-block-action villain-locked">
          <i class="fa fa-fw fa-lock" />
        </div>
        <div
          v-if="hasHelpSlot"
          v-popover="'Vis hjelp for blokken'"
          class="villain-block-action villain-help"
          @click="helpBlock">
          <i class="fa fa-fw fa-question-circle" />
        </div>
        <div
          v-if="hasConfigSlot && block.type !== 'template'"
          v-popover="'Endre blokkens oppsettsvalg'"
          class="villain-block-action villain-config"
          @click="configBlock">
          <i class="fa fa-fw fa-cog" />
        </div>
        <div
          v-else-if="hasConfigSlot && block.type === 'template'"
          v-popover="'Endre malens oppsettsvalg'"
          class="villain-block-action villain-config"
          @click="configBlock">
          <i class="fa fa-fw fa-file" />
        </div>
        <div
          v-if="!locked"
          v-popover="'Slett blokken'"
          class="villain-block-action villain-delete"
          @click="deleteBlock">
          <i class="fa fa-fw fa-trash-alt" />
        </div>
        <div
          v-if="locked"
          class="villain-block-action villain-locked">
          <i class="fa fa-fw fa-lock" />
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

    <div
      v-show="showConfig"
      ref="config"
      class="villain-block villain-block-config">
      <div class="villain-block-config-content">
        <div
          class="villain-config-close-button"
          @click="showConfig = false">
          <i class="fa fa-times" />
        </div>

        <h5>Konfigurasjon &mdash; {{ getBlockDisplayName(block.type) }}</h5>

        <div
          v-if="icon"
          class="display-icon">
          <i
            :class="icon"
            class="fa fa-fw" />
        </div>

        <slot name="config" />

        <div class="villain-block-actions">
          <div class="villain-block-action villain-move">
            <i class="fa fa-fw fa-expand-arrows-alt" />
          </div>
          <div
            v-if="hasConfigSlot"
            class="villain-block-action villain-config"
            @click="showConfig = false">
            <i class="fa fa-fw fa-cog" />
          </div>
          <div
            v-if="!locked"
            class="villain-block-action villain-delete"
            @click="deleteBlock">
            <i class="fa fa-fw fa-trash-alt" />
          </div>
          <div
            v-if="locked"
            class="villain-block-action villain-locked">
            <i class="fa fa-fw fa-lock" />
          </div>
        </div>
      </div>
    </div>
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
      moving: false
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
    }
  },

  watch: {
    config (v) {
      this.showConfig = v
    },

    help (v) {
      this.showHelp = v
    }
  },

  inject: [
    'available'
  ],

  created () {
    if (this.config) {
      this.showConfig = true
    }
  },

  mounted () {
    this.$refs.content.addEventListener('mouseover', this.onMouseOver)
    this.$refs.content.addEventListener('mouseleave', this.onMouseLeave)
    this.$refs.handle.addEventListener('dragstart', this.onDragStart)
    this.$refs.handle.addEventListener('dragend', this.onDragEnd)
    this.$refs.handle.addEventListener('mousedown', this.onMouseDown)
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

    configBlock () {
      this.showConfig = true
      this.$emit('showConfig')
    },

    deleteBlock () {
      this.$alerts.alertConfirm('OBS!', 'Er du sikker på at du vil slette denne blokken?', data => {
        if (data) {
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
  background-color: #fff;
  padding: 1rem;
  padding-right: 2rem;
  min-height: 120px;
  position: relative;
  border: 2px solid #fff;
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
    border: 2px solid theme(colors.villain.main);
    > .villain-block-actions {
      opacity: 1;
    }

    .villain-template-description, .villain-block-description {
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

  &.villain-block-config {
    padding: 2rem;

    .villain-block-config-content {
      max-width: 600px;
      margin: 0 auto;
      padding: 2rem;
      position: relative;
      background-color: theme(colors.villain.secondary);

      .villain-config-close-button {
        position: absolute;
        top: 21px;
        right: 31px;
        font-size: 25px;
        opacity: 0.5;

        &:hover {
          opacity: 1;
          cursor: pointer;
        }
      }

      .villain-config-content-buttons {
        margin: 0 auto;
        text-align: center;

      }

      label {
        border-bottom: 2px solid #feca1a;
        color: #000;
        font-size: 0.8rem;
        letter-spacing: 1px;
        margin-bottom: 0.75rem;
        margin-left: 0rem;
        padding: 0.3rem 0;
        text-transform: uppercase;

        &.form-check-label {
          background-color: transparent;
          color: #000;
          margin-left: .75rem;
          border: 0;
          margin-bottom: 0rem;
        }
      }

      p {
        text-align: center;
      }

      .form-control {
        border: 0;
        border-radius: 0;
        border: 1px solid #850038;
      }

      .display-icon {
        margin: 0 auto;
        display: inherit;
        align-self: center;
        justify-self: center;
        font-size: 12rem;
        text-align: center;
        color: theme(colors.villain.main);
      }

      h5 {
        text-align: center;
        font-size: 0.8rem;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 1.2px;
        margin-bottom: 1.5rem;
        border-bottom: 2px solid #00000008;
        padding-bottom: 1.5rem;
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

  .villain-template-description, .villain-block-description {
    background-color: #e4e4e4;
    color: #000;
    font-size: 9px;
    padding: 3px 5px;
    font-weight: normal;
    display: inline-block;
    position: absolute;
    top: 0;
    left: 0;
    text-transform: uppercase;
    opacity: 0;
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
      padding: .25rem .4rem;
      margin: .25rem 0;
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
  padding: 2rem;
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

.villain-block-datatable {
  margin: 0 auto;

  .villain-block-datatable-item {
    padding: 0 2rem;

    &:hover {
      cursor: move;
    }

    .villain-block-datatable-item-key {
      font-weight: bold;
      padding-right: 2rem;
      text-align: right;
    }
    .villain-block-datatable-item-value {
      padding-left: 2rem;
    }
  }
}

.villain-header-input {
  border: 0;
  width: 100%;
  padding: 1rem;
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

.villain-editor {
  .ql-container.ql-snow {
    border: 0;
  }

  .ql-toolbar.ql-snow {
    border: 0;
    border-bottom: 1px solid #eee;
  }

  .ql-editor {
    font-size: 1.2rem;

    p {
      margin-bottom: 1.5rem;
      line-height: 1.55;
    }

    a {
      text-decoration: none;
    }
  }

  .quill-editor.lead .ql-editor {
    font-size: 2.2rem;
  }

  .ql-snow .ql-tooltip a {
    border: 0;
  }
}

.villain-timeline {
  list-style: none;
}
.villain-timeline > li {
  margin-bottom: 60px;
}

/* for Desktop */
@media ( min-width : 640px ){
  .villain-timeline > li {
    overflow: hidden;
    margin: 0;
    position: relative;
  }
  .villain-timeline-item-date {
    width: 110px;
    float: left;
    margin-top: 21px;
    font-size: 85%;
    font-weight: bold;
  }
  .villain-timeline-item-content {
    width: 75%;
    float: left;
    border-left: 3px #e5e5d1 solid;
    padding-left: 30px;
    min-height: 60px;
    display: flex;
    align-items: center;
  }
  .villain-timeline-item-content:before {
    content: '';
    width: 12px;
    height: 12px;
    background: theme(colors.villain.main);
    position: absolute;
    left: 106px;
    top: 24px;
    border-radius: 100%;
  }

  .villain-timeline-item-content-inner {
    font-size: 95%;
  }
}

</style>
