<template>
  <Block
    :block="block"
    :parent="parent"
    :config="showConfig"
    @add="$emit('add', $event)"
    @move="$emit('move', $event)"
    @delete="$emit('delete', $event)"
    @toggle-config="showConfig = $event">
    <div class="villain-block-description">
      Bildekarusell
    </div>
    <div
      ref="block"
      class="villain-block-slideshow">
      <transition-group
        v-if="block.data.images.length"
        v-sortable="{handle: '.villain-block-slideshow-image', animation: 500, store: {get: getOrder, set: storeOrder}}"
        name="fade-move"
        tag="div"
        class="villain-block-slideshow-images">
        <div
          v-for="i in block.data.images"
          :key="i.url"
          :data-id="i.url"
          class="villain-block-slideshow-image"

          @mouseover.stop="imgHover(i, $event)"
          @mouseout="imgLeave"
          @click="toggleImage(i)">
          <i class="fa fa-info-circle info" />
          <div
            v-if="toggledImageUrl === i.url"
            class="villain-block-slideshow-image-overlay">
            <template>
              <FontAwesomeIcon
                icon="info-circle"
                class="mr-2"
                @click.prevent.stop="edit(i, $event)" />
            </template>
            <template>
              <FontAwesomeIcon
                icon="trash"
                @click="del(i)" />
            </template>
          </div>
          <img
            :src="i.url"
            class="img-fluid">
        </div>
      </transition-group>
      <div
        v-else
        class="villain-block-image-empty">
        <i class="fa fa-fw fa-images"></i>
        <div class="actions">
          <ButtonSecondary
            @click="showConfig = true">
            Konfigurér galleriblokk
          </ButtonSecondary>
        </div>
      </div>

      <div
        v-show="editImage"
        ref="popup-wrapper"
        class="villain-block-slideshow-popup-wrapper">
        <div
          ref="popup"
          class="villain-block-slideshow-popup">
          <div class="form-group">
            <label>Endre tittel/bildetekst</label>
            <div
              ref="wrapper"
              class="villain-markdown-input-wrapper">
              <textarea
                ref="txt"
                class="villain-markdown-input"></textarea>
            </div>
            <button
              type="button"
              class="btn btn-primary mt-2"
              @click="editImage = null; toggledImageUrl = null">
              OK
            </button>
          </div>
        </div>
      </div>
    </div>

    <template slot="config">
      <div
        v-if="showTitles">
        <table
          class="table villain-image-table">
          <tr
            v-for="i in block.data.images"
            :key="i.url"
            :data-id="i.url"
            class="villain-block-slideshow-image">
            <td class="fit">
              <img
                :src="i.url"
                class="img-fluid" />
            </td>
            <td class="fit">
              <input
                v-model="i.title"
                class="form-control"
                type="input">
            </td>
          </tr>
        </table>
        <button
          type="button"
          class="btn btn-primary"
          @click="showTitles = false; showImages = true">
          OK
        </button>
      </div>
      <div
        v-if="showUpload">
        <div
          class="display-icon">
          <drop
            class="drop"
            @dragover="dragOver = true"
            @dragleave="dragOver = false"
            @drop="handleDrop">
            <template v-if="dragOver">
              <i class="fa fa-fw fa-cloud-upload-alt"></i>
            </template>
            <template
              v-else>
              <template v-if="uploading">
                <i class="fa fa-fw fa-circle-notch fa-spin"></i>
              </template>
              <template v-else>
                <i class="fa fa-fw fa-image"></i>
              </template>
            </template>
          </drop>
        </div>
        <p class="text-center">
          <template
            v-if="dragOver">
            Slipp for å laste opp!
          </template>
          <template v-else>
            <template v-if="uploading">
              Laster opp ...
            </template>
            <template v-else>
              Dra bildene du vil laste opp hit &uarr;
            </template>
          </template>
        </p>
      </div>
      <div
        v-if="showImages && listStyle"
        class="villain-image-library mt-4">
        <div
          style="text-align: center;padding-bottom: 20px;"
          @click="listStyle = false">
          <i class="fa fa-fw fa-th" />
        </div>
        <table
          class="table villain-image-table">
          <tr
            v-for="i in images"
            :key="i.id">
            <td class="fit">
              <img
                :src="i.thumb"
                :class="alreadySelected(i) ? 'villain-image-table-selected' : ''"
                class="img-fluid"
                @click="selectImage(i)" />
            </td>
            <td>
              <table class="table table-bordered">
                <tr>
                  <td>
                    <span class="text-mono">{{ i.src.substring(i.src.lastIndexOf('/')+1) }}</span>
                  </td>
                  <td>
                    <span class="text-mono text-align-right">
                      {{ i.width }}x{{ i.height }}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>

      <div
        v-else-if="showImages && !listStyle"
        class="villain-image-library row">
        <div
          class="col-12"
          style="text-align: center;padding-bottom: 20px;"
          @click="listStyle = true">
          <i class="fa fa-fw fa-list" />
        </div>
        <div class="col-12 d-flex justify-content-center mb-2">
          <button
            type="button"
            class="btn btn-primary"
            @click="showUpload = true; showImages = false">
            Last opp bilder
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="showTitles = true; showImages = false">
            Endre bildetekster
          </button>
        </div>
        <div
          v-for="i in images"
          :key="i.id"
          class="col-3 mb-3">
          <img
            :src="i.thumb"
            :class="alreadySelected(i) ? 'villain-image-table-selected' : ''"
            class="img-fluid"
            @click="selectImage(i)" />
        </div>
        <div
          class="col-12 form-group mt-4">
          <label>CSS klasser</label>
          <input
            v-model="block.data.class"
            class="form-control"
            type="input">
        </div>
      </div>

      <div class="villain-config-content-buttons">
        <button
          v-if="!showImages && !showTitles"
          type="button"
          class="btn btn-primary"
          @click="showImages = true; showUpload = false; showTitles = false">
          Velg bilder fra bildebibliotek
        </button>
      </div>
    </template>
    <template slot="help">
      <p>
        For å slette et bilde i bildekarusellen, klikker du på bildet, deretter klikker du på søplekasse-ikonet (<i class="fa fa-trash" />)<br><br>
        For å gi bildene bildetekst, klikker du på tannhjulet (<i class="fa fa-cog" />) og deretter "Endre bildetekster"<br><br>
        For å sortere bildene kan du dra og slippe de i ønsket rekkefølge.
      </p>
    </template>
  </Block>
