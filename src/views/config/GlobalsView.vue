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

    <KInputToggle
      v-if="$can('admin', 'Globals')"
      v-model="editing"
      name="data[editing]"
      label="Administrér globale variabler (avansert)" />

    <ButtonPrimary
      v-if="editing"
      class="add-category-btn"
      @click="newCategory">
      Legg til kategori
    </ButtonPrimary>

    <KForm
      v-if="identity"
      :back="{ name: 'dashboard' }"
      back-text="Tilbake til dashbordet"
      @save="save">
      <template v-slot>
        <div
          v-if="identity && identity.globalCategories && identity.globalCategories.length || editing">
          <div
            v-for="category in identity.globalCategories"
            :key="category.id"
            class="category">
            <h3>
              {{ category.label }}
            </h3>
            <template v-if="editing">
              <KInput
                v-model="category.label"
                :name="`category[${category.id}][label]`"
                rules="required"
                label="Kategori — label" />

              <KInput
                v-model="category.key"
                :name="`category[${category.id}][key]`"
                rules="required"
                label="Kategori — nøkkel" />
            </template>

            <KInputTable
              v-if="category.globals"
              v-model="category.globals"
              :delete-rows="editing"
              :add-rows="editing"
              :name="`category[${category.id}][globals]`"
              label="">
              <template v-slot:head>
                <tr>
                  <th>Label</th>
                  <th v-if="editing">Nøkkel</th>
                  <th>Verdi</th>
                  <th v-if="editing"></th>
                </tr>
              </template>
              <template v-slot:row="{ entry }">
                <td>
                  <input
                    v-if="editing"
                    v-model="entry.label"
                    type="text">
                  <div v-else>
                    {{ entry.label }}
                  </div>
                </td>
                <td v-if="editing">
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
              <template
                v-if="editing"
                v-slot:new="{ newEntry }">
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
          </div>
        </div>
        <div
          v-else
          class="empty-globals">
          Ingen tilgjengelige globaler
        </div>
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
      editing: false,
      loading: 0,
      identity: {}
    }
  },

  async created () {
    this.loading++
    this.loading--
  },

  methods: {
    newCategory () {
      this.identity.globalCategories.push({ label: 'Label', key: 'key', globals: [] })
    },

    async save () {
      const params = this.$utils.stripParams(this.identity, ['__typename', 'id', 'logo', 'image', 'links', 'metas'])
      params.globalCategories.map(item => {
        delete item.__typename
        item.globals.map(global => {
          delete global.__typename
        })
      })

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
<style lang="postcss" scoped>
  .empty-globals {
    @color bg peach;
    padding: 1rem 2rem;
    margin-bottom: 25px;
  }

  .add-category-btn {
    @space margin-bottom sm;
  }

  .category {
    border: 1px solid theme(colors.blue);
    padding: 2rem;

    + .category {
      margin-top: 1rem;
    }

    h3 {
      @space margin-bottom sm;
    }
  }
</style>
