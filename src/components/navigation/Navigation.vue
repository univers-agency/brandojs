<template>
  <transition
    appear
    @beforeEnter="beforeEnter"
    @enter="enter">
    <section
      id="navigation"
      ref="nav">
      <div
        id="navigation-content"
        ref="navContent">
        <NavigationHeader ref="header" />
        <CurrentUser />
        <NavigationMenu ref="menu" />
        <transition-group
          appear
          tag="div"
          class="presences"
          name="user-presences"
          :css="false"
          @beforeEnter="beforeEnterUser"
          @enter="enterUser">
          <a
            v-for="(u, idx) in orderedUsers"
            :key="u.id"
            :data-idx="idx"
            :data-user-status="checkPresence(u.id)"
            class="user-presence">
            <div
              :key="u.id"
              v-popover="u.name"
              class="avatar">
              <img :src="u.avatar ? u.avatar.thumb : '/images/admin/avatar.png'" />
            </div>
          </a>
        </transition-group>
      </div>
    </section>
  </transition>
</template>

<script>
import { gsap } from 'gsap'

import CurrentUser from '../user/CurrentUser'
import NavigationHeader from '../navigation/NavigationHeader'
import NavigationMenu from '../navigation/NavigationMenu'

export default {
  name: 'Navigation',

  components: {
    CurrentUser,
    NavigationHeader,
    NavigationMenu
  },

  props: {
    presences: {
      type: Object,
      default: () => {}
    },
    users: {
      type: Array,
      default: () => []
    }
  },

  computed: {
    orderedUsers () {
      const usrs = [...this.users]
      if (!usrs) {
        return []
      }

      return usrs.sort((a, b) => {
        if (this.isOnline(a.id) && this.isOnline(b.id)) {
          return a.name.localeCompare(b.name)
        }
        if (this.isOnline(a.id) && !this.isOnline(b.id)) {
          return -1
        }
        if (!this.isOnline(a.id) && this.isOnline(b.id)) {
          return 1
        }
        return a.name.localeCompare(b.name)
      })
    }
  },

  methods: {
    beforeEnter (el) {
      const els = [this.$refs.header.$el, this.$refs.menu.$el]
      gsap.set(els, { autoAlpha: 0, x: -15 })
    },

    enter (el, done) {
      const els = [this.$refs.header.$el, this.$refs.menu.$el]
      const tl = gsap.timeline({
        onComplete: done, paused: true
      })

      gsap.set(this.$refs.nav, { yPercent: -100, opacity: 1 })
      tl.to(this.$refs.nav, { yPercent: 0, duration: 0.7, ease: 'expo.in', delay: 0.6 })
      tl.to(els, { duration: 0.75, autoAlpha: 1, x: 0, stagger: 0.1 })

      tl.play()
    },

    beforeEnterUser (el) {
      gsap.set(el, { yPercent: 125 })
    },

    enterUser (el, done) {
      gsap.to(el, { delay: 3 + el.dataset.idx * 0.2, yPercent: 0, ease: 'power2.out', onComplete: done })
    },

    checkPresence (userId) {
      if (userId in this.presences) {
        // user is online. check if idle
        const isActive = this.presences[userId].metas.find(m => m.active === true)
        return isActive ? 'online' : 'idle'
      }
      return 'offline'
    },

    isOnline (userId) {
      return userId in this.presences
    }
  }
}
</script>

<style lang="postcss" scoped>
  #navigation {
    @space padding-x md;
    @responsive desktop_xl { width: 370px }
    @responsive desktop_lg { width: 370px }
    @responsive desktop_md { width: 330px }
    @responsive ipad_landscape { width: 330px }
    @responsive mobile { width: 330px }
    @responsive iphone { width: 330px }

    background-color: theme(colors.peach);
    flex-shrink: 0;
    flex-grow: 0;

    height: 0;
    overflow-y: auto;
    opacity: 0;

    #navigation-content {
      @space padding-bottom md;
      @space padding-top sm;
    }
  }

  .presences {
    position: fixed;
    bottom: 5px;
    display: flex;
    flex-wrap: wrap;
  }

  .user-presence {
    display: block;
    margin-right: 5px;
    margin-top: 5px;
    &:last-of-type {
      margin-right: 0;
    }

    > .avatar {
      position: relative;
      display: inline-block;
      width: 30px;
      height: 30px;

      &:after {
        content: " ";
        border-radius: 50%;
        border: 2px solid #efefef;
        top: 0;
        right: 0;
        width: 10px;
        height: 10px;
        position: absolute;
        opacity: 0;
        background-color: forestgreen;
        transition: opacity 1s ease, background-color 2s ease;
      }

      img {
        border-radius: 30px;
      }
    }

    &[data-user-status="offline"] {
      > .avatar {
        img {
          filter: grayscale(100%);
          cursor: pointer;
          transition: all 1.5s ease;
          opacity: .35;
        }
      }
    }

    &[data-user-status="online"] {
      > .avatar {
        img {
          filter: grayscale(0%);
          cursor: pointer;
          transition: all 1.5s ease;
          opacity: 1;
        }

        &:after {
          background-color: rgba(117, 206, 117, 0.84);
          opacity: 1;
          transition: opacity 1s ease, background-color 2s ease;
        }
      }
    }

    &[data-user-status="idle"] {
      > .avatar {
        img {
          filter: grayscale(0%);
          cursor: pointer;
          transition: all 1.5s ease;
          opacity: 1;
        }

        &:after {
          background-color: rgba(242, 188, 34, 0.67);
          opacity: 1;
          transition: opacity 1s ease, background-color 2s ease;
        }
      }
    }
  }
</style>
