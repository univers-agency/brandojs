<template>
  <div
    class="list"
    :data-level="level">
    <div class="list-tools">
      <div class="filter">
        <input
          v-if="hasFilterListener"
          v-model="filterValue"
          placeholder="Filter"
          type="text"
          @input="filterInput" />
      </div>
      <transition name="fade">
        <div
          v-if="selectedRows.length"
          class="selected">
          Med
          <div class="circle">
            <span>{{ selectedRows.length }}</span>
          </div> valgte utfør handling &rarr;
          <CircleDropdown>
            <slot
              name="selected"
              v-bind:clearSelection="clearSelection"
              v-bind:entries="selectedRows">
            </slot>
          </CircleDropdown>
        </div>
      </transition>
    </div>
    <div class="list-header">
      <slot name="header"></slot>
    </div>
    <transition-group
      v-sortable="{
        group: level,
        dragoverBubble: true,
        disabled: !sortable,
        handle: '.' + sequenceHandle,
        animation: 250,
        easing: 'cubic-bezier(1, 0, 0, 1)',
        onAdd: onAdd,
        store: {
          get: getOrder,
          set: storeOrder
        }
      }"
      tag="div"
      :data-sort-src="sortParent"
      class="sort-container">
      <div
        v-for="entry in filteredEntries"
        :key="entry[entryKey]"
        :data-id="entry[entryKey]"
        :class="{ selected: isSelected(entry[entryKey]) }"
        class="list-row">
        <div
          class="main-content"
          @click.stop="select(entry[entryKey])">
          <template v-if="sortable">
            <div class="col-1">
              <SequenceHandle
                :class="sequenceHandle" />
            </div>
          </template>
          <template v-if="status">
            <div class="col-1">
              <Status
                class="float-right"
                :status="entry.status" />
            </div>
          </template>
          <slot
            name="row"
            v-bind:entry="entry"></slot>
        </div>
        <div class="children">
          <slot
            name="children"
            v-bind:entry="entry"></slot>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script>
// import { gsap } from 'gsap'

export default {
  props: {
    entries: {
      type: Array,
      required: true
    },

    filter: {
      type: Boolean,
      default: false
    },

    status: {
      type: Boolean,
      default: false
    },

    sortable: {
      type: Boolean,
      default: false
    },

    /* if the sorting gets dragged between lists */
    sortParent: {
      type: String,
      default: '0'
    },

    level: {
      type: Number,
      default: 1
    },

    entryKey: {
      type: String,
      default: 'id'
    },

    sequenceHandle: {
      type: String,
      default: 'sequence-handle'
    }
  },

  data () {
    return {
      filterValue: '',
      selectedRows: []
    }
  },

  computed: {
    filteredEntries () {
      // if (this.filter && this.filterValue !== '') {
      //   return this.entries.filter(e => e[this.filter].toLowerCase().includes(this.filterValue.toLowerCase()))
      // }
      return this.entries
    },

    hasFilterListener () {
      return this.$listeners && this.$listeners.filter
    }
  },

  methods: {
    filterInput () {
      this.$emit('filter', this.filterValue)
    },

    clearSelection () {
      this.selectedRows = []
    },

    select (id) {
      if (this.level > 1) {
        return
      }
      if (this.selectedRows.includes(id)) {
        this.selectedRows = this.selectedRows.filter(r => r !== id)
      } else {
        this.selectedRows.push(id)
      }
    },

    isSelected (id) {
      return this.selectedRows.includes(id)
    },

    onAdd (e) {
      const moveEvent = {
        fromParentId: parseInt(e.from.dataset.sortSrc),
        toParentId: parseInt(e.to.dataset.sortSrc),
        id: parseInt(e.item.dataset.id)
      }

      this.$emit('move', moveEvent)
    },

    enter () {
      // const rows = this.$el.querySelectorAll('.list-row')
      // gsap.to(rows, { duration: 0.5, autoAlpha: 1, x: 0, stagger: 0.05 })
    },

    getOrder () {
      return this.entries
    },

    storeOrder (sortable) {
      this.sortedArray = sortable.toArray().map(Number)
      console.log(this.sortedArray)
      this.$emit('sort', this.sortedArray)
    },

    test () {
      console.log('DOES IT WORK?')
    }
  }
}
</script>

<style lang="postcss">
  .list-tools {
    @row;
    @space margin-bottom xs;
    min-height: 50px;

    .filter {
      @column 8/16;
      display: flex;
      align-items: center;

      input {
        @fontsize lg;
        padding-top: 12px;
        padding-bottom: 12px;
        padding-left: 15px;
        padding-right: 15px;
        margin-left: 15px;
        width: 100%;
        background-color: theme(colors.input);
        border: 0;
      }
    }

    .selected {
      @column 8/16;
      display: flex;
      align-items: center;
      justify-content: flex-end;

      .circle {
        margin-left: 15px;
        margin-right: 15px;
      }

      .wrapper {
        margin-left: 25px;
      }
    }
  }

  .list {
    &[data-level="1"] {
      @space margin-top sm;
    }

    &[data-level="2"] {
      .list-row {
        background-color: theme(colors.peach);
      }
      .list-tools {
        display: none;
      }
    }

    a.link {
      border-bottom: none;
      position: relative;
      color: theme(colors.dark);

      &:after {
        border-top: 2px solid theme(colors.blue);
        content: '';
        position: absolute;
        opacity: 0.5;
        right: 0;
        left: 0;
        bottom: -2px;
        transition: right 350ms ease, color 550ms ease;
      }

      &:hover {
        &:after {
          right: 100%;
          color: theme(colors.blue)
        }
      }
    }

    a {
      border-bottom: none;
      position: relative;
      color: theme(colors.dark);
      padding-top: 3px;

      &:after {
        border-top: 2px solid theme(colors.blue);
        content: '';
        position: absolute;
        right: 100%;
        bottom: 0;
        transition: right 350ms ease, color 550ms ease;
      }

      &:hover {
        &:after {
          transition: right 350ms ease, color 550ms ease;
          right: 0;
          left: 0;
          color: theme(colors.blue)
        }
      }
    }

    .list-header {
      @row;
      font-weight: 500;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.2);
    }

    .list-row {
      border-bottom: 1px solid rgba(0, 0, 0, 0.2);
      background-color: theme(colors.peachLighter);
      user-select: none;

      .center {
        display: flex;
        justify-content: center;
        align-items: center;
      }

      &.selected {
        background-color: theme(colors.peachDarker);
        margin-left: -25px;
        margin-right: -25px;
        padding-left: 25px;
        padding-right: 25px;
      }

      .main-content {
        @row;
        @space padding-top xs;
        @space padding-bottom xs;
        align-items: center;
        min-height: 50px;
      }
    }
  }
</style>
