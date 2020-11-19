import cloneDeep from 'lodash/cloneDeep'
import debounce from 'lodash/debounce'
import union from 'lodash/union'
import keys from 'lodash/keys'
import filter from 'lodash/filter'
import eq from 'lodash/eq'
import _toString from 'lodash/toString'

export default function ({ schema, prop, key }) {
  return {
    data () {
      return {
        livePreview: true,
        livePreviewReady: false,
        livePreviewWrapper: null,
        livePreviewCacheKey: null,
        livePreviewPreviousValue: null,
        livePreviewFirstRun: true,
        livePreviewActivated: false
      }
    },

    watch: {
      [prop]: {
        deep: true,
        immediate: true,
        handler: debounce(function (v) {
          if (this.livePreview) {
            if (this.livePreviewReady && this.livePreviewActivated) {
              const changes = this.changes(v, this.livePreviewPreviousValue)
              this.updateLivePreview(changes)
              this.livePreviewPreviousValue = cloneDeep(v)
            }
          }
        }, 1000, true)
      }
    },

    inject: [
      'adminChannel'
    ],

    methods: {
      changes (o1, o2) {
        const ks = union(keys(o1), keys(o2))
        return filter(ks, key => {
          return !eq(toString(o1[key]), _toString(o2[key]))
        }).reduce((p, c) => ({ ...p, [c]: o1[c] }), {})
      },

      openLivePreview () {
        this.livePreviewPreviousValue = cloneDeep(this[prop])
        this.adminChannel.channel
          .push('livepreview:initialize', { schema, prop, key, entry: this[prop] })
          .receive('ok', payload => {
            if (payload.cache_key) {
              this.livePreviewCacheKey = payload.cache_key
              this.livePreviewReady = true

              window.open(
                '/__livepreview?key=' + this.livePreviewCacheKey,
                '_blank',
                'location=no,menubar=no,resizable=yes,status=no'
              )

              this.livePreviewActivated = true
            } else {
              this.livePreviewReady = false
            }
          })
          .receive('error', resp => {
            this.$alerts.alertError('Feil', 'Live preview ikke støttet for denne typen')
            console.error(resp)
          })
      },

      updateLivePreview (entry) {
        if (!this.livePreviewReady) {
          return
        }

        if (!this.livePreviewActivated) {
          return
        }

        // send off entry for rendering
        this.adminChannel.channel
          .push('livepreview:render', { schema, prop, key, entry, cache_key: this.livePreviewCacheKey })
      }
    }
  }
}
