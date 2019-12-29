<template>
  <transition
    @beforeAppear="beforeAppear"
    @appear="appear">
    <main>
      <GridDebug />
      <div
        ref="progress"
        class="progress">
        <transition-group
          name="slide-fade"
          tag="div"
          class="progress-inner"
          appear>
          <div
            v-for="k in Object.keys(progressStatus)"
            :key="k">
            <transition
              name="fade"
              mode="out-in"
              :duration="250">
              <i
                v-if="progressStatus[k].percent !== 100"
                key="working"
                :class="'fal fa-fw mr-3 fa-cog fa-spin'" />
              <i
                v-else
                key="done"
                :class="'fal fa-fw mr-3 fa-check text-success'" />
            </transition>
            <div
              class="d-inline-block"
              v-html="progressStatus[k].content" />
            <div
              class="bar"
              :style="{ width: progressStatus[k].percent + '%' }"></div>
          </div>
        </transition-group>
      </div>
      <transition
        mode="out-in"
        v-bind:css="false"
        appear
        @beforeAppear="beforeAppearContent"
        @appear="appearContent"
        @afterLeave="afterLeave"
        @leave="leave">
        <router-view class="content" />
      </transition>
    </main>
  </transition>
</template>

<script>

import { gsap } from 'gsap'
import GridDebug from '../debug/GridDebug'

export default {
  name: 'Content',
  components: {
    GridDebug
  },

  props: {
    showProgress: {
      type: Boolean,
      required: true
    },

    progressStatus: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
    }
  },

  watch: {
    showProgress (val) {
      if (val) {
        console.log('play progress')
        this.progressTimeline.play()
      } else {
        console.log('reverse progress')
        this.progressTimeline.reverse()
      }
    }
  },

  mounted () {
    this.progressTimeline = gsap.timeline({ paused: true, reversed: true })

    this.progressTimeline
      .to(this.$refs.progress, {
        duration: 0.35,
        height: 100,
        opacity: 1,
        ease: 'sine.out'
      })
  },

  methods: {
    afterLeave () {
      window.scrollTo(0, 0)
    },

    beforeAppear (el) {
      gsap.set(el, { yPercent: -100 })
    },

    appear (el, done) {
      const tl = gsap.timeline({
        onComplete: done
      })

      tl
        .to(el, {
          duration: 0.7,
          yPercent: 0,
          delay: 1.4,
          ease: 'power3.out',
          clearProps: 'transform'
        })
    },

    beforeAppearContent (el) {
      gsap.set(el, { x: -25, autoAlpha: 0 })
    },

    appearContent (el, done) {
      const tl = gsap.timeline({
        onComplete: done
      })

      tl.to(el, {
        duration: 0.7,
        x: 0,
        delay: 2,
        autoAlpha: 1,
        ease: 'power3.out',
        clearProps: 'transform'
      })
    },

    leave (el, done) {
      console.log('leave')
      const tl = gsap.timeline({
        onComplete: done
      })

      tl.to(el, {
        duration: 0.2,
        autoAlpha: 0
      })
    }
  }
}
</script>

<style lang="postcss">
  main {
    position: relative;
    width: 100%;
    min-height: 100vh;
    background-color: #ffffff;
    display: flex;
    flex-direction: column;
    padding-bottom: 100px;

    > .content {
      @space padding-left md;
      @space padding-right md;
      @space padding-bottom md;
    }

    > .progress {
      @container;
      z-index: 9999;
      color: theme(colors.peach);
      background-color: theme(colors.dark);
      height: 0px;
      overflow-y: scroll;
      display: flex;
      opacity: 0;
      position: fixed;

      .progress-inner {
        display: flex;
        align-items: center;

        div {
          margin-top: -5px;
        }
      }

      .bar {
        height: 2px;
        background-color: theme(colors.peach);
        transition: width 0.75s ease;
      }
    }
  }

  .fader-1, .fader-2 {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 100;
  }

  .fader-1 {
    /* background-color: theme(colors.peachDarker); */
    background-color: blue;
    z-index: 101;
  }

  .fader-2 {
    /* background-color: theme(colors.peachDarkest); */
    z-index: 102;
    background-color: red;
  }
</style>
