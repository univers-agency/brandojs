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
          Konfigurasjon av variabler som kan brukes i innholdsmoduler og generelt på nettsiden
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
      @click="showNewCategoryModal = true">
      Legg til kategori
    </ButtonPrimary>

    <KModal
      v-if="showNewCategoryModal"
      ref="modal"
      v-shortkey="['esc']"
      ok-text="Lagre"
      @shortkey.native="closeModal"
      @ok="saveNewCategory"
      @cancel="closeModal">
      <template #header>
        Legg til ny kategori
      </template>
      <KInput
        v-model="newCategory.label"
        :name="`category[label]`"
        rules="required"
        label="Etikett" />

      <KInputSlug
        v-model="newCategory.key"
        :from="newCategory.label"
        :name="`category[key]`"
        rules="required"
        label="Nøkkel" />
    </KModal>

    <template v-if="globalCategories">
      <KForm
        v-for="category in globalCategories"
        :key="category.id"
        back-text="Tilbake til dashbordet"
        @save="saveCategory(category)">
        <template v-slot>
          <div class="category">
            <h3>
              {{ category.label }}
            </h3>
            <template v-if="editing">
              <KInput
                v-model="category.label"
                monospace
                :name="`category[${category.id}][label]`"
                rules="required"
                label="Kategori — etikett" />

              <KInput
                v-model="category.key"
                monospace
                :name="`category[${category.id}][key]`"
                rules="required"
                label="Kategori — nøkkel" />
            </template>

            <KInputTable
              v-if="category.globals"
              v-model="category.globals"
              :new-entry-template="{ type: 'text', label: '', key: '', data: { value: ''}}"
              :delete-rows="editing"
              :edit-rows="true"
              :add-rows="editing"
              :name="`category[${category.id}][globals]`"
              label="">
              <template v-slot:head>
                <tr>
                  <th>Etikett</th>
                  <th>Verdi</th>
                  <th></th>
                </tr>
              </template>
              <template v-slot:row="{ entry }">
                <td class="monospace">
                  {{ entry.label }}
                </td>
                <td class="monospace">
                  <template v-if="entry.type === 'text'">
                    {{ entry.data.value }}
                  </template>
                  <template v-else-if="entry.type === 'boolean'">
                    <CheckOrX :val="entry.data.value" />
                  </template>
                  <template v-else-if="entry.type === 'html'">
                    HTML
                  </template>
                  <template v-else-if="entry.type === 'color'">
                    <svg
                      style="display: inline-block; margin-right: 5px;"
                      width="15"
                      height="15">
                      <circle
                        :fill="entry.data.value"
                        cx="7.5"
                        cy="7.5"
                        r="7.5" />
                    </svg>{{ entry.data.value }}
                  </template>
                </td>
              </template>
              <template #edit="{ editEntry, callback }">
                <KModal
                  ref="globalModal"
                  v-shortkey="['esc']"
                  :wide="editEntry.type === 'html'"
                  ok-text="Lukk"
                  @shortkey.native="closeGlobalModal(callback)"
                  @ok="closeGlobalModal(callback)">
                  <template #header>
                    Endre variabel — {{ editEntry.label }}
                  </template>
                  <KInput
                    v-if="editing"
                    v-model="editEntry.label"
                    :name="`global[label]`"
                    rules="required"
                    label="Etikett" />

                  <KInput
                    v-if="editing"
                    v-model="editEntry.key"
                    :name="`global[key]`"
                    rules="required"
                    label="Nøkkel" />

                  <KInputSelect
                    v-if="editing"
                    v-model="editEntry.type"
                    :name="`global[type]`"
                    :options="[{
                                 id: 'boolean',
                                 name: 'Boolean',
                               }, {
                                 id: 'html',
                                 name: 'HTML',
                               }, {
                                 id: 'text',
                                 name: 'text',
                               },
                               {
                                 id: 'color',
                                 name: 'color',
                               }]"
                    rules="required"
                    label="Type" />

                  <template v-if="editEntry.type === 'text'">
                    <KInput
                      v-model="editEntry.data.value"
                      :name="`global[data][value]`"
                      rules="required"
                      label="Verdi" />
                  </template>
                  <template v-else-if="editEntry.type === 'boolean'">
                    <KInputToggle
                      v-model="editEntry.data.value"
                      :name="`global[data][value]`"
                      rules="required"
                      label="Verdi" />
                  </template>
                  <template v-if="editEntry.type === 'html'">
                    <KInputRichText
                      v-model="editEntry.data.value"
                      :name="`global[data][value]`"
                      rules="required"
                      label="Verdi" />
                  </template>
                  <template v-if="editEntry.type === 'color'">
                    <KInputColor
                      v-model="editEntry.data.value"
                      :name="`global[data][value]`"
                      rules="required"
                      label="Verdi" />
                  </template>
                </KModal>
              </template>

              <template
                v-if="editing"
                v-slot:new="{ newEntry }">
                <td>
                  <KInput
                    v-model="newEntry.label"
                    monospace
                    slim
                    placeholder="Etikett"
                    name="newEntry[label]" />
                </td>
                <td>
                  <KInput
                    v-model="newEntry.key"
                    monospace
                    slim
                    placeholder="nøkkel"
                    name="newEntry[name]" />
                </td>
              </template>
            </KInputTable>
            <div
              v-if="!category.globals.length && !editing"
              class="empty-globals">
              Ingen tilgjengelige globaler
            </div>
          </div>
        </template>
      </KForm>
    </template>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import GET_GLOBAL_CATEGORIES from '../../gql/identity/GLOBAL_CATEGORIES_QUERY.graphql'

