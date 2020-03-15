<template>
  <div
    class="list"
    :data-level="level">
    <div
      v-if="selectable"
      class="list-tools">
      <div
        v-if="shouldFilter && filterKey"
        class="filter">
        <div
          class="filter-key"
          @click="changeFilterKey">
          {{ filterKey }}
        </div>
        <input
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
      appear
      name="fade"
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
                :center="true"
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
    <div v-if="level === 1 && hasMoreListener">
      <ButtonSecondary
        class="mt-3"
        @click="$emit('more')">
        Last inn flere
      </ButtonSecondary>
    </div>
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

    selectable: {
      type: Boolean,
      default: true
    },

    queryVars: {
      type: Object,
      default: () => {}
    },

    /*
    Keys we can choose between for filtering
    */
    filterKeys: {
      type: Array,
      default: () => []
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
      filterKey: null,
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

    shouldFilter () {
      return this.$parent.queryVars.hasOwnProperty('filter')
    },

    hasMoreListener () {
      return this.$listeners && this.$listeners.more
    }
  },

  created () {
    if (this.filterKeys.length) {
      this.filterKey = this.filterKeys[0]
    }

    if (this.shouldFilter && !this.filterKeys.length) {
      console.error('ContentList: No filterKeys set, but @filter listener provided!')
    }
  },

  methods: {
    changeFilterKey () {
      if (this.filterKeys.length <= 1) {
        return
      }

      const idx = this.filterKeys.findIndex(k => k === this.filterKey)
      if (idx !== this.filterKeys.length - 1) {
        this.filterKey = this.filterKeys[idx + 1]
      } else {
        this.filterKey = this.filterKeys[0]
      }
    },

    filterInput () {
      const queryVars = { ...this.$parent.queryVars, filter: { [this.filterKey]: this.filterValue }}
      this.$emit('updateQuery', queryVars)
    },

    clearSelection () {
      this.selectedRows = []
    },

    select (id) {
      if (!this.selectable) {
        return
      }
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
      background-color: theme(colors.input);

      input {
        @fontsize base;
        padding-top: 12px;
        padding-bottom: 12px;
        padding-left: 15px;
        padding-right: 15px;
        background-color: theme(colors.input);
        width: 100%;
        border: 0;
        border-left: 5px solid white;
      }

      .filter-key {
        @font mono;
        cursor: pointer;
        user-select: none;
        left: 15px;
        font-size: 14px;
        text-transform: uppercase;
        border: 1px solid theme(colors.blue);
        padding: 2px 5px 0px;
        margin-top: 1px;
        margin-left: 15px;
        margin-right: 15px;
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

    + .list {
      .list-header:empty {
        display: none;
      }
    }

    a.link, a.entry-link {
      border-bottom: none;
      position: relative;
      color: theme(colors.dark);
      text-decoration: underline;
      text-decoration-color: transparent;
      transition: text-decoration-color 1s ease;

      &:after {
        content: '↗';
        opacity: 0.4;
        right: 0;
        color: theme(colors.dark);
        transform: scale(0.8) translateY(2px) rotate(0deg);
        transition: transform 250ms ease, opacity 250ms ease, color 250ms ease;
        display: inline-block;
      }

      &:hover {
        text-decoration-color: theme(colors.blue);
        &:after {
          opacity: 1;
          transform: scale(0.8) translateY(2px) rotate(45deg);
          /* transition: transform 250ms ease, opacity 250ms ease, color 250ms ease; */
        }
      }
    }

    a {
      border-bottom: none;
      position: relative;
      color: theme(colors.dark);
    }

    .list-header {
      @row;
      font-weight: 500;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.2);
    }

    .list-row {
      border-bottom: 1px solid rgba(0, 0, 0, 0.2);
      background-color: white;
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
