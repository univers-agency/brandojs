<template>
  <div>
    <Block
      ref="block"
      :block="block"
      :parent="parent"
      @add="$emit('add', $event)"
      @move="$emit('move', $event)"
      @duplicate="$emit('duplicate', $event)"
      @delete="$emit('delete', $event)">
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
            <i class="fa fa-trash info" />
            <div
              v-if="toggledImageUrl === i.url"
              class="villain-block-slideshow-image-overlay">
              <template>
                <FontAwesomeIcon
                  icon="trash"
                  size="4x"
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
          <FontAwesomeIcon
            icon="images"
            size="6x" />
        </div>
        <div
          key="actions"
          class="actions">
          <ButtonTiny
            @click="$refs.config.openConfig()">
            Konfigurér galleriblokk
          </ButtonTiny>
        </div>
      </div>

      <template slot="help">
        <p>
          For å slette et bilde i bildekarusellen, klikker du på bildet, deretter klikker du på søplekasse-ikonet (<i class="fa fa-trash" />)<br><br>
          For å gi bildene bildetekst, klikker du på "Konfigurér galleriblokk" og deretter "Endre bildetekster"<br><br>
          For å sortere bildene kan du dra og slippe de i ønsket rekkefølge.
        </p>
      </template>
    </Block>
    <BlockConfig
      ref="config">
      <template #default>
        <div class="buttons mb-3">
          <template
            v-if="block.data.images.length">
            <ButtonSecondary
              v-if="listStyle"
              @click="listStyle = false; showUpload = false; showTitles = false; showImages = true">
              Vis som grid
            </ButtonSecondary>
            <ButtonSecondary
              v-else
              @click="listStyle = true; showUpload = false; showTitles = false; showImages = true">
              Vis som liste
            </ButtonSecondary>
            <ButtonSecondary @click="showUpload = true; showImages = false; showTitles = false">
              Last opp bilder
            </ButtonSecondary>
            <ButtonSecondary @click="showTitles = true; showImages = false; showUpload = false">
              Endre bildetekster
            </ButtonSecondary>
          </template>
        </div>
        <div
          v-if="showTitles"
          class="title-cfg">
          <KInputTable
            v-model="block.data.images"
            name="data[images]"
            label="Bildetekster"
            id-key="url"
            :sortable="false"
            :delete-rows="false"
            :add-rows="false">
            <template v-slot:row="{ entry }">
              <div class="panes">
                <div>
                  <td>
                    <img :src="entry.sizes.thumb">
                  </td>
                </div>
                <div>
                  <td>
                    <KInput
                      v-model="entry.title"
                      name="entry[title]"
                      placeholder="Bildetekst"
                      label="Bildetekst" />

                    <KInput
                      v-model="entry.alt"
                      name="entry[alt]"
                      placeholder="Alt tekst"
                      label="Alt. tekst"
                      help-text="Beskrivelse av bildet for universell utforming" />
                  </td>
                </div>
              </div>
            </template>
            <template v-slot:new="">
            </template>
          </KInputTable>
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
                  <i class="fa fa-fw fa-images"></i>
                </template>
              </template>
            </drop>
          </div>
          <div class="text-center mb-3">
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
          </div>
        </div>
        <div
          v-if="showImages && listStyle"
          class="villain-image-library mt-4">
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
            v-for="i in images"
            :key="i.id"
            class="imgthumb mb-3">
            <img
              :src="i.thumb"
              :class="alreadySelected(i) ? 'villain-image-table-selected' : ''"
              class="img-fluid"
              @click="selectImage(i)" />
          </div>
          <div
            class="col-12 form-group mt-4">
            <KInput
              v-model="block.data.class"
              name="block[data][class]"
              label="CSS klasser" />
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
    </BlockConfig>
  </div>
</template>

<script>
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
    seriesSlug () {
      return this.block.data.series_slug ? this.block.data.series_slug : 'post'
    },

    browseURL () {
      return this.urls.browse + this.seriesSlug
    },

    uploadURL () {
      return `${this.urls.base}upload`
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
    toggleImage (img) {
      if (this.toggledImageUrl === img.url) {
        this.toggledImageUrl = null
        return
      }
      this.toggledImageUrl = img.url
    },

    del (img) {
      const i = this.block.data.images.find(i => i.url === img.url)
      if (i) {
        const idx = this.block.data.images.indexOf(i)
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
        const i = this.block.data.images.find(i => i.url === x)
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
      const headers = new Headers()
      headers.append('accept', 'application/json, text/javascript, */*; q=0.01')

      if (this.headers.extra) {
        for (const key of Object.keys(this.headers.extra)) {
          headers.append(key, this.headers.extra[key])
        }
      }

      const request = new Request(this.browseURL, { headers })

      try {
        const response = await fetch(request)
        const data = await response.json()

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

      this.showImages = false
      this.uploading = false
      this.showTitles = true
      this.showUpload = false
      this.$refs.config.closeConfig()
    },

    async upload (f) {
      const headers = new Headers()
      headers.append('accept', 'application/json, text/javascript, */*; q=0.01')

      if (this.headers.extra) {
        for (const key of Object.keys(this.headers.extra)) {
          headers.append(key, this.headers.extra[key])
        }
      }

      const formData = new FormData()
      formData.append('image', f)
      formData.append('slug', this.seriesSlug)
      formData.append('name', f.name)
      formData.append('uid', this.createUID())

      const request = new Request(this.uploadURL, { headers, method: 'post', body: formData })

      try {
        this.dragOver = false
        this.uploading = true
        const response = await fetch(request)
        const data = await response.json()

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
  .imgthumb {
    width: 150px;
  }

  .villain-block-image-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    svg {
      height: auto;
      max-width: 250px;
    }
  }

  .image-caption {
    align-self: center;
  }

  .actions {
    text-align: center;
  }

  >>> .buttons {
    display: flex;
  }

  .title-cfg {
    >>> .panes {
      padding-top: 20px;
      & > * {
        min-width: auto !important;
      }
    }
  }
</style>
