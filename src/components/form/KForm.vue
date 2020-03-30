<template>
  <transition
    appear
    @enter="enter">
    <div class="form-wrapper">
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
              <div class="buttons">
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
      <template v-if="livePreview && $parent.livePreviewReady">
        <FontAwesomeIcon
          :class="{ active: $parent.livePreviewReady }"
          class="live-preview-icon"
          icon="eye"
          @click="openLivePreview" />
      </template>
    </div>
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
      loading: false,
      livePreview: false
    }
  },

  mounted () {
    const fields = this.$el.querySelectorAll('.field-wrapper')
    this.$nextTick(() => {
      if (fields) {
        gsap.set(fields, { autoAlpha: 0, x: -15 })
      }
    })
    if (this.$parent.hasOwnProperty('livePreview')) {
      this.livePreview = true
    }
  },

  methods: {
    openLivePreview () {
      window.open(
        '/__livepreview?key=' + this.$parent.livePreviewCacheKey,
        '_blank',
        'location=no,menubar=no,resizable=yes,status=no'
      )
    },

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

    enter (el, done) {
      const fields = el.querySelectorAll('.field-wrapper')
      this.$nextTick(() => {
        if (fields) {
          gsap.to(fields, { duration: 0.5, autoAlpha: 1, x: 0, stagger: '0.05', clearProps: 'all', onComplete: done })
        }
      })
    }
  }
}
</script>

<style lang="postcss" scoped>
  .form-wrapper {
    display: flex;
  }

  form {
    width: 100%;
  }

  .live-preview-icon {
    @space right container;
    position: absolute;
    opacity: 0.3;

    &.active {
      opacity: 1;
    }
  }

  .buttons {
    @space margin-top sm;
    display: flex;
    justify-content: space-between;

    > * {
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
