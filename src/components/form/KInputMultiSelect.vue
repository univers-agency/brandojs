<template>
  <KFieldBase
    :name="name"
    :label="label"
    :rules="rules"
    :helpText="helpText"
    :value="value">
    <template v-slot>
      <input
        :id="id"
        ref="input"
        v-model="innerValue"
        :placeholder="placeholder"
        :name="name"
        :disabled="disabled"
        type="hidden">
    </template>
    <template v-slot:outsideValidator>
      <modal
        v-if="open"
        ref="modal"
        v-shortkey="['esc']"
        :large="true"
        :show="true"
        :chrome="false"
        @shortkey.native="toggle"
        @cancel="toggle()"
        @ok="toggle()">
        <div class="card">
          <div class="card-header">
            <span>{{ label }}</span>
            <button
              type="button"
              class="btn btn-secondary"
              @click.prevent="toggle()">
              Lukk
            </button>
          </div>
          <div class="card-body">
            <div class="row">
              <div
                ref="list"
                class="half options"
                :style="{ maxHeight: optimizedHeight + 'px' }">
                <div
                  class="megaselect__search"
                  style="line-height: 1.5">
                  <input
                    ref="search"
                    v-model="searchString"
                    name="search"
                    placeholder="Søk..."
                    autocomplete="off"
                    spellcheck="false"
                    class="search"
                    type="text"
                    @keydown.enter.prevent="searchEnter"
                    @keydown.down.prevent="pointerForward()"
                    @keydown.up.prevent="pointerBackward()"
                    @focus="$event.target.select()">
                </div>
                <transition-group name="fade">
                  <div
                    v-for="(option, index) in filteredOptions"
                    :key="option[optionValueKey]"
                    :class="optionHighlight(index, option)"
                    class="options-option"
                    @click="selectOption(option)"
                    @mouseenter.self="pointerSet(index)">
                    <slot
                      name="label"
                      v-bind:option="option">
                      {{ option[optionLabelKey] }}
                    </slot>
                  </div>
                </transition-group>
              </div>
              <div class="half selected-items">
                <transition-group name="fade-move">
                  <div
                    v-for="s in selected"
                    :key="s[optionValueKey]"
                    class="selected-item-row">
                    <slot
                      name="selected"
                      v-bind:entry="s">
                      <CircleFilled />
                      <span>{{ s[optionLabelKey] }}</span>
                    </slot>
                    <button
                      slot
                      type="button"
                      class="remove"
                      @click.stop="selectOption(s)">
                      Fjern
                    </button>
                  </div>
                </transition-group>
              </div>
            </div>
          </div>
        </div>
      </modal>
      <div
        class="selected-items">
        <div
          v-for="s in selected"
          :key="s[optionValueKey]"
          class="selected-item-row">
          <slot
            name="selected"
            v-bind:entry="s">
            <CircleFilled />
            <span>{{ s[optionLabelKey] }}</span>
          </slot>
        </div>
      </div>
      <div
        class="multiselect">
        <div
          style="margin-top: 4px">
          {{ selected.length }} valgte
        </div>
        <button
          class="button-edit"
          @click.self.prevent.stop="toggleFromButton">
          {{ open ? 'Lukk' : 'Endre' }}
        </button>
      </div>
    </template>
  </KFieldBase>
</template>

<script>
import Modal from '../Modal.vue'

