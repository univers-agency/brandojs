import debounce from 'lodash.debounce'

export default function ({ schema, prop, key }) {
  return {
    data () {
      return {
        livePreview: true,
        livePreviewReady: false,
        livePreviewWrapper: null,
        livePreviewCacheKey: null,
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
              this.updateLivePreview(v)
            }
          }
        }, 500, true)
      }
    },

    inject: [
      'adminChannel'
    ],

    methods: {
      openLivePreview () {
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
        // TODO: Maybe diff this against the last sent data and only send the diff?
        this.adminChannel.channel
          .push('livepreview:render', { schema, prop, key, entry, cache_key: this.livePreviewCacheKey })
      }
    }
  }
}
