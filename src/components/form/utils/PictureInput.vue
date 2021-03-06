<template>
  <div
    id="picture-input"
    ref="container"
    class="picture-input">
    <div
      v-if="!supportsUpload"
      v-html="strings.upload"></div>
    <div
      class="preview-container"
      :style="{ borderRadius: radius + '%'}">
      <div v-show="!imageSelected && !plain">
        <canvas
          ref="grayCanvas"
          class="picture-preview"
          tabindex="0"
          :class="computedClasses"
          :style="{ zIndex: zIndex + 1, display: imageSelected ? 'none' : 'block' }"
          @drag.stop.prevent=""
          @dragover.stop.prevent=""
          @dragstart.stop.prevent=""
          @dragend.stop.prevent=""
          @dragenter.stop.prevent="onDragEnter"
          @dragleave.stop.prevent="onDragLeave"
          @drop.stop.prevent="onFileDrop"
          @click.prevent="onClick"
          @keyup.enter="onClick">
        </canvas>
        <div
          v-if="!imageSelected && !plain"
          class="picture-inner"
          :style="{ zIndex: zIndex + 2 }">
          <span
            v-if="supportsDragAndDrop"
            class="picture-inner-text"
            v-html="strings.drag"></span>
          <span
            v-else
            class="picture-inner-text"
            v-html="strings.tap"></span>
        </div>
      </div>
      <template v-if="imageSelected">
        <FocusPoint v-model="focus">
          <canvas
            ref="previewCanvas"
            class="picture-preview"
            tabindex="0"
            :class="computedClasses"
            :style="{ zIndex: zIndex + 1 }"
            @drag.stop.prevent=""
            @dragover.stop.prevent=""
            @dragstart.stop.prevent=""
            @dragend.stop.prevent=""
            @dragenter.stop.prevent="onDragEnter"
            @dragleave.stop.prevent="onDragLeave"
            @drop.stop.prevent="onFileDrop"
            @click.prevent="onClick"
            @keyup.enter="onClick">
          </canvas>
        </FocusPoint>
      </template>
    </div>
    <button
      v-if="imageSelected && !hideChangeButton"
      @click.prevent="selectImage(true)">
      {{ strings.change }}
    </button>
    <button
      v-if="imageSelected && removable"
      @click.prevent="removeImage">
      {{ strings.remove }}
    </button>
    <button
      v-if="imageSelected && toggleAspectRatio && width !== height"
      :class="aspectButtonClass"
      @click.prevent="rotateImage">
      {{ strings.aspect }}
    </button>
    <input
      :id="id"
      ref="fileInput"
      type="file"
      :name="name"
      :accept="accept"
      @change="onFileChange">
  </div>
</template>

<script>
import FocusPoint from '../../images/FocusPoint'

