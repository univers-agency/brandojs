<template>
  <Block
    :block="block"
    :parent="parent"
    :config="showConfig"
    :show-ok="true"
    icon="fa-video"
    @add="$emit('add', $event)"
    @move="$emit('move', $event)"
    @delete="$emit('delete', $event)">
    <div class="villain-block-description">
      Video
    </div>
    <div class="villain-block-video">
      <div
        v-if="html && block.data.source !== 'file'"
        class="villain-block-video-content"
        v-html="html" />
      <div
        v-else-if="html && block.data.source === 'file'"
        class="villain-block-video-file-content"
        v-html="html" />
      <p
        v-else>
        Ingen gyldig video
      </p>
    </div>
    <template slot="config">
      <div
        class="form-group">
        <p>
          Lim inn link til youtube, vimeo eller ekstern fil. <br>
          F.eks <strong>http://www.youtube.com/watch?v=jlbunmCbTBA</strong>
        </p>
        <template
          v-if="block.data.remote_id">
          <label>Eksisterende data ({{ block.data.source }})</label>
          <input
            v-model="block.data.remote_id"
            class="form-control"
            disabled="true"
            type="input">

          <label class="mt-3">Link videoen til denne adressen:</label>
          <input
            v-model="block.data.link"
            class="form-control"
            type="input">

          <label class="mt-3">Lim inn ny adresse</label>
        </template>
        <input
          v-model="url"
          class="form-control"
          type="input"
          @input="parseUrl">
      </div>
      <div
        v-if="block.data.url"
        class="form-group">
        <label>CSS klasser</label>
        <input
          v-model="block.data.class"
          class="form-control"
          type="input">
      </div>
    </template>
  </Block>
</template>

<script>
import Block from '../system/Block'

const VIMEO_REGEX = /(?:http[s]?:\/\/)?(?:www.)?vimeo.com\/(.+)/
const YOUTUBE_REGEX = /(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\?(?:\S*?&?v=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/
const FILE_REGEX = /(.*)/

export default {
  name: 'VideoBlock',

  components: {
    Block
  },

  props: {
    block: {
      type: Object,
      default: () => {}
    },

    parent: {
      type: String,
      default: null
    }
  },

  data () {
    return {
      customClass: '',
      uid: null,
      showConfig: false,
      url: '',
      html: '',

      providers: {
        vimeo: {
          regex: VIMEO_REGEX,
          html: [
            '<iframe src="{{protocol}}//player.vimeo.com/video/{{remote_id}}?title=0&byline=0" ',
            'width="580" height="320" frameborder="0"></iframe>'
          ].join('\n')
        },
        youtube: {
          regex: YOUTUBE_REGEX,
          html: ['<iframe src="{{protocol}}//www.youtube.com/embed/{{remote_id}}" ',
            'width="580" height="320" frameborder="0" allowfullscreen></iframe>'
          ].join('\n')
        },
        file: {
          regex: FILE_REGEX,
          html: ['<video class="villain-video-file" muted="muted" tabindex="-1" loop autoplay src="{{remote_id}}">',
            '<source src="{{remote_id}}" type="video/mp4">',
            '</video>'
          ].join('\n')
        }
      }
    }
  },

  inject: ['available'],

  created () {
    console.debug('<VideoBlock /> created')

    if (!this.block.data.remote_id) {
      this.showConfig = true
    } else {
      this.html = this.providers[this.block.data.source].html
        .replace('{{protocol}}', window.location.protocol)
        .replace('{{remote_id}}', this.block.data.remote_id)
    }
  },

  methods: {
    parseUrl (v) {
      let match
      let url = v.srcElement.value

      for (let key of Object.keys(this.providers)) {
        let provider = this.providers[key]
        match = provider.regex.exec(url)

        if (match !== null && match[1] !== undefined) {
          this.block.data.source = key
          this.block.data.remote_id = match[1]
          this.showConfig = false
          break
        }
      }

      if (!{}.hasOwnProperty.call(this.providers, this.block.data.source)) {
        return false
      }

      this.html = this.providers[this.block.data.source].html
        .replace('{{protocol}}', window.location.protocol)
        .replace('{{remote_id}}', this.block.data.remote_id)
    }
  }
}
</script>