</template>

<script>
import { TweenMax } from 'gsap'
import CodeMirror from 'codemirror'
import 'codemirror/mode/gfm/gfm.js'
import 'codemirror/addon/display/autorefresh.js'

import Block from '../system/Block'
import { Drop } from 'vue-drag-drop'

export default {
  name: 'SlideshowBlock',

  components: {
    Block,
    Drop
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
      uid: null,
      codeMirror: null,
      showConfig: false,
      showImages: true,
      showUpload: false,
      showTitles: false,
      dragOver: false,
      uploading: false,
      images: [],
      listStyle: false,
      toggledImageUrl: null,
      editImage: null
    }
  },

  computed: {
    browseURL () {
      return this.urls.browse + this.block.data.series_slug
    },

    uploadURL () {
      return `${this.urls.base}upload/${this.block.data.series_slug}`
    }
  },

  inject: [
    'urls',
    'headers',
    'available',
    'refresh'
  ],

  created () {
    console.debug('<SlideshowBlock /> created')

    this.getImages()

    if (!this.block.data.images.length) {
      this.showImages = false
      this.showUpload = true
    }
  },

  methods: {
    edit (img, event) {
      const rect = this.$refs.block.getBoundingClientRect()
      const y = event.clientY - rect.top
      TweenMax.set(this.$refs.popup, { autoAlpha: 0, top: y })

      if (this.codeMirror) {
        this.codeMirror.toTextArea()
      }

      this.codeMirror = CodeMirror.fromTextArea(this.$refs.txt, {
        autoRefresh: true,
        mode: 'gfm',
        theme: 'duotone-light',
        tabSize: 2,
        line: true,
        gutters: ['CodeMirror-linenumbers'],
        matchBrackets: true,
        showCursorWhenSelecting: true,
        styleActiveLine: true,
        lineNumbers: true,
        styleSelectedText: true
      })

      this.codeMirror.setValue(img.title || '')
      this.codeMirror.refresh()

      TweenMax.to(this.$refs.popup, 0.7, { delay: 0.3, autoAlpha: 1 })

      this.editImage = img

      this.codeMirror.on('change', cm => {
        if (this.editImage) {
          this.editImage.title = cm.getValue()
        }
      })
    },

    toggleImage (img) {
      if (this.toggledImageUrl === img.url) {
        this.toggledImageUrl = null
        return
      }
      this.toggledImageUrl = img.url
    },

    del (img) {
      let i = this.block.data.images.find(i => i.url === img.url)
      if (i) {
        let idx = this.block.data.images.indexOf(i)
        this.block.data.images = [
          ...this.block.data.images.slice(0, idx),
          ...this.block.data.images.slice(idx + 1)
        ]
      }
    },

    alreadySelected (img) {
      if (this.block.data.images.find(i => i.url === img.src)) {
        return true
      }
      return false
    },

    createUID () {
      return (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase()
    },

    getOrder (sortable) {
      return this.block.data.images
    },

    storeOrder (sortable) {
      this.sortedArray = sortable.toArray()
      let newImages = []
      this.sortedArray.forEach(x => {
        let i = this.block.data.images.find(i => i.url === x)
        newImages = [
          ...newImages,
          i
        ]
      })
      this.block.data.images = newImages
    },

    imgHover (i, e) {
      if (this.toggledImageUrl !== i.url) {
        e.currentTarget.classList.add('hover')
      }
    },

    imgLeave (e) {
      e.currentTarget.classList.remove('hover')
    },

    async getImages () {
      let request
      let headers = new Headers()
      headers.append('accept', 'application/json, text/javascript, */*; q=0.01')

      if (this.headers.extra) {
        for (let key of Object.keys(this.headers.extra)) {
          headers.append(key, this.headers.extra[key])
        }
      }

      request = new Request(this.browseURL, { headers })

      try {
        let response = await fetch(request)
        let data = await response.json()

        if (data.images.length) {
          this.images = data.images
        } else {
          this.images = []
        }
      } catch (e) {
        this.$alerts.alertError('Feil', 'Klarte ikke koble til bildebiblioteket!')
        console.error(e)
      }
    },

    async handleDrop (data, event) {
      event.preventDefault()
      const files = event.dataTransfer.files

      if (files) {
        for (let i = 0; i < files.length; i++) {
          try {
            await this.upload(files.item(i))
          } catch (e) {
            this.$alerts.alertError('Feil', 'Feil ved opplasting :(')
            break
          }
        }
      }

      this.refresh()

      this.showImages = false
      this.uploading = false
      this.showConfig = false
    },

    async upload (f) {
      let request
      let headers = new Headers()
      headers.append('accept', 'application/json, text/javascript, */*; q=0.01')

      if (this.headers.extra) {
        for (let key of Object.keys(this.headers.extra)) {
          headers.append(key, this.headers.extra[key])
        }
      }

      const formData = new FormData()
      formData.append('image', f)
      formData.append('name', f.name)
      formData.append('uid', this.createUID())

      request = new Request(this.uploadURL, { headers, method: 'post', body: formData })

      try {
        this.dragOver = false
        this.uploading = true
        let response = await fetch(request)
        let data = await response.json()

        if (data.status === 200) {
          this.block.data.images = [
            ...this.block.data.images,
            {
              sizes: data.image.sizes,
              credits: '',
              title: '',
              url: data.image.src,
              width: data.image.width,
              height: data.image.height
            }
          ]
        } else {
          this.uploading = false
          this.$alerts.alertError('Feil', `Feil ved opplasting :(\n\n${data.error}'`)
        }
      } catch (e) {
        this.uploading = false
        throw (e)
      }
    },

    selectImage (img) {
      if (this.alreadySelected(img)) {
        return
      }

      this.$set(this.block.data, 'images', [
        ...this.block.data.images,
        {
          sizes: img.sizes,
          credits: img.credits,
          title: img.title,
          url: img.src,
          width: img.width,
          height: img.height
        }
      ])
    }
  }
}
</script>
<style lang="postcss" scoped>
  .villain-block-image-empty {
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

  .drop {
    background-color: white;
    margin-bottom: 20px;
  }
</style>