export default {
  data () {
    return {
      editing: false,
      loading: 0,

      newCategory: { label: '', key: '' },
      showNewCategoryModal: false
    }
  },

  async created () {
    this.loading++
    this.loading--
  },

  methods: {
    async closeModal () {
      await this.$refs.modal.close()
      this.showNewCategoryModal = false
    },

    async closeGlobalModal (callback, entry) {
      await this.$refs.globalModal[0].close()
      if (callback) {
        callback()
      }
    },

    async saveNewCategory () {
      try {
        await this.$apollo.mutate({
          mutation: gql`
            mutation CreateGlobalCategory($globalCategoryParams: GlobalCategoryParams) {
              createGlobalCategory(
                globalCategoryParams: $globalCategoryParams,
              ) {
                id
              }
            }
          `,

          variables: {
            globalCategoryParams: this.newCategory
          },

          update: (store, data) => {
            this.$apollo.queries.globalCategories.refresh()
            this.$toast.success({ message: 'Kategori opprettet' })
          }
        })
      } catch (err) {
        this.$utils.showError(err)
      }
    },

    async saveCategory (category) {
      const strippedCategory = this.$utils.stripParams(category, ['__typename'])
      const globals = strippedCategory.globals.map(g => {
        delete g.__typename
        return { ...g, data: JSON.stringify(g.data) }
      })
      const globalCategoryParams = { ...strippedCategory, globals }

      try {
        await this.$apollo.mutate({
          mutation: gql`
            mutation UpdateGlobalCategory($categoryId: ID!, $globalCategoryParams: GlobalCategoryParams) {
              updateGlobalCategory(
                categoryId: $categoryId,
                globalCategoryParams: $globalCategoryParams,
              ) {
                id
              }
            }
          `,

          variables: {
            categoryId: category.id,
            globalCategoryParams
          },

          update: (store, data) => {
            this.$apollo.queries.globalCategories.refresh()
            this.$toast.success({ message: 'Kategori lagret' })
          }
        })
      } catch (err) {
        this.$utils.showError(err)
      }
    }
  },

  apollo: {
    globalCategories: {
      query: GET_GLOBAL_CATEGORIES
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
    h3 {
      @fontsize lg;
      @space margin-bottom sm;
      font-weight: 500;
    }

    >>> .input-table {
      margin-bottom: 0;
    }
  }

  .form-wrapper + .form-wrapper {
    margin-top: 2.5rem;
  }

  .form-wrapper {
    border: 1px solid theme(colors.blue);
    padding: 2rem;
    max-width: 800px;
  }
</style>
