<template>
  <div>
    <ContentHeader>
      <template v-slot:title>
        Konfigurasjon
      </template>
      <template v-slot:subtitle>
        Globale variabler
      </template>
      <template v-slot:help>
        <p>
          Konfigurasjon av variabler som kan brukes i innholdsmaler og generelt på nettsiden
        </p>
      </template>
    </ContentHeader>
    <KForm
      v-if="identity"
      :back="{ name: 'dashboard' }"
      back-text="Tilbake til dashbordet"
      @save="save">
      <template v-slot>
        <KInputTable
          v-model="identity.globals"
          name="identity[globals]"
          label="Globale variabler">
          <template v-slot:head>
            <tr>
              <th>Label</th>
              <th>Nøkkel</th>
              <th>Verdi</th>
              <th></th>
            </tr>
          </template>
          <template v-slot:row="{ entry }">
            <td>
              <input
                v-model="entry.label"
                type="text">
            </td>
            <td>
              <input
                v-model="entry.key"
                type="text">
            </td>
            <td>
              <input
                v-model="entry.value"
                type="text">
            </td>
          </template>
          <template v-slot:new="{ newEntry }">
            <td>
              <input
                v-model="newEntry.label"
                type="text">
            </td>
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
      identity: {}
    }
  },

  async created () {
    this.loading++
    this.loading--
  },

  methods: {
    async save () {
      const params = this.$utils.stripParams(this.identity, ['__typename', 'id', 'logo', 'image', 'links', 'metas'])
      params.globals.map(item => (delete item.__typename))

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

        this.$toast.success({ message: 'Globale variabler oppdatert' })
        this.$router.push({ name: 'dashboard' })
      } catch (err) {
        this.$utils.showError(err)
      }
    }
  },

  apollo: {
    identity: {
      query: GET_IDENTITY
    }
  }
}
</script>
