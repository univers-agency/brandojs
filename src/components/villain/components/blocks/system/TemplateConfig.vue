<template>
  <div class="template-config">
    <div class="action-wrapper">
      <ButtonTiny
        right
        @click="showConfig = true">
        Maloppsett
      </ButtonTiny>
      <KModal
        v-if="showConfig"
        ref="modal"
        ok-text="OK"
        @ok="closeConfig"
        @cancel="closeConfig">
        <template #header>
          Maloppsett
        </template>
        <div class="panes">
          <div>
            <h4>Blokkvariabler</h4>

            <div
              v-for="(v, key) in vars"
              :key="key">
              <!--
                !TODO - RENDER THIS BASED ON `v.type`
               -->
              <div class="field-wrapper">
                <div class="label-wrapper">
                  <label class="control-label">
                    {{ v.label }}
                  </label>
                </div>
                <input
                  :name="`vars[${key}]`"
                  :value="localVars[key].value"
                  type="text"
                  @input="localVars[key].value = $event.target.value">
              </div>
            </div>

            <button
              class="btn-secondary"
              type="button"
              @click.prevent="updateVars">
              Lagre nye variabelverdier
            </button>
            <button
              class="btn-secondary"
              type="button"
              @click.prevent="refetchVars">
              Hent orginale variabler
            </button>
          </div>
          <div>
            <h4>Refererte blokker [{{ refs.length }}]</h4>
            <div class="form-group">
              <button
                v-for="(ref, idx) in refs"
                :key="idx"
                type="button"
                class="btn-secondary"
                @click="replaceRefWithSource(ref)">
                {{ ref.name }} — Erstatt med referanseblokk
              </button>
            </div>
          </div>
        </div>
      </KModal>
    </div>
  </div>
</template>
<script>
import cloneDeep from 'lodash/cloneDeep'

export default {
  props: {
    entryId: {
      type: String,
      required: false,
      default: null
    },

    templateId: {
      type: [Number, String],
      required: true
    },
    refs: {
      type: Array,
      required: true
    },
    vars: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      showConfig: false,
      localVars: []
    }
  },

  inject: [
    'available'
  ],

  mounted () {
    this.setLocalVars()
  },

  methods: {
    setLocalVars () {
      this.localVars = cloneDeep(this.vars)
    },

    updateVars () {
      this.$emit('updateVars', { newVars: this.localVars })
    },

    refetchVars () {
      const foundTemplate = this.available.templates.find(t => parseInt(t.data.id) === parseInt(this.templateId))
      this.$emit('updateVars', { newVars: foundTemplate.data.vars, entryId: this.entryId })
      this.setLocalVars()
    },

    replaceRefWithSource (ref) {
      const foundTemplate = this.available.templates.find(t => t.data.id === this.templateId)
      const foundRef = foundTemplate.data.refs.find(r => r.name === ref.name)

      // replace our ref with foundRef
      const refIdx = this.refs.indexOf(ref)

      const newRefs = [
        ...this.refs.slice(0, refIdx),
        foundRef,
        ...this.refs.slice(refIdx + 1)
      ]

      this.$emit('updateRefs', { newRefs, entryId: this.entryId })
    },

    closeConfig () {
      this.$refs.modal.close().then(() => {
        this.$nextTick(() => {
          this.showConfig = false
        })
      })
    }
  }
}
</script>
<style lang="postcss" scoped>
  h4 {
    margin-bottom: 25px;
    font-weight: 400;
  }

  .field-wrapper {
    width: 100%;
    margin-bottom: 40px;

    input[type="text"] {
      padding-top: 12px;
      padding-bottom: 12px;
      padding-left: 15px;
      padding-right: 15px;
      width: 100%;
      background-color: #FAEFEA;
      border: 0;
      font-size: 17px;
    }

    .label-wrapper {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;

      > span {
        font-size: 16px;
      }

      label {
        font-weight: 500;

        &:before {
          transition: opacity 0.5s ease;
          content: '';
          opacity: 0;
          position: absolute;
          top: 1px;
          width: 13px;
          height: 13px;
          margin-top: 3px;
          background-image: url("data:image/svg+xml,%3Csvg width='13' height='13' viewBox='0 0 13 13' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='6.5' cy='6.5' r='6.5' fill='%23FF0000'/%3E%3C/svg%3E%0A");
        }

        span {
          transition: padding-left 500ms ease;
          transition-delay: 0.25s;
          padding-left: 0;
        }

        &.failed {
          position: relative;
          &:before {
            transition: opacity 0.5s ease;
            transition-delay: 0.25s;
            opacity: 1;
          }

          span {
            transition: padding-left 500ms ease;
            padding-left: 30px;
          }
        }
      }
    }

    .meta {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
    }
  }
</style>
