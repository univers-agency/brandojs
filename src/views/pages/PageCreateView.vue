<template>
  <article>
    <ContentHeader>
      <template v-slot:title>
        Ny innholdsside
      </template>
    </ContentHeader>
    <PageForm
      :page="page"
      :save="save" />
  </article>
</template>

<script>

import gql from 'graphql-tag'
import GET_PAGES from '../../gql/pages/PAGES_QUERY.graphql'
import PageForm from './PageForm'

export default {
  components: {
    PageForm
  },

  data () {
    return {
      page: {
        parent_id: null,
        key: '',
        title: '',
        slug: '',
        data: null,

        status: 'published',
        language: 'no',
        meta_description: ''
      }
    }
  },

  methods: {
    async save () {
      const pageParams = this.$utils.stripParams(this.page, ['__typename', 'id', 'slug', 'deleted_at'])

      try {
        await this.$apollo.mutate({
          mutation: gql`
            mutation CreatePage($pageParams: PageParams) {
              createPage(
                pageParams: $pageParams
              ) {
                id
                key
                title
                slug
                language
                data

                creator {
                  id
                  full_name
                  avatar {
                    thumb: url(size: "xlarge")
                  }
                }

                parent {
                  id
                  key
                  language
                  title
                  slug
                  data
                }

                children {
                  id
                  key
                  language
                  title
                  slug
                  data
                }

                fragments {
                  id
                  title
                  key
                  parent_key
                  language
                  updated_at
                  page_id
                  data
                }

                inserted_at
                updated_at
                deleted_at
              }
            }
          `,
          variables: {
            pageParams
          },

          update: (store, { data: { createPage } }) => {
            const query = {
              query: GET_PAGES,
              variables: {
                limit: 100,
                offset: 0,
                filter: null
              }
            }
            const data = store.readQuery(query)
            console.log('data', data)
            if (data) {
              data.pages.push(createPage)
              // Write back to the cache

              store.writeQuery({
                ...query,
                data
              })
            }
          }
        })

        this.$toast.success({ message: 'Side opprettet' })
        this.$router.push({ name: 'pages' })
      } catch (err) {
        this.$utils.showError(err)
      }
    }
  }
}
</script>

<style lang="postcss" scoped>

</style>
