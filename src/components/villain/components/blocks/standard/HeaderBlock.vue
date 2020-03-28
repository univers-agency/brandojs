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
      rows="1"
      ref="txt"
      v-model="block.data.text"
      :style="'font-size: ' + fontSize + 'rem'"
      class="villain-header-input">
    </textarea>
    <template slot="config">
      <KInputRadios
        v-model="block.data.level"
        name="data[level]"
        rules="required"
        :options="[
          { label: 'H1', value: 1 },
          { label: 'H2', value: 2 },
          { label: 'H3', value: 3 },
          { label: 'H4', value: 4 },
          { label: 'H5', value: 5 },
          { label: 'H6', value: 6 },
        ]"
        optionValueKey="value"
        optionLabelKey="label"
        label="Størrelse" />

      <KInput
        v-model="block.data.id"
        name="data[id]"
        label="Id"
        help-text="Kan brukes som lenkemål (#id-navn-her)" />

      <KInput
        v-model="block.data.class"
        name="data[class]"
        label="CSS klasser" />
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
