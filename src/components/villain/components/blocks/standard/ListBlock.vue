<template>
  <div>
    <Block
      ref="block"
      :block="block"
      :parent="parent"
      @add="$emit('add', $event)"
      @move="$emit('move', $event)"
      @duplicate="$emit('duplicate', $event)"
      @delete="$emit('delete', $event)">
      <div
        v-if="!block.data.rows"
        class="villain-block-empty">
        <i class="fa fa-fw fa-table"></i>
        <div class="actions">
          <ButtonSecondary
            @click="$refs.config.openConfig()">
            Konfigurér liste
          </ButtonSecondary>
        </div>
      </div>
      <div
        v-else
        class="table-wrapper">
        <transition-group
          v-sortable="{handle: '.villain-block-list-item', animation: 500, store: {get: getOrder, set: storeOrder}}"
          class="villain-block-list"
          name="fade-move"
          tag="table">
          <tr
            v-for="item in rows"
            :key="item.key"
            :data-id="item.key"
            class="villain-block-list-item">
            <td class="villain-block-list-item-key">
              &rarr;
            </td>
            <td
              class="villain-block-list-item-value"
              v-html="item.value" />
          </tr>
        </transition-group>
        <div class="helpful-actions">
          <ButtonTiny
            @click="$refs.config.openConfig()">
            Konfigurér liste
          </ButtonTiny>
        </div>
      </div>
    </Block>
    <BlockConfig
      ref="config"
      :value="block.data"
      @input="refreshData">
      <template #default="{ cfg }">
        <KInputToggle
          v-model="advanced"
          label="Avansert oppsett"
          name="data[advanced]" />

        <KInput
          v-if="advanced"
          v-model="cfg.id"
          label="Listens CSS-ID"
          name="data[id]" />

        <KInput
          v-if="advanced"
          v-model="cfg.class"
          label="Listens CSS-klasser"
          name="data[class]" />

        <KInputTable
          v-model="cfg.rows"
          name="data[data]"
          label="Liste"
          id-key="key"
          :delete-rows="true"
          :add-rows="false">
          <template v-slot:row="{ entry }">
            <td>
              <KInput
                v-if="advanced"
                v-model="entry.class"
                name="entry[class]"
                placeholder=""
                label="CSS-klasse" />

              <KInputRichText
                v-model="entry.value"
                name="entry[value]"
                placeholder="Innhold"
                label="Innhold" />
            </td>
          </template>
        </KInputTable>

        <div class="d-flex justify-content-center">
          <ButtonSecondary
            @click="addItem(cfg)">
            Legg til ny linje
          </ButtonSecondary>
        </div>
      </template>
    </BlockConfig>
  </div>
</template>

<script>
import Block from '../system/Block'

export default {
  name: 'ListBlock',

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
      advanced: false,
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
    console.debug('<ListBlock /> created')
  },

  methods: {
    refreshData (data) {
      this.$set(this.block.data, 'rows', data.rows)
      this.$set(this.block.data, 'id', data.id)
      this.$set(this.block.data, 'class', data.class)
      this.rows = this.block.data.rows
    },

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
          return i.key === x
        })

        if (i) {
          newOrder = [
            ...newOrder,
            i
          ]
        }
      })

      this.rows = newOrder
    },

    addItem (cfg) {
      cfg.rows = [
        ...cfg.rows,
        { key: this.guid(), class: '', value: '<p>Txt</p>' }
      ]
    },

    deleteItem (item) {
      const i = this.block.data.rows.find(b => b === item)
      const idx = this.block.data.rows.indexOf(i)
      this.$set(this.block.data, 'rows', [
        ...this.block.data.rows.slice(0, idx),
        ...this.block.data.rows.slice(idx + 1)
      ])
    }
  }
}
</script>

<style lang="postcss" scoped>
  .table-wrapper {
    margin: 0 auto;
  }

  .villain-block-list {
    margin: 0 auto;

    .villain-block-list-item {
      padding: 0 2rem;

      &:hover {
        cursor: move;
      }

      .villain-block-list-item-key {
        font-weight: 500;
        padding-right: 2rem;
        text-align: right;
      }
      .villain-block-list-item-value {
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
