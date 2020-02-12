<template>
  <Block
    :block="block"
    :parent="parent"
    :config="showConfig"
    icon="fa-paragraph"
    @add="$emit('add', $event)"
    @move="$emit('move', $event)"
    @delete="$emit('delete', $event)"
    @toggle-config="showConfig = $event">
    <EditorMenuBar
      v-slot="{ commands, isActive, focused }"
      class="villain-text-editor-menubar"
      :editor="editor">
      <div
        class="menubar is-hidden"
        :class="{ 'is-focused': focused }">
        <button
          type="button"
          class="menubar__button"
          :class="{ 'is-active': isActive.bullet_list() }"
          @click="commands.bullet_list">
          <FontAwesomeIcon icon="list-ul" />
        </button>

        <button
          type="button"
          class="menubar__button"
          :class="{ 'is-active': isActive.ordered_list() }"
          @click="commands.ordered_list">
          <FontAwesomeIcon icon="list-ol" />
        </button>

        <button
          type="button"
          class="menubar__button"
          :class="{ 'is-active': isActive.blockquote() }"
          @click="commands.blockquote">
          <FontAwesomeIcon icon="quote-right" />
        </button>
      </div>
    </EditorMenuBar>
    <EditorMenuBubble
      v-slot="{ commands, isActive, getMarkAttrs, menu }"
      class="menububble"
      :editor="editor"
      @hide="hideLinkMenu">
      <div
        class="menububble"
        :class="{ 'is-active': menu.isActive }"
        :style="`left: ${menu.left}px; bottom: ${menu.bottom}px;`">
        <form
          v-if="linkMenuIsActive"
          class="menububble__form"
          @submit.prevent="setLinkUrl(commands.link, linkUrl)">
          <input
            ref="linkInput"
            v-model="linkUrl"
            class="menububble__input"
            type="text"
            placeholder="https://"
            @keydown.esc="hideLinkMenu" />
          <button
            class="menububble__button"
            type="button"
            @click="setLinkUrl(commands.link, null)">
            <FontAwesomeIcon icon="unlink" />
          </button>
        </form>

        <template v-else>
          <button
            type="button"
            class="menububble__button"
            :class="{ 'is-active': isActive.bold() }"
            @click="commands.bold">
            <FontAwesomeIcon icon="bold" />
          </button>

          <button
            type="button"
            class="menububble__button"
            :class="{ 'is-active': isActive.italic() }"
            @click="commands.italic">
            <FontAwesomeIcon icon="italic" />
          </button>

          <button
            type="button"
            class="menububble__button"
            :class="{ 'is-active': isActive.strike() }"
            @click="commands.strike">
            <FontAwesomeIcon
              icon="strikethrough"
              size="sm" />
          </button>

          <button
            type="button"
            class="menububble__button"
            :class="{ 'is-active': isActive.underline() }"
            @click="commands.underline">
            <FontAwesomeIcon
              icon="underline"
              size="sm" />
          </button>

          <button
            type="button"
            class="menububble__button"
            :class="{ 'is-active': isActive.paragraph() }"
            @click="commands.paragraph">
            <FontAwesomeIcon
              icon="paragraph"
              size="sm" />
          </button>

          <button
            type="button"
            class="menububble__button"
            :class="{ 'is-active': isActive.heading({ level: 2 }) }"
            @click="commands.heading({ level: 2 })">
            <FontAwesomeIcon
              icon="heading"
              size="sm" />
          </button>
          <button
            type="button"
            class="menububble__button"
            :class="{ 'is-active': isActive.heading({ level: 3 }) }"
            @click="commands.heading({ level: 3 })">
            <FontAwesomeIcon
              icon="heading"
              size="sm" />
          </button>
          <button
            class="menububble__button"
            :class="{ 'is-active': isActive.link() }"
            @click="showLinkMenu(getMarkAttrs('link'))">
            <FontAwesomeIcon
              icon="link"
              size="sm" />
          </button>
        </template>
      </div>
    </EditorMenuBubble>
    <EditorContent
      :editor="editor"
      :class="'villain-text-editor ' + block.data.type" />
    <template slot="config">
      <div class="form-check">
        <input
          v-model="block.data.type"
          class="form-check-input"
          type="radio"
          value="paragraph">
        <label class="form-check-label">
          Paragraf/brødtekst
        </label>
      </div>
      <div class="form-check">
        <input
          v-model="block.data.type"
          class="form-check-input"
          type="radio"
          value="lead">
        <label class="form-check-label">
          Ingress
        </label>
      </div>
      <div class="form-check">
        <input
          v-model="block.data.type"
          :value="customClass"
          class="form-check-input"
          type="radio">
        <label class="form-check-label">
          <div class="form-group">
            <input
              v-model="customClass"
              class="form-control"
              type="input">
          </div>
        </label>
      </div>
    </template>
  </Block>
