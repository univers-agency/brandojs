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
      v-if="identity"
      :back="{ name: 'dashboard' }"
      :back-text="$t('back-to-dashboard')"
      @save="save">
      <template v-slot>
        <KInputRadios
          v-model="identity.type"
          rules="required"
          :options="[
            { name: $t('organization'), value: 'organization' },
            { name: $t('corporation'), value: 'corporation' }
          ]"
          name="identity[type]"
          :label="$t('fields.type.label')" />

        <div class="row">
          <div class="half">
            <KInput
              v-model="identity.name"
              rules="required"
              name="identity[name]"
              :placeholder="$t('fields.name.label')"
              :label="$t('fields.name.label')" />
          </div>

          <div class="half">
            <KInput
              v-model="identity.alternateName"
              name="identity[alternateName]"
              :placeholder="$t('fields.alternateName.placeholder')"
              :label="$t('fields.alternateName.label')" />
          </div>
        </div>

        <div class="row">
          <div class="half">
            <KInput
              v-model="identity.email"
              name="identity[email]"
              :placeholder="$t('fields.email.placeholder')"
              :label="$t('fields.email.label')" />
          </div>
          <div class="half">
            <KInput
              v-model="identity.phone"
              name="identity[phone]"
              :placeholder="$t('fields.phone.placeholder')"
              :label="$t('fields.phone.label')" />
          </div>
        </div>

        <KInput
          v-model="identity.address"
          name="identity[address]"
          :placeholder="$t('fields.address.placeholder')"
          :label="$t('fields.address.label')" />

        <KInput
          v-model="identity.address2"
          name="identity[address]"
          :placeholder="$t('fields.address2.placeholder')"
          :label="$t('fields.address2.label')" />

        <KInput
          v-model="identity.address3"
          name="identity[address]"
          :placeholder="$t('fields.address3.placeholder')"
          :label="$t('fields.address3.label')" />

        <div class="row">
          <div class="third">
            <KInput
              v-model="identity.zipcode"
              name="identity[zipcode]"
              :placeholder="$t('fields.zipcode.placeholder')"
              :label="$t('fields.zipcode.label')" />
          </div>
          <div class="third">
            <KInput
              v-model="identity.city"
              name="identity[city]"
              :placeholder="$t('fields.city.placeholder')"
              :label="$t('fields.city.label')" />
          </div>
          <div class="third">
            <KInput
              v-model="identity.country"
              name="identity[country]"
              :placeholder="$t('fields.country.placeholder')"
              :label="$t('fields.country.label')" />
          </div>
        </div>

        <KInput
          v-model="identity.description"
          rules="required"
          name="identity[description]"
          :placeholder="$t('fields.description.placeholder')"
          :label="$t('fields.description.label')" />

        <div class="row">
          <div class="third">
            <KInput
              v-model="identity.titlePrefix"
              name="identity[titlePrefix]"
              :placeholder="$t('fields.titlePrefix.placeholder')"
              :label="$t('fields.titlePrefix.label')" />
          </div>
          <div class="third">
            <KInput
              v-model="identity.title"
              name="identity[title]"
              :placeholder="$t('fields.title.placeholder')"
              :label="$t('fields.title.label')" />
          </div>
          <div class="third">
            <KInput
              v-model="identity.titlePostfix"
              name="identity[titlePostfix]"
              :placeholder="$t('fields.titlePostfix.placeholder')"
              :label="$t('fields.titlePostfix.label')" />
          </div>
        </div>

        <div class="row">
          <div class="half">
            <KInputImage
              v-model="identity.image"
              name="identity[image]"
              preview-key="xlarge"
              :label="$t('fields.image.label')" />
          </div>
          <div class="half">
            <KInputImage
              v-model="identity.logo"
              name="identity[logo]"
              preview-key="xlarge"
              :label="$t('fields.logo.label')" />
          </div>
        </div>

        <KInput
          v-model="identity.url"
          rules="required"
          name="identity[url]"
          :placeholder="$t('fields.url.placeholder')"
          :label="$t('fields.url.label')" />

        <KInputTable
          v-model="identity.links"
          :new-entry-template="{ name: '', url: '' }"
          :edit-rows="true"
          name="user[links]"
          :label="$t('fields.links.label')">
          <template #head>
            <tr>
              <th>{{ $t('name') }}</th>
              <th>{{ $t('url') }}</th>
              <th></th>
            </tr>
          </template>
          <template #row="{ entry }">
            <td>
              {{ entry.name }}
            </td>
            <td>
              {{ entry.url }}
            </td>
          </template>
          <template #new="{ newEntry }">
            <td>
              <input
                v-model="newEntry.name"
                type="text">
            </td>
            <td>
              <input
                v-model="newEntry.url"
                type="text">
            </td>
          </template>
          <template #edit="{ editEntry }">
            <td>
              <input
                v-model="editEntry.name"
                type="text">
            </td>
            <td>
              <input
                v-model="editEntry.url"
                type="text">
            </td>
          </template>
        </KInputTable>

        <KInputTable
          v-model="identity.metas"
          :new-entry-template="{ key: '', value: '' }"
          name="user[metas]"
          :label="$t('fields.metas.label')">
          <template #head>
            <tr>
              <th>{{ $t('key') }}</th>
              <th>{{ $t('value') }}</th>
              <th></th>
            </tr>
          </template>
          <template #row="{ entry }">
            <td>
              {{ entry.key }}
            </td>
            <td>
              {{ entry.value }}
            </td>
          </template>
          <template #new="{ newEntry }">
            <td>
              <input
                v-model="newEntry.key"
                type="text">
            </td>
            <td>
              <input
                v-model="newEntry.value"
                type="text">
            </td>
          </template>
        </KInputTable>
      </template>
    </KForm>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import GET_IDENTITY from '../../gql/identity/IDENTITY_QUERY.graphql'
