<template>
  <Block
    ref="block"
    :block="block"
    :parent="parent"
    @add="$emit('add', $event)"
    @move="$emit('move', $event)"
    @delete="$emit('delete', $event)">
    <div
      v-if="!block.data.rows"
      class="villain-block-empty">
      <i class="fa fa-fw fa-table"></i>
      <div class="actions">
        <ButtonSecondary
          @click="$refs.block.openConfig()">
          Konfigurér datatabell
        </ButtonSecondary>
      </div>
    </div>
    <div
      v-else
      class="table-wrapper">
      <transition-group
        v-sortable="{handle: '.villain-block-datatable-item', animation: 500, store: {get: getOrder, set: storeOrder}}"
        class="villain-block-datatable"
        name="fade-move"
        tag="table">
        <tr
          v-for="(item, idx) in rows"
          :key="idx + guid()"
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
      <div class="helpful-actions">
        <ButtonTiny
          @click="$refs.block.openConfig()">
          Konfigurér tabell
        </ButtonTiny>
      </div>
    </div>

    <template slot="config">
      <KInputTable
        v-model="block.data.rows"
        name="data[data]"
        label="Datatabell"
        id-key="key"
        :delete-rows="true"
        :add-rows="false">
        <template v-slot:row="{ entry }">
          <td>
            <KInput
              v-model="entry.key"
              name="entry[key]"
              placeholder="Nøkkel"
              label="Nøkkel" />

            <KInput
              v-model="entry.value"
              name="entry[value]"
              placeholder="Verdi"
              label="Verdi" />
          </td>
        </template>
      </KInputTable>

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

  computed: {

    rows: {
      get () {
        return this.block.data.rows
      },

      set (rows) {
        this.block.data.rows = rows
        return this.block.data.rows
      }
    }
  },

  created () {
    console.debug('<DatatableBlock /> created')
  },

  methods: {
    guid () {
      return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16))
    },

    getOrder (sortable) {
      return this.rows
    },

    storeOrder (sortable) {
      this.sortedArray = sortable.toArray()
      let newOrder = []
      this.sortedArray.forEach(x => {
        const i = this.rows.find(i => {
          return i.key + i.value === x
        })

        if (i) {
          newOrder = [
            ...newOrder,
            i
          ]
        }
      })

      // this.$set(this.block, 'data', newOrder)
      this.rows = newOrder
    },

    addItem () {
      this.rows = [
        ...this.rows,
        { key: 'Nøkkel', value: 'Innhold' }
      ]
    },

    deleteItem (item) {
      const i = this.block.data.rows.find(b => b === item)
      const idx = this.block.data.rows.indexOf(i)
      this.$set(this.block.data, 'rows', [
        ...this.block.data.rows.slice(0, idx),
        ...this.block.data.rows.slice(idx + 1)
      ])
      // this.block.data.splice(idx)
    }
  }
}
</script>

<style lang="postcss" scoped>
  .table-wrapper {
    margin: 0 auto;
  }

  .villain-block-datatable {
    margin: 0 auto;

    .villain-block-datatable-item {
      padding: 0 2rem;

      &:hover {
        cursor: move;
      }

      .villain-block-datatable-item-key {
        font-weight: 500;
        padding-right: 2rem;
        text-align: right;
      }
      .villain-block-datatable-item-value {
        padding-left: 2rem;
      }
    }
  }

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