</template>

<script>
import Block from '../system/Block'
import {
  Editor,
  EditorContent,
  EditorMenuBar,
  EditorMenuBubble
} from 'tiptap'

import {
  Blockquote,
  BulletList,
  HardBreak,
  Heading,
  ListItem,
  OrderedList,
  Bold,
  Italic,
  Strike,
  Underline,
  History
} from 'tiptap-extensions'
import Link from './textExtensions/Link.js'
import MarkdownIt from 'markdown-it'
const md = new MarkdownIt({ html: true })

export default {
  name: 'TextBlock',

  components: {
    Block,
    EditorContent,
    EditorMenuBar,
    EditorMenuBubble
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
      editor: null,
      customClass: '',
      linkUrl: null,
      linkMenuIsActive: false,
      showConfig: false
    }
  },

  computed: {
    text: {
      get () {
        return this.block.data.text
      },

      set (txt) {
        this.block.data.text = txt
        return this.block.data.text
      }
    }
  },

  inject: ['available'],

  created () {
    console.debug('<TextBlock /> created')
    this.text = md.render(this.block.data.text)
    this.customClass = this.block.data.type
  },

  mounted () {
    this.editor = new Editor({
      extensions: [
        new Blockquote(),
        new BulletList(),
        new HardBreak(),
        new Heading({ levels: [2, 3] }),
        new ListItem(),
        new OrderedList(),
        new Link({ openOnClick: false }),
        new Bold(),
        new Italic(),
        new Strike(),
        new Underline(),
        new History()
      ],
      content: this.text,
      onUpdate: ({ getHTML }) => {
        this.text = getHTML()
      }
    })
  },

  beforeDestroy () {
    this.editor.destroy()
  },

  methods: {
    showLinkMenu (attrs) {
      this.linkUrl = attrs.href
      this.linkMenuIsActive = true
      this.$nextTick(() => {
        this.$refs.linkInput.focus()
      })
    },
    hideLinkMenu () {
      this.linkUrl = null
      this.linkMenuIsActive = false
    },
    setLinkUrl (command, url) {
      command({ href: url })
      this.hideLinkMenu()
    }
  }
}

</script>

<style lang="postcss" scoped>
  .villain-text-editor-menubar {
    margin-bottom: 30px;
    transition: opacity 1s ease;

    &.is-hidden {
      opacity: 0.3;
    }

    &.is-focused {
      opacity: 1;
    }
  }

  .menububble {
    position: absolute;
    display: flex;
    z-index: 20;
    background: #000;
    border-radius: 5px;
    padding: .3rem;
    margin-bottom: .5rem;
    transform: translateX(-50%);
    visibility: hidden;
    opacity: 0;
    transition: opacity .2s,visibility .2s;

    &.is-active {
      visibility: visible;
      opacity: 1;
    }

    .menububble__form {
      display: flex;
      align-items: center;
      width: 380px;

      input {
        margin-bottom: 0;
      }
    }

    .menububble__button {
      display: inline-flex;
      background: transparent;
      color: #fff;
      padding: .2rem .5rem;
      margin-right: .2rem;
      border-radius: 3px;
      cursor: pointer;

      border: none;
      opacity: 0.5;

      &.is-active {
        opacity: 1;
      }

      &:last-child {
        margin-right: 0;
      }
    }
  }

  button.menubar__button {
    border: none;
    margin-right: 20px;
    opacity: 0.5;

    &.is-active {
      opacity: 1;
    }
  }
</style>
