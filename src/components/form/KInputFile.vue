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
    </template>
    <template v-slot="{ provider }">
      <FileInput
        :id="id"
        ref="fileInput"
        :currentFile="innerValue"
        :name="name"
        :custom-strings="{
          upload: 'Dingsen du bruker støtter ikke filopplasting :(',
          drag: 'Klikk eller slipp filen ditt her',
          tap: 'Tapp her for å velge en fil fra galleriet ditt',
          change: 'Skift fil ↑',
          remove: 'Fjern fil ↑',
          select: 'Velg en fil',
          fileSize: 'Filen er for stor!',
          fileType: 'Filtypen er ikke støttet'
        }"
        accept="*"
        :size="sizeLimit"
        button-class="btn btn-outline-secondary"
        @init="provider.validate($event)"
        @change="onChange($event) || provider.validate($event)"
        @remove="onRemove() || provider.validate(null)" />
    </template>
  </KFieldBase>
</template>

<script>
import FileInput from './utils/FileInput.vue'

export default {
  components: {
    FileInput
  },

  props: {
    hasError: {
      type: Boolean,
      default: false
    },

    sizeLimit: {
      type: Number,
      default: 3
    },

    helpText: {
      type: String,
      default: null
    },

    errorText: {
      type: String,
      default: ''
    },

    label: {
      type: String,
      required: true
    },

    rules: {
      type: String,
      default: null
    },

    name: {
      type: String,
      required: true
    },

    value: {
      required: false,
      default: null,
      type: null
    }
  },

  data () {
    return {
      loading: 0,
      preCheck: false,
      innerValue: '',
      showErrorModal: false,
      prefill: null
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

  created () {
    this.innerValue = this.value
    if (typeof this.value === 'string') {
      this.prefill = this.value
    } else {
      this.prefill = this.value ? this.value.url : null
    }
  },

  methods: {
    onChange (a) {
      console.log(a)
      this.innerValue = a
    },

    onRemove (a) {
      this.innerValue = null
    }
  }
}
</script>
