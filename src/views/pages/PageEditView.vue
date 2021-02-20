<template>
  <article
    v-if="pageId"
    :key="pageId">
    <ContentHeader>
      <template v-slot:title>
        {{ $t('pages.edit-page') }}
      </template>
    </ContentHeader>
    <PageForm
      :key="pageId"
      :page="page"
      :save="save" />
    <div
      v-if="pageWithChildren && pageWithChildren.children.length"
      class="subpages">
      <h2>{{ $t('pages.subpages') }}</h2>
      <ContentList
        :status="true"
        :soft-delete="true"
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
            <div class="badge"><FontAwesomeIcon icon="globe-americas" size="sm" /> {{ entry.uri }}</div>
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

import GET_PAGE from '../../gql/pages/PAGE_QUERY.graphql'
import gql from 'graphql-tag'
import PageForm from './PageForm'
import locale from '../../locales/pages'

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
      queryVars: {
        matches: { id: this.pageId }
      }
    }
  },

  methods: {
    async save () {
      let pageParams = this.$utils.stripParams(
        this.page, [
          '__typename',
          'id',
          'deletedAt',
          'insertedAt',
          'updatedAt',
          'children',
          'creator',
          'fragments',
          'parent'
        ])

      const properties = pageParams.properties.map(g => {
        delete g.__typename
        return { ...g, data: JSON.stringify(g.data) }
      })

      pageParams = { ...pageParams, properties: properties }

      this.$utils.validateImageParams(pageParams, ['metaImage'])
      this.$utils.serializeParams(pageParams, ['data'])

      try {
        await this.$apollo.mutate({
          mutation: gql`
            mutation UpdatePage($pageId: ID!, $pageParams: PageParams) {
              updatePage(
                pageId: $pageId,
                pageParams: $pageParams
              ) {
                id
              }
            }
          `,
          variables: {
            pageParams,
            pageId: this.page.id
          }
        })

        this.$toast.success({ message: this.$t('pages.updated') })
        this.$router.push({ name: 'pages' })
      } catch (err) {
        this.$utils.showError(err)
      }
    }
  },

  apollo: {
    page: {
      query: GET_PAGE,
      fetchPolicy: 'no-cache',
      variables () {
        return this.queryVars
      },

      skip () {
        return !this.pageId
      }
    },

    pageWithChildren: {
      query: gql`
        query Page ($matches: PageMatches) {
          pageWithChildren: page (matches: $matches) {
            id
            children {
              id
              title
              status
              uri
              language
              updatedAt

              creator {
                id
                name
                avatar {
                  thumb: url(size: "xlarge")
                }
              }
            }
          }
        }
      `,
      fetchPolicy: 'no-cache',
      variables () {
        return {
          matches: { id: this.pageId }
        }
      },

      skip () {
        return !this.pageId
      }
    }
  },
  i18n: {
    sharedMessages: locale
  }
}
</script>

<style lang="postcss" scoped>
  .subpages {
    @space margin-top lg;

    >>> .list-tools {
      display: none;
    }
  }

  >>> .badge {
    margin-top: 5px;
    text-transform: none !important;
  }
</style>
