<template>
  <Block
    :block="block"
    :parent="parent"
    @add="$emit('add', $event)"
    @move="$emit('move', $event)"
    @delete="$emit('delete', $event)"
    @toggle-config="showConfig = $event">
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
        <KInput
          v-model="item.caption"
          label="Datapunkt"
          :name="`data[caption][${idx}]`" />

        <KInputTextarea
          v-model="item.text"
          :rows="2"
          label="Innhold"
          :name="`data[text][${idx}]`" />

        <ButtonSecondary
          @click="deleteItem(item)">
          Slett punkt
        </ButtonSecondary>

        <hr />
      </div>
      <ButtonSecondary
        @click="addItem">
        Nytt punkt
      </ButtonSecondary>
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
      const i = this.block.data.find(b => b === item)
      const idx = this.block.data.indexOf(i)

      this.block.data = [
        ...this.block.data.slice(0, idx),
        ...this.block.data.slice(idx + 1)
      ]
    }
  }
}
</script>

<style lang="postcss" scoped>
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
      font-weight: 500;
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
