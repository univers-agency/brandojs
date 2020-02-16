<template>
  <article class="checkorx">
    <FontAwesomeIcon class="icon" :icon="val ? 'check' : 'times'" fixed-width />
    <div class="label" v-if="label">{{ label }}</div>
  </article>
</template>

<script>

export default {
  props: {
    label: {
      type: String,
      default: null
    },

    val: {
      type: Boolean,
      required: true
    }
  },

  methods: {
  }
}
</script>

<style lang="postcss" scoped>
  .checkorx {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 25px;
    border: 1px solid theme(colors.dark);
    padding: 7px 10px;

    .icon + .label {
      margin-left: 7px;
      padding-right: 5px;
    }

    .label {
      @font mono xs/1;
      text-transform: uppercase;
    }
  }
</style>
