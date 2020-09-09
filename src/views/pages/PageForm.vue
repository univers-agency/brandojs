<template>
  <KForm
    v-if="page && identity"
    :back="{ name: 'pages' }"
    @save="save">
    <section class="row">
      <div class="half">
        <KInputToggle
          v-model="advancedConfig"
          name="config[advanced]"
          label="Avanserte valg" />
      </div>
    </section>
    <section class="row">
      <div class="half">
        <KInputSelect
          v-model="page.language"
          rules="required"
          :options="identity.languages"
          optionValueKey="id"
          name="page[language]"
          label="Språk" />

        <KInput
          v-model="page.title"
          label="Tittel"
          rules="required"
          placeholder="Tittel"
          name="page[title]" />

        <KInputTextarea
          v-model="page.metaDescription"
          :rows="5"
          name="page[metaDescription]"
          type="text"
          label="META beskrivelse"
          help-text="(for søkemotorer)" />

        <KInputImage
          v-model="page.metaImage"
          small
          name="page[metaImage]"
          preview-key="original"
          label="Delebilde (META bilde)"
          help-text="Om du trenger et spesialtilpasset bilde for deling. Beskjæres til 1200x630." />
      </div>
      <div class="half">
        <KInputSelect
          v-model="page.parentId"
          :options="parents"
          option-value-key="id"
          option-label-key="title"
          name="page[parentId]"
          label="Tilhørende side">
          <template v-slot:label="{ option }">
            [{{ option.language.toUpperCase() }}] {{ option.title }}
          </template>
        </KInputSelect>

        <template v-if="templates">
          <KInputSelect
            v-if="advancedConfig || !page.id"
            v-model="page.template"
            rules="required"
            :options="templates"
            optionValueKey="value"
            name="page[template]"
            label="Sidemal" />
        </template>

        <KInput
          v-model="page.key"
          rules="required"
          name="page[key]"
          type="text"
          label="Nøkkel"
          placeholder="Nøkkel" />

        <KInput
          v-if="advancedConfig"
          v-model="page.cssClasses"
          name="page[cssClasses]"
          type="text"
          label="Ekstra CSS klasser"
          placeholder="Ekstra CSS klasser" />

        <KInputDatetime
          v-model="page.publishAt"
          name="page[publishAt]"
          label="Tidspunkt for publisering."
          help-text="Kan være blankt for å publisere umiddelbart" />
      </div>
    </section>
    <Villain
      v-model="page.data"
      rules="required"
      :entry-data="page"
      :template-mode="$app.templateMode"
      :templates="$app.templates"
      name="page[data]"
      label="Innhold" />
  </KForm>
</template>

<script>
import gql from 'graphql-tag'
import LivePreview from '../../mixins/LivePreview'

export default {
  mixins: [
    LivePreview({
      schema: 'Brando.Pages.Page',
      prop: 'page',
      key: 'data'
    })
  ],

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
      advancedConfig: false,
      templates: null,
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
    this.adminChannel.channel
      .push('pages:list_templates')
      .receive('ok', payload => {
        this.templates = payload.templates
      })
  },

  mounted () {
    this.advancedConfig = false
  },

  apollo: {
    parents: {
      query: gql`
        query Parents {
          parents: pages {
            id
            language
            title
            key
          }
        }
      `
    },

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
