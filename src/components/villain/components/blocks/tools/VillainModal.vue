<template>
  <div class="villain-modal" ref="wrapper">
    <div class="villain-modal__bg" ref="bg"></div>
    <div class="villain-modal__modal" ref="modal">
      <div class="villain-modal__modal__header">
        <slot name="header"></slot>
      </div>

      <div class="villain-modal__modal__content">
        <slot></slot>
      </div>

      <div class="villain-modal__modal__footer">
        <slot name="footer">
          <ButtonSecondary
            @click="$emit('ok')">
            Lukk konfigurasjon
          </ButtonSecondary>
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
import gsap from 'gsap'
export default {
  name: 'VillainModal',

  mounted () {
    const timeline = gsap.timeline()

    gsap.set(this.$refs.modal, { y: 40 })

    timeline
      .to(this.$refs.bg, { opacity: 0.8, duration: 0.25 })
      .to(this.$refs.modal, { opacity: 1, y: 0, duration: 0.25 })
  },

  methods: {
    closeModal () {
      return new Promise((resolve, reject) => {
        const timeline = gsap.timeline()
        timeline
          .to(this.$refs.modal, { opacity: 0, y: 40, duration: 0.25 })
          .to(this.$refs.bg, { opacity: 0, duration: 0.25 })
          .call(() => {
            return resolve()
          })
      })
    }
  }
}
</script>

<style lang="postcss" scoped>
  .villain-modal {
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 99997;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
    opacity: 1;

    & >>> input[type="checkbox"] {
      width: auto !important;
    }

    & >>> input[type="radio"] {
      width: auto !important;
    }

    & >>> input[type="text"] {
      font-size: 18px;
    }

    & >>> label {
      font-size: 17px;
    }

    & >>> .help-text {
      font-size: 17px;
    }

    & >>> input::-webkit-input-placeholder {
      font-size: 18px;
    }
    & >>> input:-ms-input-placeholder {
      font-size: 18px;
    }
    & >>> input:-moz-placeholder {
      font-size: 18px;
    }
    & >>> input::-moz-placeholder {
      font-size: 18px;
    }

    &__bg {
      opacity: 0;
      background-color: theme(colors.blue);
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 99998;
    }

    &__modal {
      display: flex;
      flex-direction: column;
      z-index: 99999;
      opacity: 0;
      max-height: 90vh;
      min-width: 450px;
      border-radius: 15px;

      box-shadow:
        0 2.8px 2.2px rgba(0, 0, 0, 0.045),
        0 6.7px 5.3px rgba(0, 0, 0, 0.065),
        0 12.5px 10px rgba(0, 0, 0, 0.08),
        0 22.3px 17.9px rgba(0, 0, 0, 0.095),
        0 41.8px 33.4px rgba(0, 0, 0, 0.115),
        0 100px 80px rgba(0, 0, 0, 0.16)
      ;


      &__header {
        @fontsize lg;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.75rem;
        background-color: #ffffff;
        border-bottom: 1px solid #efefef;
        border-radius: 15px 15px 0 0;
      }

      &__content {
        overflow-y: auto;

        .row {
          display: grid;
          grid-template-columns: minmax(200px, 450px) minmax(200px, 450px)
        }

        .field-wrapper {
          margin-bottom: 20px;
        }
      }

      &__footer {
        padding: 1rem 1.75rem;
        background-color: #ffffffe0;
        border-radius: 0 0 15px 15px;
      }
    }
  }

  .villain-block-config {
    background-color: #fff;

    button + button {
      margin-top: -1px;
    }

    .villain-block-config-content {
      margin: 0 auto;
      padding: 1rem 1.75rem;
      position: relative;
      background-color: #ffffff;

      .villain-config-content-buttons {
        margin: 0 auto;
        margin-top: 20px;
        text-align: center;
      }

      .help-text {
        font-size: 18px;
      }
    }
  }
</style>