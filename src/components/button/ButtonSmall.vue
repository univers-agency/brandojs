<template>
  <router-link
    v-if="to"
    class="small"
    :class="{static: position === 'static'}"
    :to="to">
    <slot></slot>
  </router-link>
  <button
    v-else
    type="button"
    :class="{static: position === 'static'}"
    class="small">
    <slot></slot>
  </button>
</template>

<script>
export default {
  props: {
    to: {
      type: [Object, Boolean]
    },
    position: {
      type: String,
      default: 'absolute'
    }
  }
}
</script>

<style lang="postcss" scoped>
  button.small, a.small {
    position: absolute;
    right: 0;
    border: 1px solid theme(colors.dark);
    color: theme(colors.dark);
    font-size: 14px;
    text-transform: uppercase;
    padding: 4px 7px 4px;
    margin-top: -2px;
    transition: background-color 0.35s ease, color 0.35s ease;

    &.static {
      position: static;
    }

    &:hover {
      background-color: theme(colors.dark);
      color: theme(colors.peach);
    }
  }
</style>
