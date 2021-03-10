<template>
  <transition
    appear
    @enter="enter">
    <div class="form-wrapper">
      <div class="mixins">
        <template v-if="hasRevisions && $parent.hasId">
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
              {{ $t('live-preview') }}
            </ButtonSmall>
          </div>
          <div class="mixin">
            <ButtonSmall
              @click="$parent.sharePreview(null)">
              <FontAwesomeIcon
                icon="share" />
              {{ $t('share-preview') }}
            </ButtonSmall>
          </div>
        </template>
      </div>
      <form>
        <ValidationObserver
          ref="observer">
          <template #default="{ invalid }">
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
                  data-testid="submit"
                  :loading="loading"
                  @shortkey.native="validate()"
                  @click="validate()">
                  {{ $t('save') }} (⌘S)
                </ButtonPrimary>
                <ButtonSecondary
                  v-if="back"
                  data-testid="back"
                  :to="back">
                  &larr; {{ backText }}
                </ButtonSecondary>
              </div>
            </div>
          </template>
        </ValidationObserver>
      </form>

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
          <div class="revisions-info">
            <p>{{ $t('revisions-help') }}</p>
            <p>
              {{ $t('revision-store-help') }}
            </p>
            <div class="button-group">
              <ButtonSecondary @click="storeRevision($parent.activeRevision)">
                {{ $t('save-version') }}
              </ButtonSecondary>

              <ButtonSecondary @click="$parent.purgeRevisions()">
                {{ $t('purge-versions') }}
              </ButtonSecondary>
            </div>
          </div>
          <table class="revisions-table">
            <template
              v-for="revision in $parent.revisions">
              <tr
                :key="`${revision.entryName}_${revision.entryId}_${revision.revision}`"
                :class="{ active: $parent.activeRevision.revision === revision.revision }"
                class="revisions-line"
                @click="$parent.selectRevision(revision)">
                <td class="fit">
                  #{{ revision.revision }}
                </td>
                <td class="fit">
                  <FontAwesomeIcon
                    v-if="revision.active"
                    icon="star"
                    size="sm" />
                </td>
                <td class="fit">
                  <FontAwesomeIcon
                    v-if="revision.protected"
                    icon="lock"
                    size="sm" />
                </td>
                <td class="date fit">
                  {{ $utils.datetime(revision.insertedAt, $identity.config.timezone) }}
                </td>
                <td class="user">
                  {{ revision.creator.name }}
                </td>
                <td class="activate fit">
                  <CircleDropdown>
                    <li v-if="!revision.active">
                      <button
                        type="button"
                        @click="$parent.activateRevision(revision)">
                        {{ $t('activate-revision') }}
                      </button>
                    </li>
                    <li v-if="!revision.active">
                      <button
                        type="button"
                        @click="$parent.deleteRevision(revision)">
                        {{ $t('delete-revision') }}
                      </button>
                    </li>
                    <li v-if="!revision.active">
                      <button
                        type="button"
                        @click="openPublishModal(revision)">
                        {{ $t('schedule-revision') }}
                      </button>
                      <KModal
                        v-if="showPublishModal && revision === modalRevision"
                        :ref="`publishModal${revision.revision}`"
                        v-shortkey="['esc', 'enter']"
                        :ok-text="$t('close')"
                        @shortkey.native="schedulePublishing(revision)"
                        @ok="schedulePublishing(revision)">
                        <template #header>
                          {{ $t('schedule-revision') }}
                        </template>
                        <KInputDatetime
                          v-model="publishAt"
                          name="publishAt"
                          :label="$t('publishAt-label')"
                          :help-text="$t('publishAt-helpText')" />
                      </KModal>
                    </li>
                    <li>
                      <button
                        type="button"
                        @click="$parent.sharePreview(revision)">
                        {{ $t('share-preview') }}
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        @click="$parent.toggleProtected(revision)">
                        {{ $t(revision.protected ? 'unprotect-revision' : 'protect-revision') }}
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        @click="openDescribeModal(revision)">
                        {{ $t('describe-revision') }}
                      </button>
                      <KModal
                        v-if="showDescribeModal && revision === modalRevision"
                        :ref="`describeModal${revision.revision}`"
                        v-shortkey="['esc', 'enter']"
                        :ok-text="$t('close')"
                        @shortkey.native="describeRevision(revision)"
                        @ok="describeRevision(revision)">
                        <template #header>
                          {{ $t('describe-revision') }}
                        </template>
                        <KInput
                          v-model="description"
                          name="description"
                          :label="$t('description-label')"
                          :help-text="$t('description-helpText')" />
                      </KModal>
                    </li>
                  </CircleDropdown>
                </td>
              </tr>
              <tr
                v-if="revision.description"
                :key="`${revision.entryName}_${revision.entryId}_${revision.revision}_description`"
                :class="{ active: $parent.activeRevision.revision === revision.revision }"
                class="revisions-line"
                @click="$parent.selectRevision(revision)">
                <td colspan="3"></td>
                <td
                  colspan="3"
                  class="revision-description">
                  &uarr; {{ revision.description }}
                </td>
              </tr>
            </template>
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
      type: [Object, Boolean],
      default: false
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
      showRevisions: false,
      showPublishModal: false,
      showDescribeModal: false,
      publishAt: null,
      modalRevision: null
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
    async validate (revision = 0) {
      const isValid = await this.$refs.observer.validate()
      if (!isValid) {
        this.$alerts.alertError(this.$t('error-form'), this.$t('errors-in-schema'))
        this.loading = false
        return
      }
      this.$emit('save', this.setLoader, revision)
    },

    openPublishModal (revision) {
      this.modalRevision = revision
      this.showPublishModal = true
    },

    openDescribeModal (revision) {
      this.modalRevision = revision
      this.description = revision.description
      this.showDescribeModal = true
    },

    async describeRevision (revision) {
      this.$parent.describeRevision(revision, this.description)
      await this.$refs[`describeModal${revision.revision}`][0].close()
      this.showDescribeModal = false
      this.description = null
      this.modalRevision = null
    },

    async schedulePublishing (revision) {
      this.$parent.schedulePublishing(revision, this.publishAt)
      await this.$refs[`publishModal${revision.revision}`][0].close()
      this.showPublishModal = false
      this.publishAt = null
      this.modalRevision = null
    },

    async storeRevision (revision) {
      await this.$parent.$parent.save(this.setLoader, revision.revision)
      await this.$parent.$apollo.queries.revisions.refetch()
      this.$parent.activeRevision = this.$parent.revisions[0]
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

    .button-group {
      display: flex;
      width: 100%;

      button {
        display: flex;
        flex-grow: 1;
        text-align: center;

        + button {
          margin-left: -1px;
        }
      }
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

    .revisions-info {
      @space padding-y 20px;

      p {
        @space margin-bottom 15px;

        &:last-of-type {
          @space! margin-bottom 15px;
        }
      }

      button.button-secondary {
        color: azure;
        border-color: azure !important;

        &:hover {
          color: #052753;
        }
      }
    }

    .revisions-table {
      width: 100%;

      .revisions-line {
        cursor: pointer;
        &.active {
          td {
            background-color: azure;
            color: #052753;

            button {
              color: #052753;
              border-color: #052753;
            }
          }

          >>> .circle-dropdown {
            .main-circle {
              stroke: #052753;
            }

            line {
              stroke: #052753;
            }

            &:hover {
              line {
                stroke: azure;
              }
            }
          }
        }

        td {
          @font mono;
          white-space: pre-line;
          border: 1px solid azure;
          padding: 3px 10px;
          font-size: 13px;
          transition: color 250ms ease, background-color 250ms ease;

          &.fit {
            white-space: nowrap;
            min-width: 34px;
          }

          &.active {
            width: 30px;
            text-align: center;
          }

          &.revision-description {
            padding: 10px 10px;
          }

          &.activate {
            @font main;
          }

          >>> .circle-dropdown {
            .main-circle {
              stroke: azure;
            }

            line {
              stroke: azure;
            }

            &:hover {
              line {
                stroke: azure;
              }
            }
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
    display: flex;
    justify-content: flex-end;
    opacity: 1;
    cursor: pointer;

    >>> .small {
      margin-bottom: 8px;
      margin-left: 5px;
      border-radius: 30px;
      font-size: 13px;
      text-transform: none;
      padding: 8px 15px 8px 14px;

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
    "save-version": "Save version without activating",
    "back": "Back to index",
    "error-form": "Form error",
    "errors-in-schema": "Please correct fields with errors",
    "revisions": "Revisions",
    "live-preview": "Live preview",
    "share-preview": "Share preview",
    "select": "Select",
    "active": "Active",
    "close": "Close",
    "describe-revision": "Describe version",
    "protect-revision": "Protect version",
    "unprotect-revision": "Unprotect version",
    "activate-revision": "Activate version",
    "delete-revision": "Delete version",
    "purge-versions": "Purge inactive versions",
    "revisions-help": "This is a list of this entry's revisions. Click a row to preview.",
    "revision-store-help": "You may also store a new version of the entry without activating it. This might be useful for scheduling content publishing.",
    "schedule-revision": "Schedule publication",
    "publishAt-label": "Publish at",
    "publishAt-helpText": "Entry is set to this version at this time",
    "description-label": "Describe the version",
    "description-helpText": "A short description to help you identify this version"
  },
  "no": {
    "add": "Legg til",
    "save": "Lagre",
    "save-version": "Lagre ny versjon uten å aktivere",
    "back": "Tilbake til oversikten",
    "error-form": "Feil i skjema",
    "errors-in-schema": "Vennligst se over og rett feil i rødt",
    "revisions": "Versjoner",
    "live-preview": "Forhåndsvisning",
    "share-preview": "Del forhåndsvisning",
    "select": "Velg",
    "active": "Aktiv",
    "close": "Lukk",
    "describe-revision": "Beskriv versjonen",
    "protect-revision": "Beskytt versjonen",
    "unprotect-revision": "Ubeskytt versjonen",
    "activate-revision": "Aktivér versjon",
    "delete-revision": "Slett versjon",
    "purge-versions": "Kast inaktive versjoner",
    "revisions-help": "Dette er en liste over tidligere versjoner av det aktive objektet. Klikk på en rad for å se.",
    "revision-store-help": "Du kan også lagre en ny versjon av objektet uten å aktivere. Dette kan være nyttig for å teste ut endringer uten at de går live, for senere å aktivere versjonen.",
    "schedule-revision": "Planlegg publisering",
    "publishAt-label": "Publiseringstidspunkt",
    "publishAt-helpText": "Objektet skiftes til denne versjonen til dette tidspunktet",
    "description-label": "Beskrivelse av versjonen",
    "description-helpText": "En kort tekst som kan hjelpe deg å identifisere versjonen"
  }
}
</i18n>
