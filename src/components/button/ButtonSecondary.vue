<template>
  <router-link
    v-if="to"
    :class="{ narrow }"
    :to="to">
    <slot></slot>
  </router-link>
  <button
    v-else
    type="button"
    :class="{ narrow }"
    @click.prevent="$emit('click')">
    <slot></slot>
  </button>
</template>

<script>
export default {
  props: {
    to: {
      type: [Object, Boolean]
    },

    narrow: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="postcss" scoped>
  a {
    padding-top: 14px;
    display: inline-block;
  }

  button {
    padding-top: 5px;
  }

  button, a {
    color: theme(colors.dark);
    border: 1px solid theme(colors.dark);
    background-color: transparent;
    padding: 15px 25px 16px;
    min-width: 205px;
    text-align: center;
    transition: background-color 0.25s ease, border-color 0.25s ease;

    &.narrow {
      min-width: 80px;
    }

    &:hover {
      background-color: theme(colors.peach);
    }

    + button, + a {
      margin-left: -1px;
    }
  }
</style>
