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
    <div class="villain-block-description">
      Tekst ({{ block.data.type }})
    </div>
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
      :class="{ noTransform: linkMenuIsActive || actionButtonMenuIsActive }"
      :editor="editor"
      @hide="hideLinkMenu">
      <div
        class="menububble"
        :class="{ 'is-active': menu.isActive }"
        :style="`left: ${menu.left}px; bottom: ${menu.bottom}px;`">
        <KModal
          v-if="linkMenuIsActive"
          ref="linkModal"
          v-shortkey="['esc']"
          ok-text="Lukk"
          @shortkey.native="hideLinkMenu"
          @ok="setLinkUrl(commands.link, linkUrl);$refs.linkModal.close()">
          <template #header>
            Rediger link
          </template>
          <template>
            <KInput
              ref="linkInput"
              v-model="linkUrl"
              name="link[url]"
              label="URL"
              help-text="OBS! For å linke til en lokal side må du alltid ha med / foran (f.eks /personvern)."
              placeholder="https://link.no" />
          </template>
        </KModal>

        <KModal
          v-if="actionButtonMenuIsActive"
          ref="actionButtonModal"
          v-shortkey="['esc']"
          ok-text="Lukk"
          @shortkey.native="hideLinkMenu"
          @ok="setActionButtonUrl(commands.action_button, actionButtonUrl);$refs.actionButtonModal.close()">
          <template #header>
            Rediger knappelink
          </template>
          <template>
            <KInput
              ref="actionButtonInput"
              v-model="actionButtonUrl"
              name="actionButton[url]"
              label="URL"
              help-text="OBS! For å linke til en lokal side må du alltid ha med / foran (f.eks /personvern)."
              placeholder="https://link.no" />
          </template>
        </KModal>

        <template v-else>
          <button
            type="button"
            class="menububble__button"
            :class="{ 'is-active': isActive.bold() }"
            @click="commands.bold">
            <FontAwesomeIcon
              icon="bold"
              size="xs" />
          </button>

          <button
            type="button"
            class="menububble__button"
            :class="{ 'is-active': isActive.italic() }"
            @click="commands.italic">
            <FontAwesomeIcon
              icon="italic"
              size="xs" />
          </button>

          <button
            type="button"
            class="menububble__button"
            :class="{ 'is-active': isActive.strike() }"
            @click="commands.strike">
            <FontAwesomeIcon
              icon="strikethrough"
              size="xs" />
          </button>

          <button
            type="button"
            class="menububble__button"
            :class="{ 'is-active': isActive.underline() }"
            @click="commands.underline">
            <FontAwesomeIcon
              icon="underline"
              size="xs" />
          </button>

          <button
            type="button"
            class="menububble__button"
            :class="{ 'is-active': isActive.paragraph() }"
            @click="commands.paragraph">
            <FontAwesomeIcon
              icon="paragraph"
              size="xs" />
          </button>

          <button
            type="button"
            class="menububble__button"
            :class="{ 'is-active': isActive.heading({ level: 2 }) }"
            @click="commands.heading({ level: 2 })">
            <FontAwesomeIcon
              icon="heading"
              size="xs" />
          </button>
          <button
            type="button"
            class="menububble__button"
            :class="{ 'is-active': isActive.heading({ level: 3 }) }"
            @click="commands.heading({ level: 3 })">
            <FontAwesomeIcon
              icon="heading"
              size="xs" />
          </button>
          <button
            class="menububble__button"
            type="button"
            :class="{ 'is-active': isActive.link() }"
            @click="showLinkMenu(getMarkAttrs('link'))">
            <FontAwesomeIcon
              icon="link"
              size="xs" />
          </button>
          <button
            class="menububble__button"
            type="button"
            :class="{ 'is-active': isActive.action_button() }"
            @click="showActionButtonMenu(getMarkAttrs('action_button'))">
            <FontAwesomeIcon
              icon="square"
              size="xs" />
          </button>
        </template>
      </div>
    </EditorMenuBubble>
    <EditorContent
      :editor="editor"
      :class="'villain-text-editor ' + block.data.type" />
    <template slot="config">
      <KInputRadios
        v-model="block.data.type"
        name="data[type]"
        rules="required"
        :options="[
          { label: 'Paragraf/brødtekst', value: 'paragraph' },
          { label: 'Ingress', value: 'lede' }
        ]"
        optionValueKey="value"
        optionLabelKey="label"
        label="Teksttype" />
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
import Link from '../../../tiptap/extensions/Link'
import ActionButton from '../../../tiptap/extensions/ActionButton'
import Arrow from '../../../tiptap/extensions/Arrow'
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
      actionButtonUrl: null,
      actionButtonMenuIsActive: false,
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
        new ActionButton(),
        new Arrow(),
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
    },

    /** action button */
    showActionButtonMenu (attrs) {
      this.actionButtonUrl = attrs.href
      this.actionButtonMenuIsActive = true
      this.$nextTick(() => {
        this.$refs.actionButtonInput.focus()
      })
    },
    hideActionButtonMenu () {
      this.actionButtonUrl = null
      this.actionButtonMenuIsActive = false
    },
    setActionButtonUrl (command, url) {
      command({ href: url })
      this.hideActionButtonMenu()
    }
  }
}

</script>

<style lang="postcss" scoped>
  .villain-text-editor-menubar {
    margin-bottom: 10px;
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

    &.noTransform {
      transform: none !important;
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
