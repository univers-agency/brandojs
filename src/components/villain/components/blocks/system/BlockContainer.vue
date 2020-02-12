<template>
  <div>
    <div
      class="villain-block-wrapper">
      <VillainPlus
        @add="$emit('add', $event)"
        @move="$emit('move', $event)" />
    </div>

    <transition-group
      @enter="enter"
      @leave="leave">
      <div
        v-for="(b, index) in cBlocks"
        ref="containers"
        :key="b.uid"
        :data-index="index"
        class="villain-block-container">
        <component
          :is="b.type + 'Block'"
          :block="b"
          @add="$emit('add', $event)"
          @delete="$emit('delete', $event)"
          @move="$emit('move', $event)" />
      </div>
    </transition-group>
  </div>
</template>

<script>
import { TweenMax, Power3 } from 'gsap'
export default {
  name: 'BlockContainer',

  props: {
    blocks: {
      type: Array,
      default: () => []
    }
  },

  data () {
    return {
      uid: null
    }
  },

  computed: {
    cBlocks: {
      get: function () {
        return [...this.blocks]
      },
      set: function (blocks) {
        this.$emit('order', blocks)
      }
    }
  },

  created () {
    console.debug('<BlockContainer /> created')

    this.uid = (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase()
  },

  methods: {
    enter (el, done) {
      TweenMax.fromTo(el, 1,
        {
          opacity: 0,
          x: -5
        },
        {
          opacity: 1,
          x: 0,
          delay: 0.2 * el.dataset.index,
          onComplete: () => {
            TweenMax.set(el, { clearProps: 'transform' })
            done()
          }
        })
    },

    leave (el, done) {
      TweenMax.to(el, 0.5, {
        opacity: 0,
        x: -5,
        onComplete: () => {
          TweenMax.to(el, 0.4, { height: 0, onComplete: done, ease: Power3.easeIn })
        }
      })
    }
  }

}
</script>
