<template>
  <KFieldBase
    :name="name"
    :label="label"
    :rules="rules"
    :helpText="helpText"
    :value="innerValue">
    <template v-slot="{ provider }">
      <div
        v-if="provider"
        class="image-preview-wrapper">
        <template v-if="!small">
          <PictureInput
            :id="id"
            ref="pictureInput"
            :focal="focal"
            :crop="crop"
            :width="width"
            :height="height"
            :prefill="prefill"
            :removable="true"
            :name="name"
            :custom-strings="customStrings"
            margin="0"
            accept="image/jpeg,image/jpg,image/png,image/gif"
            size="10"
            button-class="btn btn-outline-secondary"
            @click.prevent
            @init="provider.validate($event)"
            @change="onChange($event) || provider.validate($event)"
            @remove="onRemove() || provider.validate(null)"
            @focalChanged="onFocalChanged" />
        </template>

        <div v-else>
          <KModal
            v-if="showModal"
            ref="modal"
            v-shortkey="['esc']"
            ok-text="Lukk"
            @shortkey.native="closeModal"
            @ok="closeModal">
            <template #header>
              Last opp delebilde
            </template>
            <PictureInput
              :id="id"
              ref="pictureInput"
              :focal="focal"
              :crop="crop"
              :width="width"
              :height="height"
              :prefill="prefill"
              :removable="true"
              :name="name"
              :custom-strings="customStrings"
              margin="0"
              accept="image/jpeg,image/jpg,image/png,image/gif"
              size="10"
              button-class="btn btn-outline-secondary"
              @click.prevent
              @change="onChange($event) || provider.validate($event)"
              @remove="onRemove() || provider.validate(null)"
              @init="provider.validate($event)"
              @focalChanged="onFocalChanged" />
          </KModal>

          <div
            v-if="prefill"
            class="prefill-small">
            <figure
              class="preview-image-wrapper"
              @click="showModal = true">
              <img
                v-if="previewImage"
                :src="previewImage"
                class="preview-image" />
              <img
                v-else
                :src="prefill"
                class="preview-image" />
            </figure>
          </div>

          <div v-else>
            <!-- no image -->
            <ButtonSecondary
              @click="showModal = true">
              Last opp bilde
            </ButtonSecondary>
          </div>
        </div>
      </div>
    </template>
  </KFieldBase>
</template>

<script>
import PictureInput from './utils/PictureInput'

export default {
  components: {
    PictureInput
  },

  props: {
    previewKey: {
      type: String,
      default: 'thumb'
    },

    small: {
      type: Boolean,
      default: false
    },

    helpText: {
      type: String,
      default: null
    },

    crop: {
      type: Boolean,
      default: false
    },

    width: {
      type: Number,
      default: 450
    },

    height: {
      type: Number,
      default: 450
    },

    label: {
      type: String,
      required: true
    },

    name: {
      type: String,
      required: true
    },

    rules: {
      type: String,
      default: null
    },

    value: {
      required: false,
      default: null,
      type: null
    }
  },

  data () {
    return {
      focal: null,
      loading: 0,
      preCheck: false,
      innerValue: '',
      prefill: null,
      showModal: false,
      previewImage: null,

      customStrings: {
        upload: 'Dingsen du bruker støtter ikke filopplasting :(',
        drag: 'Klikk eller slipp bildet ditt her',
        tap: 'Tapp her for å velge et bilde fra galleriet ditt',
        change: 'Skift bilde',
        remove: 'Nullstill bildefelt',
        select: 'Velg et bilde',
        fileSize: 'Filen er for stor!',
        fileType: 'Filtypen er ikke støttet'
      }
    }
  },

  computed: {
    id () {
      return this.name.replace('[', '_').replace(']', '_')
    }
  },

  watch: {
    innerValue (value) {
      this.$emit('input', value)
    },

    value (value) {
      this.innerValue = value
    }
  },

  mounted () {
    this.innerValue = this.value
    this.getPrefill()
    this.$nextTick(() => {
      if (this.$refs.provider) {
        this.$refs.provider.validate(this.value)
      }
    })
  },

  methods: {
    getPrefill () {
      if (typeof this.innerValue === 'string') {
        this.prefill = this.innerValue
      } else if (this.innerValue instanceof File) {
        this.prefill = this.innerValue
      } else {
        this.prefill = this.innerValue ? this.innerValue[this.previewKey] : null
        if (this.innerValue) {
          this.focal = this.innerValue.focal ? this.innerValue.focal : null
        } else {
          this.focal = { x: 50, y: 50 }
        }
      }
    },

    async closeModal () {
      await this.$refs.modal.close()
      this.showModal = false
    },

    onChange (a) {
      console.log('onChange!')
      // we have a prefill, and preCheck is false
      if (this.value && !this.preCheck) {
        // do nothing except, set preCheck to true
        this.preCheck = true
        return
      }
      // there's been a change, and we either have no prefill, or we've triggered the prefill check:
      if (this.$refs.pictureInput.file) {
        this.innerValue = this.$refs.pictureInput.file

        if (this.small && this.innerValue) {
          this.previewImage = a
          this.prefill = this.innerValue
        }
      }
    },

    onRemove (a) {
      this.innerValue = null
    },

    onFocalChanged (f) {
      if (this.innerValue instanceof File) {
        // remove any focal key
        let filename = this.innerValue.name.replace(/%%%(.*)%%%/, '')
        // change the filename to include focal info
        filename = filename + `%%%${f.x}:${f.y}%%%`
        const newFile = new File([this.innerValue], filename, { type: this.innerValue.type })
        this.innerValue = newFile
      } else {
        this.innerValue = {
          ...this.innerValue,
          focal: f
        }
      }
    }
  }
}
</script>
<style lang="postcss" scoped>
  .preview-image-wrapper {
    width: 75px;
    height: 75px;

    .preview-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .prefill-small {
    display: flex;
  }
</style>
