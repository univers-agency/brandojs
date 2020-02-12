<template>
  <Block
    :block="block"
    :parent="parent"
    :config="showConfig"
    @add="$emit('add', $event)"
    @move="$emit('move', $event)"
    @delete="$emit('delete', $event)"
    @toggle-config="showConfig = $event">
    <div class="villain-block-description">
      Overskrift (H{{ block.data.level }})
    </div>
    <textarea
      ref="txt"
      v-model="block.data.text"
      :style="'font-size: ' + fontSize + 'rem'"
      class="villain-header-input">
    </textarea>
    <template slot="config">
      <div class="form-group">
        <label>Størrelse</label>
        <div class="form-check">
          <input
            v-model="block.data.level"
            class="form-check-input"
            type="radio"
            value="1">
          <label class="form-check-label">
            H1
          </label>
        </div>
        <div class="form-check">
          <input
            v-model="block.data.level"
            class="form-check-input"
            type="radio"
            value="2">
          <label class="form-check-label">
            H2
          </label>
        </div>
        <div class="form-check">
          <input
            v-model="block.data.level"
            class="form-check-input"
            type="radio"
            value="3">
          <label class="form-check-label">
            H3
          </label>
        </div>
        <div class="form-check">
          <input
            v-model="block.data.level"
            class="form-check-input"
            type="radio"
            value="4">
          <label class="form-check-label">
            H4
          </label>
        </div>
        <div class="form-check">
          <input
            v-model="block.data.level"
            class="form-check-input"
            type="radio"
            value="5">
          <label class="form-check-label">
            H5
          </label>
        </div>
        <div class="form-check">
          <input
            v-model="block.data.level"
            class="form-check-input"
            type="radio"
            value="6">
          <label class="form-check-label">
            H6
          </label>
        </div>
      </div>

      <div class="form-group">
        <label>CSS klasser</label>
        <input
          v-model="block.data.class"
          class="form-control"
          type="input">
      </div>
    </template>
  </Block>
</template>

<script>
import autosize from 'autosize'
import Block from '../system/Block'

export default {
  name: 'HeaderBlock',

  components: {
    Block
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
    'available'
  ],

  computed: {
    fontSize () {
      const level = parseInt(this.block.data.level)
      switch (level) {
        case 1:
          return 4
        case 2:
          return 3
        case 3:
          return 2
        case 4:
          return 1.5
        case 5:
          return 1
        case 6:
          return 0.75
        default:
          return 1
      }
    }
  },

  created () {
    console.debug('<HeaderBlock /> created')
  },

  mounted () {
    autosize(this.$refs.txt)
  }
}
</script>
