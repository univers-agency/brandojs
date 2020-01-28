<template>
  <transition
    appear
    @beforeEnter="beforeEnter"
    @enter="enter">
    <form>
      <ValidationObserver
        ref="observer">
        <template v-slot="{ invalid }">
          <h2
            v-if="subForm"
            :class="{ invalid }">
            {{ subForm }}
          </h2>
          <slot>
          </slot>
          <div class="row">
            <div class="half buttons">
              <ButtonPrimary
                v-if="save"
                v-shortkey="['meta', 's']"
                :loading="loading"
                @shortkey.native="validate"
                @click="validate">
                {{ $t('save') }} (⌘S)
              </ButtonPrimary>
              <ButtonSecondary
                v-if="back"
                :to="back">
                &larr; {{ backText }}
              </ButtonSecondary>
            </div>
          </div>
        </template>
      </ValidationObserver>
    </form>
  </transition>
</template>

<script>

import { gsap } from 'gsap'

export default {
  props: {
    save: {
      type: Boolean,
      default: true
    },

    subForm: {
      type: String,
      default: null
    },

    back: {
      type: [Object, Boolean]
    },

    backText: {
      type: String,
      default: function () {
        return this.$t('back')
      }
    }
  },

  data () {
    return {
      loading: false
    }
  },

  mounted () {
    const fields = this.$el.querySelectorAll('.field-wrapper')
    gsap.set(fields, { autoAlpha: 0, x: -15 })
  },

  methods: {
    async validate () {
      const isValid = await this.$refs.observer.validate()
      if (!isValid) {
        this.$alerts.alertError('Feil i skjema', 'Vennligst se over og rett feil i rødt')
        this.loading = false
        return
      }
      this.$emit('save', this.setLoader)
    },

    setLoader (status) {
      this.loading = status
    },

    beforeEnter (el) {

    },

    enter (el, done) {
      const fields = el.querySelectorAll('.field-wrapper')

      gsap.to(fields, { duration: 0.5, autoAlpha: 1, x: 0, stagger: '0.05', clearProps: 'all' })
    }
  }
}
</script>

<style lang="postcss" scoped>
  .buttons {
    @space margin-top sm;
    display: flex;
    justify-content: space-between;

    > * {
      width: 50%;

      &:nth-child(2) {
        margin-left: 15px;
      }
    }
  }
</style>
<i18n>
{
  "en": {
    "add": "Add",
    "save": "Save",
    "back": "Back to index"
  },
  "nb": {
    "add": "Legg til",
    "save": "Lagre",
    "back": "Tilbake til oversikten"
  }
}
</i18n>
