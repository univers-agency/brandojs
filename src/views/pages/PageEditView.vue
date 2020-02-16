<template>
  <article
    v-if="pageId"
    :key="'edit-' + pageId">
    <ContentHeader>
      <template v-slot:title>
        Endre innholdsside
      </template>
    </ContentHeader>
    <PageForm
      :page="page"
      :save="save" />

    <div
      v-if="pageWithChildren && pageWithChildren.children.length"
      class="subpages">
      <h2>{{ $t('pages.subpages') }}</h2>
      <ContentList
        :entries="pageWithChildren.children">
        <template v-slot:row="{ entry }">
          <div class="col-1">
            <div class="circle">
              <span>{{ entry.language }}</span>
            </div>
          </div>
          <div class="col-11 title">
            <router-link :to="{ name: 'pages-edit', params: { pageId: entry.id } }">
              {{ entry.title }}
            </router-link><br>
            <div class="badge">{{ entry.key }}</div>
          </div>
          <div class="col-4">
            <ItemMeta
              :entry="entry"
              :user="entry.creator" />
          </div>
        </template>
      </ContentList>
    </div>
  </article>
</template>

<script>

import gql from 'graphql-tag'
import PageForm from './PageForm'

export default {
  components: {
    PageForm
  },

  props: {
    pageId: {
      type: [String, Number],
      required: true
    }
  },

  data () {
    return {
    }
  },

  methods: {
    async save () {
      const pageParams = this.$utils.stripParams(this.page, ['__typename', 'id', 'slug', 'deleted_at', 'inserted_at'])

      try {
        await this.$apollo.mutate({
          mutation: gql`
            mutation UpdatePage($pageId: ID!, $pageParams: PageParams) {
              updatePage(
                pageId: $pageId,
                pageParams: $pageParams
              ) {
                id
                key
                title
                slug
                language
                data

                parent {
                  id
                  key
                  language
                  data
                  title
                  slug
                }

                children {
                  id
                  key
                  language
                  title
                  data
                  slug
                }
                fragments {
                  id
                  title
                  key
                  parent_key
                  data
                  language
                  updated_at
                  page_id
                }
                inserted_at
                updated_at
                deleted_at
              }
            }
          `,
          variables: {
            pageParams,
            pageId: this.page.id
          }
        })

        this.$toast.success({ message: 'Side oppdatert' })
        this.$router.push({ name: 'pages' })
      } catch (err) {
        this.$utils.showError(err)
      }
    }
  },

  apollo: {
    page: {
      query: gql`
        query Page ($pageId: ID!) {
          page (pageId: $pageId) {
            id
            key
            language
            title
            slug
            data
            status
            css_classes
            parent_id
            meta_description
            inserted_at
            deleted_at
          }
        }
      `,
      variables () {
        return {
          pageId: this.pageId
        }
      },

      skip () {
        return !this.pageId
      }
    },

    pageWithChildren: {
      query: gql`
        query Page ($pageId: ID!) {
          pageWithChildren: page (pageId: $pageId) {
            id
            children {
              id
              title
              key
              language

              creator {
                id
                full_name
                avatar {
                  thumb: url(size: "xlarge")
                }
              }
            }
          }
        }
      `,
      variables () {
        return {
          pageId: this.pageId
        }
      },

      skip () {
        return !this.pageId
      }
    }
  }
}
</script>

<style lang="postcss" scoped>
  .subpages {
    @space margin-top lg;
  }
</style>

<i18n>
{
  "en": {
    "pages.subpages": "Subpages"
  },
  "nb": {
    "pages.subpages": "Undersider"
  }
}
</i18n>
