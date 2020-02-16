<template>
  <Block
    :block="block"
    :parent="parent"
    :config="showConfig"
    icon="fa-compass"
    @add="$emit('add', $event)"
    @move="$emit('move', $event)"
    @delete="$emit('delete', $event)"
    @toggle-config="showConfig = $event">
    <div class="villain-block-video">
      <div
        v-if="html"
        class="villain-block-video-content"
        v-html="html" />
      <div
        v-else
        class="villain-block-empty">
        <i class="fa fa-fw fa-map"></i>
        <div class="actions">
          <ButtonSecondary
            @click="showConfig = true">
            Konfigurér kartblokk
          </ButtonSecondary>
        </div>
      </div>
    </div>
    <template slot="config">
      <div
        class="form-group">
        <p>
          Lim inn embed-link fra Google Maps
        </p>
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

export default {
  name: 'MapBlock',

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

  inject: ['available'],

  data () {
    return {
      customClass: '',
      uid: null,
      showConfig: false,
      url: '',
      html: '',
      providers: {
        gmaps: {
          regex: /<iframe(?:.*)src="(.*?)"/,
          html: `
            <iframe src="{{protocol}}{{embed_url}}"
                    width="600"
                    height="450"
                    frameborder="0"
                    style="border:0"
                    allowfullscreen></iframe>`
        }
      }
    }
  },

  created () {
    console.debug('<MapBlock /> created')

    if (this.block.data.embed_url) {
      this.populateMap()
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
          this.block.data.embed_url = match[1].replace('http:', '').replace('https:', '')
        }
      }

      this.populateMap()
    },

    populateMap () {
      if (!{}.hasOwnProperty.call(this.providers, this.block.data.source)) {
        return false
      }

      this.html = this.providers[this.block.data.source].html
        .replace('{{protocol}}', window.location.protocol)
        .replace('{{embed_url}}', this.block.data.embed_url)
    }
  }
}
</script>

<style lang="postcss" scoped>
  .villain-block-empty {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    svg {
      width: 30%;
      height: 30%;
      max-width: 250px;
      margin-bottom: 25px;
    }
  }
</style>
