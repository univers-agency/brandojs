<template>
  <article v-if="pageFragment">
    <ContentHeader>
      <template v-slot:title>
        Endre innholdsseksjon
      </template>
    </ContentHeader>
    <PageSectionForm
      :page="pageFragment"
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
    sectionId: {
      type: [Number],
      required: true
    }
  },

  data () {
    return {
      loading: 0
    }
  },

  inject: [
    'adminChannel'
  ],

  methods: {
    async save () {
      const pageFragmentParams = this.$utils.stripParams(this.pageFragment, ['__typename', 'id', 'creator', 'deleted_at', 'inserted_at'])

      try {
        await this.$apollo.mutate({
          mutation: gql`
            mutation UpdatePageFragment($pageFragmentId: ID!, $pageFragmentParams: PageFragmentParams) {
              updatePageFragment(
                pageFragmentId: $pageFragmentId,
                pageFragmentParams: $pageFragmentParams,
              ) {
                id
                title
                parent_key
                page_id
                key
                language
                wrapper
                data
                creator {
                  id
                  full_name
                }
                inserted_at
                updated_at
                deleted_at
              }
            }
          `,

          variables: {
            pageFragmentParams,
            pageFragmentId: this.sectionId
          }
        })

        this.$toast.success({ message: 'Seksjon oppdatert' })
        this.$router.push({ name: 'pages' })
      } catch (err) {
        this.$utils.showError(err)
      }
    }
  },

  apollo: {
    pageFragment: {
      query: gql`
        query PageFragment ($pageFragmentId: ID!) {
          pageFragment (pageFragmentId: $pageFragmentId) {
            id
            title
            parent_key
            page_id
            key
            language
            wrapper
            data
            creator {
              id
              full_name
            }
            inserted_at
            deleted_at
          }
        }
      `,
      variables () {
        return {
          pageFragmentId: this.sectionId
        }
      },

      skip () {
        return !this.sectionId
      }
    }
  }
}
</script>
