<template>
  <Block
    :block="block"
    :parent="parent"
    icon="fa-paragraph"
    @add="$emit('add', $event)"
    @move="$emit('move', $event)"
    @delete="$emit('delete', $event)">
    <quill-editor
      ref="quill"
      v-model="text"
      :class="block.data.type"
      :options="quillOptions">
    </quill-editor>
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
import { quillEditor } from 'vue-quill-editor'
import Quill from 'quill'
import MarkdownIt from 'markdown-it'

const Link = Quill.import('formats/link')
class linkType extends Link {
  static create (value) {
    let node = super.create(value)
    value = this.sanitize(value)

    if (value.startsWith('https://') || value.startsWith('http://')) {
      node.className = 'link--external'
    } else {
      node.removeAttribute('target')
    }
    return node
  }
}

Quill.register(linkType)

const md = new MarkdownIt({ html: true })

export default {
  name: 'TextBlock',

  components: {
    Block,
    quillEditor
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
      quillOptions: {
        placeholder: 'Tekst her',
        modules: {
          toolbar: [
            ['bold', 'italic', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link']
          ]
        }
      }
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
    const quill = this.$refs.quill.quill

    quill.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
      let ops = []
      delta.ops.forEach(op => {
        if (op.insert && typeof op.insert === 'string') {
          ops.push({
            insert: op.insert
          })
        }
      })
      delta.ops = ops
      return delta
    })
  }
}

</script>
