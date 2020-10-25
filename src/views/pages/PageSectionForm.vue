<template>
  <KForm
    v-if="!loading && identity"
    :back="{ name: 'pages' }"
    @save="save">
    <section class="row">
      <div class="half">
        <KInput
          v-model="page.title"
          rules="required"
          name="page[title]"
          type="text"
          label="Tittel"
          placeholder="Tittel" />
        <KInputSelect
          v-model="page.language"
          rules="required"
          :options="identity.languages"
          optionValueKey="id"
          name="page[language]"
          label="Språk" />
        <section class="row">
          <div class="half">
            <KInput
              v-model="page.parentKey"
              rules="required"
              name="page[parentKey]"
              type="text"
              label="Hovednøkkel"
              placeholder="Hovednøkkel" />
          </div>
          <div class="half">
            <KInput
              v-model="page.key"
              rules="required"
              name="page[key]"
              type="text"
              label="Nøkkel"
              placeholder="Nøkkel" />
          </div>
        </section>
      </div>

      <div class="half">
        <KInputSelect
          v-model="page.pageId"
          rules="required"
          :options="parents"
          name="page[pageId]"
          optionValueKey="value"
          label="Tilhørende side" />
        <KInputTextarea
          v-model="page.wrapper"
          :monospace="true"
          :rows="10"
          name="page[wrapper]"
          type="text"
          label="HTML wrapper (avansert)"
          help-text="Tilgjengelige variabler: ${CONTENT}, ${PARENT_KEY}, ${KEY}, ${LANGUAGE}"></KInputTextarea>
      </div>
    </section>
    <Villain
      v-model="page.data"
      rules="required"
      :template-mode="templateMode()"
      :templates="$app.templates"
      name="page[data]"
      label="Innhold" />
  </KForm>
</template>

<script>

import gql from 'graphql-tag'

export default {
  props: {
    page: {
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
      loading: 1,
      parents: [],
      settings: {
        namespacedTemplates: []
      }
    }
  },

  inject: [
    'adminChannel'
  ],

  created () {
    this.getParents()
  },

  methods: {
    templateMode () {
      if (typeof this.$app.templateMode === 'function') {
        return this.$app.templateMode(this.page)
      }
      return this.$app.templateMode
    },
    getParents () {
      this.adminChannel.channel
        .push('pages:list_parents')
        .receive('ok', payload => {
          this.parents = payload.parents
          this.loading = 0
        })
        .receive('error', err => {
          console.error(err)
          this.loading = 0
        })
    }
  },

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