export default {
  name: 'PictureInput',
  components: {
    FocusPoint
  },
  props: {
    width: {
      type: [String, Number],
      default: Number.MAX_SAFE_INTEGER
    },
    height: {
      type: [String, Number],
      default: Number.MAX_SAFE_INTEGER
    },
    margin: {
      type: [String, Number],
      default: 0
    },
    accept: {
      type: String,
      default: 'image/*'
    },
    size: {
      type: [String, Number],
      default: Number.MAX_SAFE_INTEGER
    },
    name: {
      type: String,
      default: null
    },
    id: {
      type: [String, Number],
      default: null
    },
    focal: {
      type: Object,
      default: null
    },
    buttonClass: {
      type: String,
      default: 'btn btn-primary button'
    },
    removeButtonClass: {
      type: String,
      default: 'btn btn-secondary button secondary'
    },
    aspectButtonClass: {
      type: String,
      default: 'btn btn-secondary button secondary'
    },
    prefill: {
      type: [String, File],
      default: ''
    },
    prefillOptions: {
      type: Object,
      default: () => {
        return {}
      }
    },
    crop: {
      type: Boolean,
      default: true
    },
    radius: {
      type: [String, Number],
      default: 0
    },
    removable: {
      type: Boolean,
      default: false
    },
    hideChangeButton: {
      type: Boolean,
      default: false
    },
    autoToggleAspectRatio: {
      type: Boolean,
      default: false
    },
    toggleAspectRatio: {
      type: Boolean,
      default: false
    },
    changeOnClick: {
      type: Boolean,
      default: true
    },
    plain: {
      type: Boolean,
      default: false
    },
    zIndex: {
      type: Number,
      default: 10
    },
    alertOnError: {
      type: Boolean,
      default: true
    },
    customStrings: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      focus: null,
      imageSelected: false,
      previewHeight: 0,
      previewWidth: 0,
      draggingOver: false,
      canvasWidth: 0,
      canvasHeight: 0,
      strings: {
        upload: '<p>Your device does not support file uploading.</p>',
        drag: 'Drag an image or <br>click here to select a file',
        tap: 'Tap here to select a photo <br>from your gallery',
        change: 'Change Photo',
        aspect: 'Landscape/Portrait',
        remove: 'Remove Photo',
        select: 'Select a Photo',
        selected: '<p>Photo successfully selected!</p>',
        fileSize: 'The file size exceeds the limit',
        fileType: 'This file type is not supported.'
      }
    }
  },
  computed: {
    supportsUpload () {
      if (navigator.userAgent.match(/(Android (1.0|1.1|1.5|1.6|2.0|2.1))|(Windows Phone (OS 7|8.0))|(XBLWP)|(ZuneWP)|(w(eb)?OSBrowser)|(webOS)|(Kindle\/(1.0|2.0|2.5|3.0))/)) {
        return false
      }
      const el = document.createElement('input')
      el.type = 'file'
      return !el.disabled
    },
    supportsDragAndDrop () {
      const div = document.createElement('div')
      return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && !('ontouchstart' in window || navigator.msMaxTouchPoints)
    },
    computedClasses () {
      const classObject = {}
      classObject['dragging-over'] = this.draggingOver
      return classObject
    },
    fontSize () {
      return Math.min(0.04 * this.previewWidth, 21) + 'px'
    }
  },
  watch: {
    prefill () {
      if (this.prefill) {
        this.preloadImage(this.prefill, this.prefillOptions)
      } else {
        this.removeImage()
      }
    },

    focus (f) {
      this.$emit('focalChanged', f)
    }
  },
  mounted () {
    this.updateStrings()

    if (this.prefill) {
      this.preloadImage(this.prefill, this.prefillOptions)
    }

    if (this.focal && this.prefill) {
      this.focus = this.focal
    }

    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize)
      this.onResize()

      this.pixelRatio = Math.round(window.devicePixelRatio || window.screen.deviceXDPI / window.screen.logicalXDPI)
      const canvas = this.$refs.previewCanvas

      if (canvas && canvas.getContext) {
        this.context = canvas.getContext('2d')
        this.context.scale(this.pixelRatio, this.pixelRatio)
      }

      if (this.accept !== 'image/*') {
        this.fileTypes = this.accept.split(',')
        this.fileTypes = this.fileTypes.map(s => s.trim())
      }

      this.canvasWidth = this.width
      this.canvasHeight = this.height

      this.$emit('init', this.image)
    })
  },

  beforeDestroy () {
    window.removeEventListener('resize', this.onResize)
  },

  methods: {
    updateStrings () {
      for (const s in this.customStrings) {
        if (s in this.strings && typeof this.customStrings[s] === 'string') {
          this.strings[s] = this.customStrings[s]
        }
      }
    },

    onClick () {
      if (!this.imageSelected) {
        this.selectImage()
        return
      }

      if (this.changeOnClick) {
        this.selectImage(true)
      }

      this.$emit('click')
    },

    onResize () {
      this.resizeCanvas()

      if (this.imageObject) {
        this.drawImage(this.imageObject)
      }
    },

    onDragEnter () {
      if (!this.supportsDragAndDrop) {
        return
      }
      this.draggingOver = true
    },

    onDragLeave () {
      if (!this.supportsDragAndDrop) {
        return
      }
      this.draggingOver = false
    },

    onFileDrop (e) {
      this.onDragLeave()
      this.onFileChange(e)
    },

    onFileChange (e, prefill) {
      const files = e.target.files || e.dataTransfer.files
      if (!files.length) {
        return
      }

      if (files[0].size <= 0 || files[0].size > this.size * 1024 * 1024) {
        this.$emit('error', {
          type: 'fileSize',
          fileSize: files[0].size,
          fileType: files[0].type,
          fileName: files[0].name,
          sizeLimit: this.size
        })
        return
      }

      if (files[0].name === this.fileName && files[0].size === this.fileSize && this.fileModified === files[0].lastModified) {
        return
      }

      this.file = files[0]
      this.fileName = files[0].name
      this.fileSize = files[0].size
      this.fileModified = files[0].lastModified
      this.fileType = files[0].type

      if (this.accept === 'image/*') {
        if (files[0].type.substr(0, 6) !== 'image/') {
          return
        }
      } else {
        if (this.fileTypes.indexOf(files[0].type) === -1) {
          this.$emit('error', {
            type: 'fileType',
            fileSize: files[0].size,
            fileType: files[0].type,
            fileName: files[0].name
          })
          return
        }
      }

      if (this.imageSelected) {
        this.focus = { x: 50, y: 50 }
      }

      this.imageSelected = true
      this.image = ''

      this.$nextTick(() => {
        this.pixelRatio = Math.round(window.devicePixelRatio || window.screen.deviceXDPI / window.screen.logicalXDPI)
        const canvas = this.$refs.previewCanvas
        if (canvas && canvas.getContext) {
          this.context = canvas.getContext('2d')
          this.context.scale(this.pixelRatio, this.pixelRatio)
        }
        this.loadImage(files[0])
      })
    },

    onError (error) {
      if (this.alertOnError) {
        alert(error.message)
      }
    },

    loadImage (file) {
      this.getEXIFOrientation(file, orientation => {
        this.setOrientation(orientation)
        const reader = new FileReader()
        reader.onload = e => {
          this.image = e.target.result
          this.$emit('change', this.image) //! TODO
          this.imageObject = new Image()
          this.imageObject.onload = () => {
            if (this.autoToggleAspectRatio) {
              const canvasOrientation = this.getOrientation(this.canvasWidth, this.canvasHeight)
              const imageOrientation = this.getOrientation(this.imageObject.width, this.imageObject.height)
              if (canvasOrientation !== imageOrientation) {
                this.rotateCanvas()
              }
            }
            this.drawImage(this.imageObject)
          }
          this.imageObject.src = this.image
        }
        reader.readAsDataURL(file)
      })
    },

    drawImage (image) {
      this.imageWidth = image.width
      this.imageHeight = image.height
      this.imageRatio = image.width / image.height
      this.previewWidth = 450
      this.previewHeight = 450
      const orientation = this.getOrientation(image.width, image.height)

      switch (orientation) {
        case 'portrait':
          this.previewWidth = this.previewWidth * this.imageRatio
          break
        case 'landscape':
          this.previewHeight = this.previewHeight / this.imageRatio
          break
      }

      const canvas = this.$refs.previewCanvas

      canvas.style.background = 'none'
      canvas.width = this.previewWidth * this.pixelRatio
      canvas.height = this.previewHeight * this.pixelRatio
      this.context.setTransform(1, 0, 0, 1, 0, 0)
      this.context.clearRect(0, 0, canvas.width, canvas.height)

      this.context.drawImage(
        image,
        0,
        0,
        this.previewWidth * this.pixelRatio,
        this.previewHeight * this.pixelRatio
      )
    },

    selectImage (change = false) {
      // if (change) {
      //   this.removeImage()
      // }
      this.$refs.fileInput.click()
    },

    removeImage () {
      this.$refs.fileInput.value = ''
      this.$refs.fileInput.type = ''
      this.$refs.fileInput.type = 'file'
      this.fileName = ''
      this.fileType = ''
      this.fileSize = 0
      this.fileModified = 0
      this.imageSelected = false
      this.image = ''
      this.file = null
      this.imageObject = null
      if (this.$refs.previewCanvas) {
        this.$refs.previewCanvas.style.backgroundColor = 'rgba(200,200,200,.25)'
        this.$refs.previewCanvas.width = this.previewWidth * this.pixelRatio
      }
      this.$emit('remove')
    },

    rotateImage () {
      this.rotateCanvas()

      if (this.imageObject) {
        this.drawImage(this.imageObject)
      }
    },

    resizeCanvas () {
      const previewRatio = this.canvasWidth / this.canvasHeight
      const newWidth = this.$refs.container.clientWidth
      if (!this.toggleAspectRatio && newWidth === this.containerWidth) {
        return
      }
      this.containerWidth = newWidth
      this.previewWidth = Math.min(this.containerWidth - this.margin * 2, this.canvasWidth)
      this.previewHeight = this.previewWidth / previewRatio
    },

    getOrientation (width, height) {
      let orientation = 'square'

      if (width > height) {
        orientation = 'landscape'
      } else if (width < height) {
        orientation = 'portrait'
      }

      return orientation
    },

    switchCanvasOrientation () {
      const canvasWidth = this.canvasWidth
      const canvasHeight = this.canvasHeight

      this.canvasWidth = canvasHeight
      this.canvasHeight = canvasWidth
    },

    rotateCanvas () {
      this.switchCanvasOrientation()
      this.resizeCanvas()
    },

    setOrientation (orientation) {
      this.rotate = false
      if (orientation === 8) {
        this.rotate = -Math.PI / 2
      } else if (orientation === 6) {
        this.rotate = Math.PI / 2
      } else if (orientation === 3) {
        this.rotate = -Math.PI
      }
    },

    getEXIFOrientation (file, callback) {
      const reader = new FileReader()
      reader.onload = e => {
        const view = new DataView(e.target.result)
        if (view.getUint16(0, false) !== 0xFFD8) {
          // eslint-disable-next-line
          return callback(-2)
        }
        const length = view.byteLength
        let offset = 2
        while (offset < length) {
          const marker = view.getUint16(offset, false)
          offset += 2
          if (marker === 0xFFE1) {
            if (view.getUint32(offset += 2, false) !== 0x45786966) {
              // eslint-disable-next-line
              return callback(-1)
            }
            const little = view.getUint16(offset += 6, false) === 0x4949
            offset += view.getUint32(offset + 4, little)
            const tags = view.getUint16(offset, little)
            offset += 2
            for (let i = 0; i < tags; i++) {
              if (view.getUint16(offset + (i * 12), little) === 0x0112) {
                return callback(view.getUint16(offset + (i * 12) + 8, little))
              }
            }
          } else if ((marker & 0xFF00) !== 0xFF00) {
            break
          } else {
            offset += view.getUint16(offset, false)
          }
        }
        // eslint-disable-next-line
        return callback(-1)
      }
      reader.readAsArrayBuffer(file.slice(0, 65536))
    },

    preloadImage (source, options) {
      // ie 11 support
      let File = window.File
      try {
        new File([], '') // eslint-disable-line
      } catch (e) {
        File = class File extends Blob {
          constructor (chunks, filename, opts = {}) {
            super(chunks, opts)
            this.lastModifiedDate = new Date()
            this.lastModified = +this.lastModifiedDate
            this.name = filename
          }
        }
      }
      options = Object.assign({}, options)
      if (typeof source === 'object') {
        this.imageSelected = true
        this.image = ''
        this.loadImage(source)
        return
      }

      const headers = new Headers()
      headers.append('Accept', 'image/*')
      fetch(source, {
        method: 'GET',
        mode: 'cors',
        headers: headers
      }).then(response => {
        return response.blob()
      })
        .then(imageBlob => {
          const e = { target: { files: [] } }
          const fileName = options.fileName || source.split('/').slice(-1)[0]
          let mediaType = options.mediaType || ('image/' + (options.fileType || fileName.split('.').slice(-1)[0]))
          mediaType = mediaType.replace('jpg', 'jpeg')
          e.target.files[0] = new File([imageBlob], fileName, { type: mediaType })
          this.onFileChange(e, true)
        })
        .catch(err => {
          this.$emit('error', {
            type: 'failedPrefill',
            err: err
          })
        })
    }
  }
}
</script>

