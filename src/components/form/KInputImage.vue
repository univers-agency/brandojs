<template>
  <KFieldBase
    :name="name"
    :label="label + ' (max ' + sizeLimit + 'MB)'"
    :rules="rules"
    :helpText="helpText"
    :value="innerValue">
    <template #outsideValidator>
      <KModal
        v-if="showErrorModal"
        ref="errorModal"
        v-shortkey="['esc', 'enter']"
        ok-text="Lukk"
        @shortkey.native="closeErrorModal"
        @ok="closeErrorModal">
        <template #header>
          Feil
        </template>
        <div v-html="errorMessage" />
      </KModal>

      <KModal
        v-if="showEditModal"
        ref="editModal"
        v-shortkey="['esc', 'enter']"
        ok-text="Lukk"
        @shortkey.native="closeEditModal"
        @ok="closeEditModal">
        <template #header>
          Endre bildedata
        </template>
        <KInput
          v-model="innerValue.title"
          rules=""
          name="image[title]"
          label="Bildetekst"
          placeholder="Bildetekst" />
        <KInput
          v-model="innerValue.alt"
          rules=""
          name="image[alt]"
          label="Alt. tekst"
          placeholder="Beskrivelse av bildet" />
      </KModal>
    </template>
    <template v-slot="{ provider }">
      <div
        v-if="provider"
        class="image-preview-wrapper">
        <template v-if="!small">
          <PictureInput
            :id="id"
            ref="pictureInput"
            :size-limit="sizeLimit"
            :focal="focal"
            :crop="crop"
            :width="width"
            :height="height"
            :prefill="prefill"
            :removable="true"
            :name="name"
            :custom-strings="customStrings"
            :size="sizeLimit"
            :accept="accept"
            margin="0"
            button-class="btn btn-outline-secondary"
            @click.prevent
            @init="provider.validate($event)"
            @change="onChange($event) || provider.validate($event)"
            @remove="onRemove() || provider.validate(null)"
            @error="onError"
            @focalChanged="onFocalChanged" />
          <ButtonSecondary
            v-if="edit && innerValue"
            class="btn-edit"
            @click="showEditModal = true">
            Endre bildedata
          </ButtonSecondary>
        </template>

        <div
          v-else
          class="image-preview-wrapper-small">
          <transition @appear="initialValidation(provider)">
            <span></span>
          </transition>
          <KModal
            v-if="showModal"
            ref="modal"
            v-shortkey="['esc']"
            ok-text="Lukk"
            @shortkey.native="closeModal"
            @ok="closeModal">
            <template #header>
              Rediger bilde
            </template>
            <PictureInput
              :id="id"
              ref="pictureInput"
              :size-limit="sizeLimit"
              :focal="focal"
              :crop="crop"
              :width="width"
              :height="height"
              :prefill="prefill"
              :removable="true"
              :name="name"
              :custom-strings="customStrings"
              :size="sizeLimit"
              :accept="accept"
              margin="0"
              button-class="btn btn-outline-secondary"
              @click.prevent
              @init="provider.validate($event)"
              @change="onChange($event) || provider.validate($event)"
              @remove="onRemove() || provider.validate(null)"
              @error="onError"
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
            <div>&larr; Klikk på bildet for å redigere/endre</div>
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

    accept: {
      type: String,
      default: 'image/jpeg,image/jpg,image/png,image/gif'
    },

    sizeLimit: {
      type: Number,
      default: 3
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

    edit: {
      type: Boolean,
      default: false
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
      showEditModal: false,
      showErrorModal: false,
      previewImage: null,
      errorMessage: '',

      customStrings: {
        upload: 'Dingsen du bruker støtter ikke filopplasting :(',
        drag: 'Klikk eller slipp bildet ditt her',
        tap: 'Tapp her for å velge et bilde fra galleriet ditt',
        change: 'Skift bilde',
        remove: 'Nullstill bildefelt',
        select: 'Velg et bilde',
        meta: 'Endre bildeinformasjon',
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
    this.setPrefill()

    this.$nextTick(() => {
      if (this.$refs.provider) {
        this.$refs.provider.validate(this.value)
      }
    })
  },

  methods: {
    initialValidation (provider) {
      provider.validate(this.value)
    },

    setPrefill () {
      this.prefill = this.innerValue ? this.innerValue[this.previewKey] : null
      if (this.innerValue) {
        this.focal = this.innerValue.focal ? this.innerValue.focal : null
        delete this.innerValue.focal
      } else {
        this.focal = { x: 50, y: 50 }
      }
    },

    async closeModal () {
      await this.$refs.modal.close()
      this.showModal = false
    },

    async closeEditModal () {
      await this.$refs.editModal.close()
      this.showEditModal = false
    },

    async closeErrorModal () {
      await this.$refs.errorModal.close()
      this.showErrorModal = false
    },

    showError () {
      this.showErrorModal = true
    },

    async hideError () {
      await this.$refs.errorModal.close()
      this.showErrorModal = false
    },

    onChange (a) {
      /*
      This triggers on the initial load of prefill, as well as when the image changes.
      */
      if (this.value && !this.preCheck) {
        // Just changing the prefill. Set preCheck and return
        this.preCheck = true
        return
      }

      // there's been a change, and we either have no prefill, or we've triggered the prefill check:
      if (this.$refs.pictureInput.file) {
        this.preCheck = true

        if (this.innerValue) {
          this.innerValue.file = this.$refs.pictureInput.file
        } else {
          this.innerValue = {
            file: this.$refs.pictureInput.file,
            thumb: this.$refs.pictureInput.file,
            alt: '',
            title: ''
          }
        }

        if (this.small && this.innerValue) {
          this.previewImage = a
          this.prefill = this.$refs.pictureInput.file
        }
      }
    },

    onRemove (a) {
      this.innerValue = null
    },

    onFocalChanged (f) {
      if (this.preCheck) {
        this.setFocal(f)
      }
    },

    onError (err) {
      switch (err.type) {
        case 'fileSize':
          this.errorMessage = `
          Filen du vil laste opp er for stor. <br><br>
          Maks tillatt størrelse for feltet er <br><br>
          &lt;&lt; ${err.sizeLimit}MB. &gt;&gt;<br><br>
          Du kan komprimere filen før du laster den opp med en online tjeneste<br>
          som <a href="https://squoosh.app/" target="_blank" rel="noopener nofollow">squoosh.app</a> eller en mac-applikasjon
          som f.eks <a href="https://imageoptim.com/mac/" target="_blank" rel="noopener nofollow">ImageOptim</a>.
          `
          this.showError()
          break

        case 'fileType':
          this.errorMessage = `
          Ikke tillatt filtype. <br><br>
          Gyldige filtyper for dette felter er<br><br>
          &lt;&lt; ${this.accept} &gt;&gt;<br><br>
          `
          this.showError()
          break
      }
    },

    setFocal (f) {
      this.innerValue = {
        ...this.innerValue,
        focal: f
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
    align-items: center;
    border: 1px solid theme(colors.dark);

    div {
      padding-left: 50px;
    }
  }

  .btn-edit {
    width: 100%;
    margin-top: -1px;
  }

</style>
