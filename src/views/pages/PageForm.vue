<template>
  <KForm
    v-if="page"
    :back="{ name: 'pages' }"
    @save="save">
    <section class="row">
      <div class="half">
        <KInputSelect
          v-model="page.language"
          rules="required"
          :options="[
            { name: 'Norsk', value: 'no' },
            { name: 'English', value: 'en' }
          ]"
          optionValueKey="value"
          name="page[language]"
          label="Språk" />

        <KInput
          v-model="page.key"
          :monospace="true"
          rules="required"
          name="page[key]"
          type="text"
          label="Nøkkel"
          placeholder="Nøkkel" />

        <KInput
          v-model="page.title"
          label="Tittel"
          rules="required"
          placeholder="Tittel"
          name="page[title]" />
      </div>
      <div class="half">
        <KInputSelect
          v-model="page.parent_id"
          :options="parents"
          option-value-key="id"
          option-label-key="title"
          name="page[parent_id]"
          label="Tilhørende side">
          <template v-slot:label="{ option }">
            [{{ option.language.toUpperCase() }}] {{ option.title }}
          </template>
        </KInputSelect>

        <KInput
          v-model="page.css_classes"
          name="page[css_classes]"
          type="text"
          label="Ekstra CSS klasser"
          placeholder="Ekstra CSS klasser" />

        <KInputTextarea
          v-model="page.meta_description"
          :rows="3"
          name="page[meta_description]"
          type="text"
          label="META beskrivelse"
          help-text="(for søkemotorer)"
          data-vv-name="page[meta_description]"
          data-vv-value-path="innerValue" />
      </div>
    </section>
    <Villain
      v-model="page.data"
      rules="required"
      :value="page.data"
      :template-mode="settings.templateMode"
      :templates="settings.templateNamespace"
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
      parents: [],
      settings: {
        templateMode: false,
        templateNamespace: 'all',
        namespacedTemplates: []
      }
    }
  },

  inject: [
    'adminChannel'
  ],

  apollo: {
    parents: {
      query: gql`
        query Parents {
          parents: pages {
            id
            language
            title
          }
        }
      `
    }
  }
}
</script>

<style>

</style>
