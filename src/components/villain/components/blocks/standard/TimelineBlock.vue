<template>
  <Block
    :block="block"
    :parent="parent"
    @add="$emit('add', $event)"
    @move="$emit('move', $event)"
    @delete="$emit('delete', $event)">
    <ul class="villain-timeline">
      <li
        v-for="(item, idx) in block.data"
        :key="idx"
        class="villain-timeline-item">
        <p class="villain-timeline-item-date">
          {{ item.caption }}
        </p>
        <div class="villain-timeline-item-content">
          <div class="villain-timeline-item-content-inner">
            {{ item.text }}
          </div>
        </div>
      </li>
    </ul>
    <template slot="config">
      <div
        v-for="(item, idx) in block.data"
        :key="idx + 'cfg'"
        class="form-group">
        <label>Punktoverskrift</label>
        <input
          v-model="item.caption"
          class="form-control"
          type="input">

        <label>Innhold</label>
        <textarea
          v-model="item.text"
          rows="2"
          class="form-control">
        </textarea>
        <button
          type="button"
          class="btn btn-outline-primary btn-small mt-2"
          @click="deleteItem(item)">
          Slett
        </button>
        <hr />
      </div>
      <button
        type="button"
        class="btn btn-outline-primary"
        @click="addItem">
        Legg til nytt tidslinjepunkt
      </button>
    </template>
  </Block>
</template>

<script>
import Block from '../system/Block'

export default {
  name: 'TimelineBlock',

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
      customClass: '',
      uid: null
    }
  },

  created () {
    console.debug('<TimelineBlock /> created')
  },

  methods: {
    addItem () {
      this.block.data.push({
        caption: '2018',
        text: 'Innhold'
      })
    },

    deleteItem (item) {
      let i = this.block.data.find(b => b === item)
      let idx = this.block.data.indexOf(i)

      this.block.data = [
        ...this.block.data.slice(0, idx),
        ...this.block.data.slice(idx + 1)
      ]
    }
  }
}
</script>
