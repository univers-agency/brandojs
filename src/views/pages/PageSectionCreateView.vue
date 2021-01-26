<template>
  <article>
    <ContentHeader>
      <template v-slot:title>
        {{ $t('section.new') }}
      </template>
    </ContentHeader>
    <PageSectionForm
      :page="page"
      :save="save" />
  </article>
</template>

<script>

import gql from 'graphql-tag'
import PageSectionForm from './PageSectionForm'

export default {
  components: {
    PageSectionForm
  },

  props: {
    pageId: {
      type: [String, Number],
      required: true
    }
  },

  data () {
    return {
      loading: 0,
      page: {
        pageId: null,
        key: '',
        data: '',
        language: null,
        wrapper: ''
      }
    }
  },

  inject: [
    'adminChannel'
  ],

  created () {
    this.page.pageId = this.pageId
  },

  methods: {
    async save () {
      const pageFragmentParams = this.$utils.stripParams(this.page, ['__typename', 'id'])
      this.$utils.serializeParams(pageFragmentParams, ['data'])

      try {
        await this.$apollo.mutate({
          mutation: gql`
            mutation CreatePageFragment($pageFragmentParams: PageFragmentParams) {
              createPageFragment(
                pageFragmentParams: $pageFragmentParams,
              ) {
                id
                title
                key
                parentKey
                language
                updatedAt
                pageId
                data

                creator {
                  id
                  name
                  avatar {
                    thumb: url(size: "xlarge")
                  }
                }
              }
            }
          `,
          variables: {
            pageFragmentParams
          }
        })

        this.$toast.success({ message: this.$t('section.created') })
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
  }
}
</script>
<i18n>
{
  "no": {
    "section.new": "Ny innholdsseksjon",
    "section.created": "Seksjon opprettet"
  },
  "en": {
    "section.new": "New section",
    "section.created": "Section created"
  }
}
</i18n>