export default {
  components: {
    Modal
  },

  props: {
    options: {
      type: Array,
      default: () => []
    },

    disabled: {
      type: Boolean,
      default: false
    },

    helpText: {
      type: String,
      default: null
    },

    rules: {
      type: String
    },

    label: {
      type: String,
      required: true
    },

    placeholder: {
      type: String,
      required: false,
      default: null
    },

    name: {
      type: String,
      required: true
    },

    value: {
      type: [Array],
      default: () => []
    },

    optionValueKey: {
      type: String,
      default: 'id'
    },

    optionLabelKey: {
      type: String,
      default: 'name'
    },

    optionsLimit: {
      type: Number,
      default: 99999
    },

    optionHeight: {
      type: Number,
      default: 37
    },

    maxHeight: {
      type: Number,
      default: 500
    }
  },

  data () {
    return {
      innerValue: null,
      open: false,
      displayValue: '',
      searchString: '',
      preferredOpenDirection: 'below',
      optimizedHeight: this.maxHeight,
      pointer: 0,
      pointerDirty: false,
      showPointer: true,
      selected: []
    }
  },

  computed: {
    pointerPosition () {
      return this.pointer * this.optionHeight
    },

    visibleElements () {
      return this.optimizedHeight / this.optionHeight
    },

    id () {
      return this.name.replace('[', '_').replace(']', '_')
    },

    filteredOptions () {
      const search = this.searchString || ''
      const normalizedSearch = search.toLowerCase().trim()

      let options = this.options.concat()

      /* istanbul ignore else */
      options = this.filterOptions(options, normalizedSearch)

      return options.slice(0, this.optionsLimit)
    }
  },

  watch: {
    selected (val) {
      this.innerValue = val.map(v => v[this.optionValueKey])

      this.$emit('input', this.innerValue)
    }
  },

  created () {
    console.log('val', this.value)
    this.selected = this.value.map(v => {
      if (typeof v === 'object') {
        return v
      } else {
        return this.options.find(o => o[this.optionValueKey].toString() === v.toString())
      }
    })
    this.displayData()
  },

  methods: {
    includes (str, query) {
      if (str === undefined) str = 'undefined'
      if (str === null) str = 'null'
      if (str === false) str = 'false'
      const text = str.toString().toLowerCase()
      return text.indexOf(query.trim()) !== -1
    },

    filterOptions (options, search) {
      return options.filter(option => this.includes(option[this.optionLabelKey], search))
    },

    toggleFromButton () {
      this.toggle()
    },

    toggle () {
      if (!this.open) {
        this.adjustPosition()
        this.open = true
        // this.searchString = this.displayValue
        this.$nextTick(() => this.$refs.search && this.$refs.search.focus())
      } else {
        this.open = false
      }
    },

    displayData () {
      if (!this.innerValue) {
        this.displayValue = ''
      } else {
        const lblData = this.options.find(option => option[this.optionValueKey] === this.innerValue)
        if (lblData) {
          this.displayValue = lblData[this.optionLabelKey]
        }
      }
    },

    selectOption (option) {
      if (this.selected.includes(option)) {
        this.selected = this.selected.filter(s => s !== option)
      } else {
        this.selected.push(option)
      }
    },

    searchEnter () {
      if (this.filteredOptions.length) {
        if (this.filteredOptions.length === 1) {
          this.selectOption(this.filteredOptions[0])
        } else {
          this.selectOption(this.filteredOptions[this.pointer])
        }
      }
    },

    pointerForward () {
      /* istanbul ignore else */
      if (this.pointer < this.filteredOptions.length - 1) {
        this.pointer++
        /* istanbul ignore next */
        if (this.$refs.list.scrollTop <= this.pointerPosition - (this.visibleElements - 1) * this.optionHeight) {
          this.$refs.list.scrollTop = this.pointerPosition - (this.visibleElements - 1) * this.optionHeight
        }
      }
      this.pointerDirty = true
    },

    pointerBackward () {
      if (this.pointer > 0) {
        this.pointer--
        if (this.$refs.list.scrollTop >= this.pointerPosition) {
          this.$refs.list.scrollTop = this.pointerPosition
        }
      }

      this.pointerDirty = true
    },

    pointerReset () {
      this.pointer = 0
      if (this.$refs.list) {
        this.$refs.list.scrollTop = 0
      }
    },

    pointerAdjust () {
      if (this.pointer >= this.filteredOptions.length - 1) {
        this.pointer = this.filteredOptions.length
          ? this.filteredOptions.length - 1
          : 0
      }

      if (this.filteredOptions.length > 0) {
        this.pointerForward()
      }
    },

    pointerSet (index) {
      this.pointer = index
      this.pointerDirty = true
    },

    optionHighlight (index, option) {
      return {
        'option-highlight': index === this.pointer && this.showPointer,
        'option-selected': this.isSelected(option)
      }
    },

    isSelected (option) {
      return this.selected.includes(option)
    },

    adjustPosition () {
      this.optimizedHeight = 400
    }
  }
}
</script>

<style lang="postcss" scoped>
  .multiselect {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 15px;
    padding-right: 15px;
    height: 49px;
    width: 100%;
    background-color: theme(colors.input);
    border: 0;
  }

  .button-edit {
    @fontsize sm/1;
    border: 1px solid theme(colors.dark);
    padding: 8px 12px 3px;
    transition: all 0.25s ease;

    &:hover {
      background-color: theme(colors.dark);
      color: theme(colors.input);
    }
  }

  .selected-items {
    .selected-item-row {
      align-items: center;
      line-height: 1;
      display: flex;
      padding-bottom: 9px;
    }
  }

  .modal {
    .options {
      overflow-y: auto;
      .options-option {
        cursor: pointer;
        color: theme(colors.dark);
        background-color: theme(colors.peach);

        user-select: none;
        padding: 8px 15px 4px;

        &.option-selected {
          background-color: theme(colors.blue);
          color: theme(colors.peach);
        }

        &.option-highlight {
          background-color: theme(colors.blue);
          color: theme(colors.peach);
        }

        &:hover {
          color: theme(colors.peach);
          background-color: theme(colors.dark);
        }
      }
    }

    .selected-items {
      display: flex;
      flex-direction: column;
      align-items: space-between;
      .selected-item-row {
        padding-bottom: 15px;
      }
    }
  }

  button.remove {
    position: absolute;
    right: 0;
    border: 1px solid theme(colors.dark);
    color: theme(colors.dark);
    font-size: 14px;
    text-transform: uppercase;
    padding: 5px 5px 1px;
    margin-top: -2px;
    transition: background-color 0.35s ease, color 0.35s ease;

    &:hover {
      background-color: theme(colors.dark);
      color: theme(colors.peach);
    }
  }

  .search {
    @fontsize base/1;
    width: 100%;
    border: 0;
    outline: none;
    background-color: theme(colors.input);
    margin-bottom: 10px;
    padding: 8px 15px 4px;
  }
</style>
