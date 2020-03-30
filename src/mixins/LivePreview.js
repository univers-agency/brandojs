import debounce from 'lodash.debounce'
// import morphdom from 'morphdom'

export default function ({ schema, prop, key }) {
  return {
    data () {
      return {
        livePreview: true,
        livePreviewReady: false,
        livePreviewWrapper: null,
        livePreviewCacheKey: null,
        livePreviewFirstRun: true
      }
    },

    watch: {
      [prop]: {
        deep: true,
        immediate: true,
        handler: debounce(function (v) {
          if (this.livePreview) {
            if (this.livePreviewFirstRun) {
              this.livePreviewFirstRun = false
              this.initializeLivePreview(v)
            } else {
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
      initializeLivePreview (entry) {
        this.adminChannel.channel
          .push('livepreview:initialize', { schema, prop, key, entry })
          .receive('ok', payload => {
            if (payload.cache_key) {
              this.livePreviewCacheKey = payload.cache_key
              this.livePreviewReady = true
            } else {
              this.livePreviewReady = false
            }
          })
      },

      updateLivePreview (entry) {
        if (!this.livePreviewReady) {
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
