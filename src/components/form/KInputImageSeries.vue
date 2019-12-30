<template>
  <KFieldBase
    :name="name"
    :label="label"
    :rules="rules"
    :helpText="helpText"
    :value="value">
    <template v-slot>
    </template>
    <template v-slot:outsideValidator>
      <div
        v-if="innerValue.images.length">
        <transition-group
          v-sortable="{handle: '.sort-handle', animation: 0, store: {get: getOrder, set: storeOrder}}"
          name="fade-move"
          tag="div"
          class="sort-container">
          <div
            v-for="(i, idx) in innerValue.images"
            :key="idx"
            class="image-wrapper sort-handle">
            <img
              :src="i.image.sizes.thumb"
              class="img-fluid"
              @click.stop.prevent="click" />
          </div>
        </transition-group>
      </div>
      <div
        v-else
        class="empty-series">
        Ingen bilder i bildeserien
      </div>
    </template>
  </kfieldbase>
</template>

<script>
export default {
  props: {
    value: {
      type: Object,
      default: () => {}
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

    name: {
      type: String,
      required: true
    }
  },

  computed: {
    id () {
      return this.name.replace('[', '_').replace(']', '_')
    },

    innerValue: {
      get () { return this.value },
      set (innerValue) { this.$emit('input', innerValue) }
    }
  },

  created () {
    this.innerValue = this.value
  }
}
</script>

<style lang="postcss" scoped>
.sort-container {
  display: flex;
  flex-wrap: wrap;
}

.image-wrapper {
  border: 5px solid #000;
  cursor: pointer;
  height: 125px;
  padding: 2px;
  position: relative;
  width: 125px;
  margin: 0.25rem;

  &.selected {
    background-color: theme(colors.blue);
    border: 5px solid theme(colors.blue);
    padding: 0;

    img {
      opacity: 0.50;
    }
  }
}
</style>