<style lang="postcss" scoped>

button {
  width: 100%;
  border: 1px solid theme(colors.dark);
  line-height: 1;
  padding-top: 20px;
  padding-bottom: 20px;
  background-color: transparent;
  transition: background-color 0.5s ease;

  &:hover {
    background-color: #ffffff;
  }

  &:first-of-type {
    margin-top: 15px;
  }

  & + button {
    margin-top: -1px;
  }
}

.picture-input {
  width: 100%;
  margin: 0 auto;
  text-align: center;
}
.preview-container {
  width: 100%;
  box-sizing: border-box;
  margin: 0 auto;
  cursor: pointer;
  overflow: hidden;
  position: relative;
}
.picture-preview {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 10;
  box-sizing: border-box;
  background-color: theme(colors.input);
}
.picture-preview.dragging-over {
  filter: brightness(0.5);
}
.picture-inner {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  left: 0;

  z-index: 9001;
  pointer-events: none;
  padding: 4rem;
  box-sizing: border-box;
  border: 1px dashed rgba(66,66,66,.15);
  border-radius: 8px;
  display: table;
}
.picture-inner .picture-inner-text {
  @fontsize lg;
  display: table-cell;
  vertical-align: middle;
  text-align: center;

  font-weight: 200;
  line-height: 1.5;
}
input[type=file] {
  display: none;
}
</style>
