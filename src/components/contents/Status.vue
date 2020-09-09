<template>
  <div>
    <svg
      v-if="publishAt"
      v-popover="'Publiseres ' + publishTime"
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <circle
        :class="status"
        cx="6.5"
        cy="6.5"
        r="6.5" />
      <line
        x1="6.5"
        y1="2"
        x2="6.5"
        y2="7"
        stroke="white" />
      <line
        x1="7"
        y1="6.5"
        x2="9"
        y2="6.5"
        stroke="white" />
    </svg>

    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      width="13"
      height="13"
      viewBox="0 0 13 13">
      <circle
        :class="status"
        r="6.5"
        cy="6.5"
        cx="6.5" />
    </svg>
    <slot></slot>
  </div>
</template>

<script>
import moment from 'moment-timezone'

export default {
  props: {
    entry: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      publishAt: false
    }
  },

  computed: {
    publishTime () {
      if (this.publishAt) {
        return this.entry.publishAt
      }
      return null
    },

    status () {
      if (this.publishAt) {
        if (moment.utc(this.entry.publishAt).diff(moment.utc()) < 0) {
          return this.entry.status
        } else {
          return 'pending'
        }
      }

      return this.entry.status
    }
  },

  watch: {
    entry () {
      if (Object.prototype.hasOwnProperty.call(this.entry, 'publishAt') && this.entry.publishAt !== null) {
        this.publishAt = true
      }
    }
  },

  created () {
    if (Object.prototype.hasOwnProperty.call(this.entry, 'publishAt') && this.entry.publishAt !== null) {
      this.publishAt = true
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
