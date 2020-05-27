<template>
  <KModal
    v-if="modalVisible"
    ref="modal"
    v-shortkey="['esc']"
    ok-text="Lukk konfigurasjon"
    @shortkey.native="closeConfig"
    @ok="closeConfig">
    <template #header>
      <h5>getBlockDisplayName(block.type)</h5>
    </template>
    <div
      ref="config"
      class="villain-block-config">
      <div class="villain-block-config-content">
        <slot v-bind:cfg="innerValue" />
      </div>
    </div>
  </KModal>
</template>

<script>
export default {
  props: ['value'],

  data () {
    return {
      modalVisible: false,
      innerValue: {}
    }
  },

  created () {
    this.innerValue = this.$utils.clone(this.value)
  },

  updated () {
    console.debug('<BlockConfig /> updated')
  },

  methods: {
    openConfig () {
      this.modalVisible = true
    },

    async closeConfig () {
      await this.$refs.modal.close()
      this.modalVisible = false
      this.$emit('input', this.innerValue)
    }
  }
}
</script>

<style>

</style>
