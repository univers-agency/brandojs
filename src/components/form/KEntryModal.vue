<!--
Add a new entry as a modal
-->
<template>
  <modal
    v-if="showModal"
    :chrome="false"
    :large="true"
    :show="showModal"
    @cancel="closeModal"
    @ok="closeModal">
    <div class="card">
      <div class="card-header">
        <h5 class="section mb-0">
          Legg til {{ model }}
        </h5>
      </div>
      <div class="card-body">
        <ValidationObserver
          ref="observer"
          v-slot="{ invalid }">
          <KInput
            ref="name"
            v-model="artist.name"
            rules="required"
            :value="artist.name"
            name="artist[name]"
            label="Navn"
            placeholder="Navn"
            data-vv-name="artist[name]"
            data-vv-value-path="innerValue"
            @input="checkName" />
          <div
            v-if="similarEntry"
            class="alert alert-warning text-sm mb-2">
            <i class="fa fa-exclamation-circle text-danger" />
            Fant lignende: {{ similarEntry.value }}
            <button
              class="btn-sm btn-outline-primary text-sm text-uppercase float-right"
              @click="selectSimilar(similarEntry)">
              Velg
            </button>
          </div>

          <button
            :disabled="notValid"
            class="btn btn-secondary"
            @click.prevent="validate">
            Lagre
          </button>
        </ValidationObserver>
      </div>
    </div>
  </modal>
</template>

<script>
import jaroDistance from '../utils/jaroDistance'
import Modal from '../Modal'

export default {
  components: {
    Modal
  },

  props: {
    showModal: {
      type: Boolean,
      default: false
    },

    saveCallback: {
      type: Function,
      default: null
    },

    entries: {
      type: Array,
      default: () => []
    }
  },

  data () {
    return {
      similarEntry: null,
      notValid: true,
      loading: 0,
      artist: {
        name: ''
      }
    }
  },

  watch: {
    showModal (val) {
      if (!val) {
        return
      }
      this.$nextTick(() => {
        this.$refs.name.$el.querySelector('input').focus()
      })
    }
  },

  created () {
    console.log('created <ModalAddArtist />')
  },

  inject: [
    'adminChannel'
  ],

  methods: {
    selectSimilar (artist) {
      this.$emit('select', artist)
      this.closeModal()
    },

    checkName (name) {
      if (name.length) {
        this.notValid = false
      }

      this.artists.forEach(artist => {
        const jd = jaroDistance(artist.value, name)
        if (jd > 0.95) {
          this.similarEntry = artist
        }
      })
    },

    async validate () {
      const isValid = await this.$refs.observer.validate()
      if (!isValid) {
        alertError('Feil i skjema', 'Vennligst se over og rett feil i rødt')
        this.loading = false
        return
      }
      this.save()
    },

    async save () {
      nprogress.start()
      if (this.saveCallback) {
        const artist = await artistAPI.createArtist(this.artist)
        this.saveCallback({ id: artist.id, value: artist.name })
      } else {
        await this.createArtist(this.artist)
      }
      this.similarEntry = null

      this.closeModal()
      nprogress.done()
    },

    closeModal () {
      this.$emit('close')
    },

    ...mapActions('artists', ['createArtist'])
  }
}
</script>
