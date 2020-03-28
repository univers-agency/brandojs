<template>
  <div>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 12 12">
      <circle
        :class="status"
        r="6"
        cy="6"
        cx="6" />
    </svg>
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: {
    status: {
      type: String,
      required: true
    }
  }
}
</script>

<style lang="postcss" scoped>
  div {
    display: flex;
  }

  svg {
    circle {
      fill: theme(colors.blue);

      &.draft {
        fill: theme(colors.status.draft);
      }

      &.pending {
        fill: theme(colors.status.pending);
      }

      &.published {
        fill: theme(colors.status.published);
      }

      &.disabled {
        fill: theme(colors.status.disabled);
      }
    }
  }
</style>
