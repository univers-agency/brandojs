<template>
  <Block
    :block="block"
    :parent="parent"
    :config="showConfig"
    @add="$emit('add', $event)"
    @move="$emit('move', $event)"
    @delete="$emit('delete', $event)"
    @toggle-config="showConfig = $event">
    <div
      v-if="!block.data.length"
      class="villain-block-empty">
      <i class="fa fa-fw fa-table"></i>
      <div class="actions">
        <ButtonSecondary
          @click="showConfig = true">
          Konfigurér datatabell
        </ButtonSecondary>
      </div>
    </div>
    <transition-group
      v-else
      v-sortable="{handle: '.villain-block-datatable-item', animation: 500, store: {get: getOrder, set: storeOrder}}"
      class="villain-block-datatable"
      name="fade-move"
      tag="table">
      <tr
        v-for="item in block.data"
        :key="item.key + item.value"
        :data-id="item.key + item.value"
        class="villain-block-datatable-item">
        <td class="villain-block-datatable-item-key">
          {{ item.key }}
        </td>
        <td class="villain-block-datatable-item-value">
          {{ item.value }}
        </td>
      </tr>
    </transition-group>

    <template slot="config">
      <table class="table villain-block-datatable-table">
        <tbody>
          <tr
            v-for="(item, idx) in block.data"
            :key="idx + 'cfg'">
            <td>
              <input
                v-model="item.key"
                class="form-control"
                type="input">
            </td>
            <td>
              <input
                v-model="item.value"
                class="form-control"
                type="input" />
            </td>
            <td>
              <ButtonSecondary
                @click="deleteItem(item)">
                <i class="fa fa-times" />
              </ButtonSecondary>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="d-flex justify-content-center">
        <ButtonSecondary
          @click="addItem">
          Legg til ny linje
        </ButtonSecondary>
      </div>
    </template>
  </Block>
</template>

<script>
import Block from '../system/Block'

export default {
  name: 'DatatableBlock',

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
      uid: null,
      showConfig: false
    }
  },

  created () {
    console.debug('<DatatableBlock /> created')
  },

  methods: {
    getOrder (sortable) {
      return this.block.data
    },

    storeOrder (sortable) {
      this.sortedArray = sortable.toArray()
      let newOrder = []
      this.sortedArray.forEach(x => {
        let i = this.block.data.find(i => i.key + i.value === x)
        newOrder = [
          ...newOrder,
          i
        ]
      })
      this.block.data = newOrder
    },

    addItem () {
      this.block.data.push({
        key: 'Nøkkel',
        value: 'Innhold'
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

<style lang="postcss" scoped>
  .villain-block-config-content {
    table {
      margin-right: 0;
      width: 100%;
    }
    td button {
      margin-bottom: 15px;
      border: none;
      width: 35px;
      min-width: 35px;
    }
  }

  .desc {
    text-align: center;
    margin-bottom: 25px;
  }

  .villain-block-empty {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    svg {
      width: 30%;
      height: 30%;
      max-width: 250px;
      margin-bottom: 25px;
    }
  }

</style>
