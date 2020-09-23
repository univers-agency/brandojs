<template>
  <KForm
    v-if="menu && identity"
    :back="{ name: 'navigation' }"
    @save="save">
    <section class="row">
      <div class="sized">
        <KInputStatus
          v-model="menu.status"
          name="menu[status]"
          rules="required"
          label="Status" />

        <KInput
          v-model="menu.title"
          label="Tittel"
          rules="required"
          placeholder="Tittel"
          name="menu[title]" />

        <KInput
          v-model="menu.key"
          rules="required"
          name="menu[key]"
          type="text"
          label="Nøkkel"
          placeholder="Nøkkel" />

        <KInputSelect
          v-model="menu.language"
          rules="required"
          :options="identity.languages"
          optionValueKey="id"
          name="menu[language]"
          label="Språk" />
      </div>
    </section>
  </KForm>
</template>

<script>
import gql from 'graphql-tag'

export default {
  props: {
    menu: {
      type: Object,
      default: () => {}
    },

    save: {
      type: Function,
      required: true
    }
  },

  data () {
    return {
    }
  },

  inject: [
    'adminChannel'
  ],

  apollo: {
    identity: {
      query: gql`
        query Identity {
          identity {
            id
            defaultLanguage
            languages {
              id
              name
            }
          }
        }
      `
    }
  }
}
</script>

<style>

</style>
