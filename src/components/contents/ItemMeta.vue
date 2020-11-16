<template>
  <article class="item-meta">
    <section
      v-if="showAvatar"
      class="avatar-wrapper">
      <div class="avatar">
        <img :src="user.avatar ? user.avatar.thumb : '/images/admin/avatar.png'" />
      </div>
    </section>
    <section class="content">
      <div class="info">
        <div class="name">
          {{ user.name || 'Systemroboten' }}
        </div>
        <div class="time">
          {{ getDate(entry.updatedAt) }} <span>•</span> {{ getTime(entry.updatedAt) }}
        </div>
      </div>
    </section>
  </article>
</template>

<script>

import { parseISO } from 'date-fns'
import { format } from 'date-fns-tz'

export default {
  props: {
    user: {
      type: Object,
      default: () => {}
    },

    entry: {
      type: Object,
      default: () => {}
    },

    showAvatar: {
      type: Boolean,
      default: true
    }
  },

  methods: {
    getDate (datetime) {
      if (!datetime) {
        return '—'
      }
      return format(parseISO(datetime), 'dd.MM.yy', { timeZone: 'Europe/Oslo' })
    },

    getTime (datetime) {
      if (!datetime) {
        return '—'
      }
      return format(parseISO(datetime), 'HH:mm', { timeZone: 'Europe/Oslo' })
    }
  }
}
</script>

<style lang="postcss" scoped>
  .item-meta {
    display: flex;
    align-items: center;

    .avatar-wrapper {
      align-items: center;
      display: flex;
      margin-right: 15px;

      .avatar {
        width: 38px;
        height: 38px;

        img {
          user-select: none;
          border-radius: 38px;
        }
      }
    }

    .content {
      display: flex;
      line-height: 1.3;
      justify-content: space-between;
      padding-left: 15px;
      border-left: 1px solid;
      padding-top: 2px;

      .name {
        font-weight: normal;
        font-size: 14px;
        user-select: none;
      }

      .time {
        font-size: 12px;
        opacity: 0.7;
        user-select: none;
        text-transform: uppercase;

        span {
          @color fg dark;
          opacity: 1;
        }
      }
    }
  }
</style>
