<template>
  <article v-if="identity">
    <ContentHeader>
      <template v-slot:title>
        {{ $t('pages.new') }}
      </template>
    </ContentHeader>
    <PageForm
      :page="page"
      :save="save" />
  </article>
</template>

<script>

import gql from 'graphql-tag'
import PageForm from './PageForm'
import locale from '../../locales/pages'

export default {
  components: {
    PageForm
  },

  data () {
    return {
      page: {
        parentId: null,
        key: '',
        title: '',
        slug: '',
        data: null,
        template: 'default.html',
        status: 'published',
        language: null,
        metaDescription: '',
        properties: []
      }
    }
  },

  methods: {
    async save () {
      let pageParams = this.$utils.stripParams(this.page, ['__typename', 'id', 'slug', 'deletedAt'])

      const properties = pageParams.properties.map(g => {
        return { ...g, data: JSON.stringify(g.data) }
      })

      pageParams = { ...pageParams, properties: properties }

      this.$utils.validateImageParams(pageParams, ['metaImage'])

      try {
        await this.$apollo.mutate({
          mutation: gql`
            mutation CreatePage($pageParams: PageParams) {
              createPage(
                pageParams: $pageParams
              ) {
                id
              }
            }
          `,
          variables: {
            pageParams
          }
        })

        this.$toast.success({ message: this.$t('pages.created') })
        this.$router.push({ name: 'pages' })
      } catch (err) {
        this.$utils.showError(err)
      }
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
      `,
      update ({ identity }) {
        this.page.language = identity.defaultLanguage
        return identity
      }
    }
  },
  i18n: {
    sharedMessages: locale
  }
}
</script>
