<template>
  <div>
    <svg
      v-if="entry.publishAt"
      v-popover="$t('publish-at') + publishTime"
      width="11"
      height="11"
      viewBox="0 0 11 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <circle
        :class="status"
        cx="5.5"
        cy="5.5"
        r="5.5" />
      <line
        x1="5.5"
        y1="1"
        x2="5.5"
        y2="6"
        stroke="white" />
      <line
        x1="6"
        y1="5.5"
        x2="8"
        y2="5.5"
        stroke="white" />
    </svg>

    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      width="11"
      height="11"
      viewBox="0 0 11 11">
      <circle
        :class="status"
        r="5.5"
        cy="5.5"
        cx="5.5" />
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

  computed: {
    publishTime () {
      if (this.publishAt) {
        return this.entry.publishAt
      }
      return null
    },

    status () {
      if (this.entry.publishAt) {
        if (moment.utc(this.entry.publishAt).diff(moment.utc()) < 0) {
          return this.entry.status
        } else {
          return 'pending'
        }
      }

      return this.entry.status
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
<i18n>
  {
    "en": {
      "publish-at": "Publish at "
    },
    "no": {
      "publish-at": "Publiseres "
    }
  }
</i18n>
