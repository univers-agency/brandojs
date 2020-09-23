<template>
  <KForm
    v-if="menuItem"
    :back="{ name: 'navigation' }"
    @save="save">
    <section class="row">
      <div class="sized">
        <KInputStatus
          v-model="menuItem.status"
          name="menuItem[status]"
          rules="required"
          label="Status" />

        <KInput
          v-model="menuItem.title"
          label="Tittel"
          rules="required"
          placeholder="Tittel"
          name="menuItem[title]" />

        <KInput
          v-model="menuItem.key"
          rules="required"
          name="menuItem[key]"
          type="text"
          label="Nøkkel"
          placeholder="Nøkkel" />

        <KInput
          v-model="menuItem.url"
          rules="required"
          name="menuItem[key]"
          label="URL"
          placeholder="/side" />

        <KInputToggle
          v-model="menuItem.openInNewWindow"
          name="menuItem[openInNewWindow]"
          label="Åpne i nytt vindu" />
      </div>
    </section>
  </KForm>
</template>

<script>
export default {
  props: {
    menuItem: {
      type: Object,
      default: () => {}
    },

    save: {
      type: Function,
      required: true
    }
  },

  data () {
    return {}
  },

  inject: [
    'adminChannel'
  ]
}
</script>

<style>

</style>
