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
import GET_PAGES from '../../gql/pages/PAGES_QUERY.graphql'
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
        page_id: null,
        key: '',
        data: '',
        language: 'no',
        wrapper: ''
      }
    }
  },

  inject: [
    'adminChannel'
  ],

  created () {
    this.page.page_id = this.pageId
  },

  methods: {
    async save () {
      const pageFragmentParams = this.$utils.stripParams(this.page, ['__typename', 'id'])

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
                parent_key
                language
                updated_at
                page_id
                data

                creator {
                  id
                  full_name
                  avatar {
                    thumb: url(size: "xlarge")
                  }
                }
              }
            }
          `,
          variables: {
            pageFragmentParams
          },
          update: (store, { data: { createPageFragment } }) => {
            const query = {
              query: GET_PAGES,
              variables: {
                limit: 100,
                offset: 0,
                filter: null
              }
            }
            const data = store.readQuery(query)
            const page = data.pages.find(page => parseInt(page.id) === parseInt(this.pageId))
            if (page) {
              page.fragments.push(createPageFragment)
              // Write back to the cache
              store.writeQuery({
                ...query,
                data
              })
            } else {
              console.log('page not found?', data.pages, this.pageId)
            }
          }
        })

        this.$toast.success({ message: this.$t('section.created') })
        this.$router.push({ name: 'pages' })
      } catch (err) {
        this.$utils.showError(err)
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
