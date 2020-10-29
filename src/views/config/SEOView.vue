<template>
  <div>
    <ContentHeader>
      <template v-slot:title>
        {{ $t('title') }}
      </template>
      <template v-slot:subtitle>
        {{ $t('subtitle') }}
      </template>
      <template v-slot:help>
        <p>{{ $t('help') }}</p>
      </template>
    </ContentHeader>
    <KForm
      v-if="seo"
      :back="{ name: 'dashboard' }"
      :back-text="$t('back-to-dashboard')"
      @save="save">
      <template v-slot>
        <div class="row">
          <div class="sized">
            <KInput
              v-model="seo.fallbackMetaTitle"
              name="seo[fallbackMetaTitle]"
              :placeholder="$t('fields.fallbackMetaTitle.label')"
              :label="$t('fields.fallbackMetaTitle.label')" />

            <KInputTextarea
              v-model="seo.fallbackMetaDescription"
              :rows="5"
              name="seo[fallbackMetaDescription]"
              :placeholder="$t('fields.fallbackMetaDescription.label')"
              :label="$t('fields.fallbackMetaDescription.label')" />

            <KInput
              v-model="seo.baseUrl"
              rules="required"
              name="seo[baseUrl]"
              :placeholder="$t('fields.baseUrl.placeholder')"
              :label="$t('fields.baseUrl.label')" />
          </div>

          <div class="half">
            <KInputImage
              v-model="seo.fallbackMetaImage"
              name="seo[fallbackMetaImage]"
              preview-key="xlarge"
              :edit="false"
              :label="$t('fields.fallbackMetaImage.label')" />
          </div>
        </div>

        <KInputTextarea
          v-model="seo.robots"
          :rows="10"
          monospace
          name="seo[robots]"
          :placeholder="$t('fields.robots.placeholder')"
          :label="$t('fields.robots.label')" />

        <KInputTable
          v-model="seo.redirects"
          :new-entry-template="{ from: '/example/:slug', to: '/new/:slug', code: '302' }"
          :edit-rows="true"
          name="seo[redirects]"
          :label="$t('fields.redirects.label')">
          <template #head>
            <tr>
              <th>{{ $t('code') }}</th>
              <th>{{ $t('from') }}</th>
              <th>{{ $t('to') }}</th>
              <th></th>
            </tr>
          </template>
          <template #row="{ entry }">
            <td>
              {{ entry.code }}
            </td>
            <td>
              {{ entry.from }}
            </td>
            <td>
              {{ entry.to }}
            </td>
          </template>
          <template #new="{ newEntry }">
            <td>
              <KInput
                v-model="newEntry.code"
                compact
                name="newEntry[code]"
                :placeholder="$t('code')" />
            </td>
            <td>
              <KInput
                v-model="newEntry.from"
                compact
                name="newEntry[from]"
                :placeholder="$t('from')" />
            </td>
            <td>
              <KInput
                v-model="newEntry.to"
                compact
                name="newEntry[to]"
                :placeholder="$t('to')" />
            </td>
          </template>
          <template #edit="{ editEntry }">
            <td>
              <KInput
                v-model="editEntry.code"
                compact
                name="editEntry[code]"
                :label="$t('code')" />
            </td>
            <td>
              <KInput
                v-model="editEntry.from"
                compact
                name="editEntry[from]"
                :label="$t('from')" />
            </td>
            <td>
              <KInput
                v-model="editEntry.to"
                compact
                name="editEntry[to]"
                :label="$t('to')" />
            </td>
          </template>
        </KInputTable>
      </template>
    </KForm>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import GET_SEO from '../../gql/seo/SEO_QUERY.graphql'

export default {
  data () {
    return {
      loading: 0
    }
  },

  async created () {
    this.loading++
    this.loading--
  },

  methods: {
    async save () {
      const params = this.$utils.stripParams(this.seo, ['__typename', 'id'])
      this.$utils.validateImageParams(params, ['fallbackMetaImage'])

      params.redirects.map(item => (delete item.__typename))

      console.log(params)

      try {
        await this.$apollo.mutate({
          mutation: gql`
            mutation UpdateSeo($seoParams: SeoParams) {
              updateSeo(
                seoParams: $seoParams,
              ) {
                id
              }
            }
          `,
          variables: {
            seoParams: params
          }
        })

        this.$toast.success({ message: this.$t('updated') })
        this.$router.push({ name: 'dashboard' })
      } catch (err) {
        console.log(err)
        this.$utils.showError(err)
      }
    }
  },

  apollo: {
    seo: {
      query: GET_SEO,
      fetchPolicy: 'no-cache'
    }
  }
}
</script>
<i18n>
  {
    "en": {
      "title": "Configuration",
      "subtitle": "SEO",
      "help": "Setup for SEO",
      "back-to-dashboard": "Back to dashboard",
      "from": "From",
      "to": "To",
      "code": "Status code",
      "updated": "SEO updated",
      "fields": {
        "fallbackMetaTitle": {"label": "Fallback META title"},
        "fallbackMetaDescription": {"label": "Fallback META description"},
        "fallbackMetaImage": {"label": "Fallback META image"},
        "baseUrl": {"label": "Base URL", "placeholder": "https://minside.no"},
        "robots": {"label": "Robots.txt (advanced)", "placeholder": "Robots.txt"},
        "redirects": {"label": "HTTP Redirects (advanced)"}
      }
    },
    "no": {
      "title": "Konfigurasjon",
      "subtitle": "SEO",
      "help": "Setup for SEO",
      "back-to-dashboard": "Tilbake til dashbord",
      "from": "Fra",
      "to": "Til",
      "code": "Statuskode",
      "updated": "SEO oppdatert",
      "fields": {
        "fallbackMetaTitle": {"label": "Standard META tittel"},
        "fallbackMetaDescription": {"label": "Standard META beskrivelse"},
        "fallbackMetaImage": {"label": "Standard META bilde"},
        "baseUrl": {"label": "HovedURL", "placeholder": "https://minside.no"},
        "robots": {"label": "Robots.txt (avansert)", "placeholder": "Robots.txt"},
        "redirects": {"label": "HTTP videresendinger (avansert)"}
      }
    }
  }
</i18n>
