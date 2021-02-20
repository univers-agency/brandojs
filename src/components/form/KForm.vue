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
      <div class="mixins">
        <template v-if="hasRevisions">
          <div class="mixin">
            <ButtonSmall
              @click="openRevisions">
              <FontAwesomeIcon
                icon="code-branch" />
              {{ $t('revisions') }}
            </ButtonSmall>
          </div>
        </template>
        <template v-if="hasLivePreview">
          <div class="mixin">
            <ButtonSmall
              @click="$parent.openLivePreview">
              <FontAwesomeIcon
                icon="eye" />
              Live preview
            </ButtonSmall>
          </div>
        </template>
      </div>
      <div
        class="revisions-drawer"
        :class="{open: showRevisions}">
        <div class="inner">
          <div class="revisions-header">
            <h2>{{ $t('revisions') }}</h2>
            <button
              class="rev-button"
              @click="showRevisions = false">
              {{ $t('close') }}
            </button>
          </div>
          <table class="revisions-table">
            <tr
              v-for="revision in $parent.revisions"
              :key="`${revision.entryName}_${revision.entryId}_${revision.revision}`"
              :class="{ active: $parent.activeRevision === revision }"
              class="revisions-line">
              <td class="fit">#{{ revision.revision }}</td>
              <td class="date fit">{{ revision.insertedAt | datetime }}</td>
              <td class="user">{{ revision.creator.name }}</td>
              <td class="activate fit">
                <button
                  class="rev-button"
                  @click="$parent.selectRevision(revision)">
                  {{ $t('select') }}
                </button>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>

import { gsap } from 'gsap'

export default {

  inject: [
    'adminChannel'
  ],
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
      hasLivePreview: false,
      hasRevisions: false,
      showRevisions: false
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
      this.hasLivePreview = true
    }

    if (this.$parent.hasOwnProperty('revisions')) {
      this.hasRevisions = true
    }
  },

  methods: {
    async validate () {
      const isValid = await this.$refs.observer.validate()
      if (!isValid) {
        this.$alerts.alertError(this.$t('error-form'), this.$t('errors-in-schema'))
        this.loading = false
        return
      }
      this.$emit('save', this.setLoader)
    },

    openRevisions () {
      this.showRevisions = !this.showRevisions
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
  .revisions-drawer {
    height: 100vh;
    width: 650px;
    position: fixed;
    right: 0;
    transform: translateX(100%);
    top: 0;
    background-color: #052753;
    color: azure;
    overflow-x: hidden;
    overflow-y: scroll;
    transition: transform 0.6s cubic-bezier(0.5, 0, 0.75, 0);

    &.open {
      transform: translateX(0%);
      transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
    }

    .inner {
      @space padding 15px;
    }

    .revisions-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;

      h2 {
        @fontsize 35px;
        @space margin-bottom 15px;
      }
    }

    .revisions-table {
      width: 100%;

      .revisions-line {
        &.active {
          td {
            background-color: azure;
            color: #052753;

            button {
              color: #052753;
              border-color: #052753;
            }
          }
        }

        td {
          @font mono;
          white-space: pre-line;
          border: 1px solid azure;
          padding: 5px 10px;
          font-size: 16px;
          transition: color 250ms ease, background-color 250ms ease;

          &.fit {
            white-space: pre;
          }

          &.active {
            width: 30px;
            text-align: center;
          }

          &.activate {
            @font main;
          }
        }
      }
    }
  }

  .rev-button {
    color: azure;
    border: 1px solid azure;
    padding: 10px 20px;
    border-radius: 25px;
    transition: color 450ms ease, background-color 450ms ease;

    &:hover {
      background-color: azure;
      color: #052753;
    }
  }

  .form-wrapper {
    display: flex;
  }

  form {
    width: 100%;
  }

  >>> fieldset {
    margin: 0;
    padding: 0.75em 0.75em 0.75em;
    border: 0;
    margin-bottom: 2rem;
    box-shadow: 0px 0px 2px 0px #0000001c;

    .field-wrapper {
      &:last-of-type {
        margin-bottom: 0;
      }
    }
  }

  .mixins {
    @space right container;
    position: absolute;
    opacity: 1;
    cursor: pointer;

    >>> .small {
      margin-bottom: 8px;
      border-radius: 20px;
      font-size: 13px;

      svg {
        @space margin-right 7px;
      }
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
    "back": "Back to index",
    "error-form": "Form error",
    "errors-in-schema": "Please correct fields with errors",
    "revisions": "Revisions",
    "select": "Select",
    "active": "Active",
    "close": "Close"
  },
  "no": {
    "add": "Legg til",
    "save": "Lagre",
    "back": "Tilbake til oversikten",
    "error-form": "Feil i skjema",
    "errors-in-schema": "Vennligst se over og rett feil i rødt",
    "revisions": "Versjoner",
    "select": "Velg",
    "active": "Aktiv",
    "close": "Lukk"
  }
}
</i18n>