import IDENTITY_FRAGMENT from '../../gql/identity/IDENTITY_FRAGMENT.graphql'

export default {
  data () {
    return {
      loading: 0,
      newlink: {
        name: '',
        url: ''
      },
      newmeta: {
        key: '',
        value: ''
      }
    }
  },

  async created () {
    this.loading++
    this.loading--
  },

  methods: {
    addlink () {
      this.identity.links.push({
        name: this.newlink.name,
        url: this.newlink.url
      })
      this.newlink.name = ''
      this.newlink.url = ''
    },

    deletelink (link) {
      const l = this.identity.links.find(l => l.id === link.id)
      const idx = this.identity.links.indexOf(l)
      this.identity.links = [
        ...this.identity.links.slice(0, idx),
        ...this.identity.links.slice(idx + 1)
      ]
    },

    addmeta () {
      this.identity.metas.push({
        key: this.newmeta.key,
        value: this.newmeta.value
      })
      this.newmeta.key = ''
      this.newmeta.value = ''
    },

    deletemeta (meta) {
      const l = this.identity.metas.find(l => l.id === meta.id)
      const idx = this.identity.metas.indexOf(l)
      this.identity.metas = [
        ...this.identity.metas.slice(0, idx),
        ...this.identity.metas.slice(idx + 1)
      ]
    },

    async save () {
      const params = this.$utils.stripParams(this.identity, ['__typename', 'id', 'languages'])
      this.$utils.validateImageParams(params, ['logo', 'image'])

      params.links.map(item => (delete item.__typename))
      params.metas.map(item => (delete item.__typename))

      try {
        await this.$apollo.mutate({
          mutation: gql`
            mutation UpdateIdentity($identityParams: IdentityParams) {
              updateIdentity(
                identityParams: $identityParams,
              ) {
                ...identity
              }
            }
            ${IDENTITY_FRAGMENT}
          `,
          variables: {
            identityParams: params
          }
        })

        this.$toast.success({ message: this.$t('updated') })
        this.$router.push({ name: 'dashboard' })
      } catch (err) {
        this.$utils.showError(err)
      }
    }
  },

  apollo: {
    identity: {
      query: GET_IDENTITY,
      fetchPolicy: 'no-cache'
    }
  }
}
</script>
<i18n>
  {
    "en": {
      "title": "Configuration",
      "subtitle": "Identity",
      "help": "Setup for identity and SEO/JSONLD.",
      "back-to-dashboard": "Back to dashboard",
      "organization": "Organization",
      "corporation": "Corporation",
      "name": "Name",
      "url": "URL",
      "key": "Key",
      "value": "Value",
      "updated": "Identity updated",
      "fields": {
        "type": {"label": "Type"},
        "name": {"label": "Name"},
        "alternateName": {"label": "Name, short form", "placeholder": "AB"},
        "email": {"label": "Email", "placeholder": "my@email.com"},
        "phone": {"label": "Phone", "placeholder": "+47 900 00 000"},
        "address": {"label": "Address", "placeholder": "Address"},
        "address2": {"label": "Address 2", "placeholder": "Address 2"},
        "address3": {"label": "Address 3", "placeholder": "Address 3"},
        "zipcode": {"label": "Zipcode", "placeholder": "0578"},
        "city": {"label": "City", "placeholder": "Oslo"},
        "country": {"label": "Country", "placeholder": "NO"},
        "description": {"label": "Description", "placeholder": "Description"},
        "titlePrefix": {"label": "Title prefix", "placeholder": "AB | "},
        "title": {"label": "Title (fallback)", "placeholder": "Tittel"},
        "titlePostfix": {"label": "Title postfix", "placeholder": " | AB"},
        "image": {"label": "Image"},
        "logo": {"label": "Logo"},
        "url": {"label": "URL", "placeholder": "https://minside.no"},
        "links": {"label": "Links (social media)"},
        "metas": {"label": "META variables"}
      }
    },
    "no": {
      "title": "Konfigurasjon",
      "subtitle": "Identitet",
      "help": "Konfigurasjon av virksomhetens identitet og SEO/JSONLD.",
      "back-to-dashboard": "Back to dashboard",
      "organization": "Organisasjon",
      "corporation": "Bedrift",
      "name": "Navn",
      "url": "URL",
      "key": "Nøkkel",
      "value": "Verdi",
      "updated": "Identitet oppdatert",
      "fields": {
        "type": {"label": "Type"},
        "name": {"label": "Navn"},
        "alternateName": {"label": "Kortere form av navnet", "placeholder": "AB"},
        "email": {"label": "Epost", "placeholder": "min@epost.no"},
        "phone": {"label": "Telefon", "placeholder": "+47 900 00 000"},
        "address": {"label": "Adresse", "placeholder": "Adresse"},
        "address2": {"label": "Adresse 2", "placeholder": "Adresse 2"},
        "address3": {"label": "Adresse 3", "placeholder": "Adresse 3"},
        "zipcode": {"label": "Postnr", "placeholder": "0578"},
        "city": {"label": "Poststed", "placeholder": "Oslo"},
        "country": {"label": "Land", "placeholder": "NO"},
        "description": {"label": "Beskrivelse", "placeholder": "Beskrivelse"},
        "titlePrefix": {"label": "Tittel prefiks", "placeholder": "AB | "},
        "title": {"label": "Hovedtittel (fallback)", "placeholder": "Tittel"},
        "titlePostfix": {"label": "Tittel postfiks", "placeholder": " | AB"},
        "image": {"label": "Bilde"},
        "logo": {"label": "Logo"},
        "url": {"label": "URL", "placeholder": "https://minside.no"},
        "links": {"label": "Linker (sosiale medier)"},
        "metas": {"label": "META variabler"}
      }
    }
  }
</i18n>
