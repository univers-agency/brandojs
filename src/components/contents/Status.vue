<template>
  <div>
    <svg
      v-if="isWaiting"
      v-popover="$t('publish-at') + publishTime"
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <circle
        :class="status"
        cx="7.5"
        cy="7.5"
        r="7.5" />
      <line
        x1="7.5"
        y1="3"
        x2="7.5"
        y2="7"
        stroke="white" />
      <line
        x1="3.5"
        y1="7.5"
        x2="8"
        y2="7.5"
        stroke="white" />
    </svg>

    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 15 15">
      <circle
        :class="status"
        r="7.5"
        cy="7.5"
        cx="7.5" />
    </svg>
    <slot></slot>
  </div>
</template>

<script>
import { differenceInSeconds, parseISO } from 'date-fns'
import { format } from 'date-fns-tz'

export default {
  props: {
    entry: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      now: null
    }
  },

  computed: {
    publishTime () {
      if (this.entry.publishAt) {
        return format(parseISO(this.entry.publishAt), 'dd.MM.yy @ HH:mm (z)', { timeZone: this.$identity.config.timezone })
      }
      return null
    },

    isWaiting () {
      if (!this.entry.publishAt) {
        return false
      }

      return (differenceInSeconds(parseISO(this.entry.publishAt), this.now) > 0)
    },

    status () {
      if (this.entry.publishAt) {
        if (differenceInSeconds(parseISO(this.entry.publishAt), this.now) < 0) {
          return 'published'
        } else {
          return 'pending'
        }
      }

      return this.entry.status
    }
  },

  created () {
    this.getNow()
    setInterval(this.getNow, 5000)
  },

  destroyed () {
    clearInterval(this.getNow)
  },

  methods: {
    getNow () {
      this.now = Date.now()
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
