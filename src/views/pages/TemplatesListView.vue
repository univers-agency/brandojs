<template>
  <article>
    <ContentHeader>
      <template v-slot:title>{{ $t('templates.title') }}</template>
      <template v-slot:subtitle>{{ $t('templates.subtitle') }}</template>
      <template v-slot:help>
        <div>
          <Dropdown>
            <template v-slot:default>{{ $t('templates.actions') }}</template>
            <template v-slot:content>
              <li>
                <button
                  type="button"
                  @click="createTemplate">
                  {{ $t('templates.new') }}
                </button>
              </li>
            </template>
          </Dropdown>
        </div>
      </template>
    </ContentHeader>

    <div class="row">
      <div class="half">
        <h2>{{ $t('templates.index') }}</h2>
      </div>
    </div>
    <ContentList
      v-if="templates"
      :entries="templates"
      :sortable="true"
      :filter-keys="['name', 'namespace']"
      @updateQuery="queryVars = $event"
      @sort="sortEntries">
      <template #selected="{ entries, clearSelection}">
        <li>
          <button
            @click="exportTemplates(entries, clearSelection)">
            {{ $t('templates.export-templates') }}
          </button>
          <button
            @click="importTemplates(entries, clearSelection)">
            {{ $t('templates.import-templates') }}
          </button>
          <button
            @click="deleteEntries(entries, clearSelection)">
            {{ $t('templates.delete-templates') }}
          </button>
        </li>
      </template>
      <template v-slot:row="{ entry }">
        <div class="col-2 mono">
          <div class="badge">
            {{ entry.namespace }}
          </div>
        </div>
        <div class="col-2">
          <div v-html="entry.svg" />
        </div>
        <div class="col-10 title mono">
          <router-link
            :to="{ name: 'templates-edit', params: { templateId: entry.id } }"
            class="link name-link">
            {{ entry.name }}
          </router-link><br>
        </div>
        <div class="col-1">
          <CircleDropdown>
            <li>
              <router-link
                :to="{ name: 'templates-edit', params: { templateId: entry.id } }">
                {{ $t('templates.edit-template') }}
              </router-link>
            </li>

            <li>
              <button
                type="button"
                @click="duplicateEntry(entry)">
                {{ $t('templates.duplicate-template') }}
              </button>
            </li>

            <li>
              <button
                type="button"
                @click="deleteEntry(entry.id)">
                {{ $t('templates.delete-template') }}
              </button>
            </li>
          </CircleDropdown>
        </div>
      </template>
    </ContentList>
  </article>
</template>

<script>
import gql from 'graphql-tag'
import GET_TEMPLATES from '../../gql/pages/TEMPLATES_QUERY.graphql'
import locale from '../../locales/templates'

export default {
  data () {
    return {
      visibleChildren: [],
      queryVars: {
        filter: null,
        offset: 0,
        limit: 50
      }
    }
  },

  inject: ['adminChannel'],

  methods: {
    exportTemplates (entries, clearSelection) {
      const exportJSON = entries.map(st => {
        return this.templates.find(t => t.id === st)
      })
      navigator.clipboard.writeText(JSON.stringify(exportJSON))
      this.$toast.success({ message: 'Kopiert til utklippstavlen' })
      clearSelection()
    },

    importTemplates () {
      navigator.clipboard.readText().then(clipText => {
        const importedTemplates = JSON.parse(clipText)
        importedTemplates.forEach(t => {
          if (!t.data?.class) {
            this.$toast.error({ message: 'Feil i modulformat. Mangler data.class' })
            return
          }
          this.$alerts.alertConfirm('OBS', `Er du sikker på at du vil importere denne modulen?<br><br>${t.data.namespace}: <strong>${t.data.class}</strong>`, async (data) => {
            if (!data) {
              return
            }
            this.storeTemplate(t)
            this.templates.push(t)
          })
        })
      })
    },

    async createTemplate () {
      const templateParams = {
        name: 'New module',
        namespace: 'general',
        class: 'module',
        code: '<article data-v="module">\n\t<div class="inner">\n\t\t/* */\n\t</div>\n</article>',
        helpText: 'Help text',
        refs: '[]',
        vars: '{}'
      }

      try {
        await this.$apollo.mutate({
          mutation: gql`
            mutation CreateTemplate($templateParams: TemplateParams!) {
              createTemplate(templateParams: $templateParams) {
                id
              }
            }
          `,
          variables: {
            templateParams
          },

          update: (store, { data: { createTemplate } }) => {
            console.log(createTemplate)
            this.$apollo.queries.templates.refresh()
            this.$router.push({ name: 'templates-edit', params: { templateId: createTemplate.id } })
          }
        })

        this.$toast.success({ message: this.$t('templates.template-create') })
      } catch (err) {
        this.$utils.showError(err)
      }
    },

    sortEntries (seq) {
      this.adminChannel.channel
        .push('templates:sequence_templates', { ids: seq })
        .receive('ok', payload => {
          this.$toast.success({ message: this.$t('templates.sequence-updated') })
        })
    },

    async duplicateEntry (template) {
      try {
        await this.$apollo.mutate({
          mutation: gql`
            mutation DuplicateTemplate($templateId: ID!) {
              duplicateTemplate(templateId: $templateId) {
                id
              }
            }
          `,
          variables: {
            templateId: template.id
          },

          update: (store, { data: { duplicateTemplate } }) => {
            this.$apollo.queries.templates.refresh()
          }
        })

        this.$toast.success({ message: this.$t('templates.template-duplicated') })
      } catch (err) {
        this.$utils.showError(err)
      }
    },

    async deleteEntry (entryId, override) {
      const fn = async () => {
        try {
          await this.$apollo.mutate({
            mutation: gql`
              mutation DeleteTemplate($templateId: ID!) {
                deleteTemplate(templateId: $templateId) {
                  id
                }
              }
            `,
            variables: {
              templateId: entryId
            },

            update: (store, { data: { deleteTemplate } }) => {
              this.$apollo.queries.templates.refresh()
            }
          })

          this.$toast.success({ message: this.$t('templates.template-deleted') })
        } catch (err) {
          this.$utils.showError(err)
        }
      }

      if (override) {
        fn()
      } else {
        this.$alerts.alertConfirm('OBS', this.$t('templates.delete-confirm'), async confirm => {
          if (!confirm) {
            return false
          } else {
            fn()
          }
        })
      }
    },

    deleteEntries (entries, clearSelection) {
      this.$alerts.alertConfirm('OBS', this.$t('templates.delete-confirm-many'), async data => {
        if (!data) {
          return
        }

        entries.forEach(async id => {
          this.deleteEntry(id, true)
        })

        clearSelection()
      })
    }
  },

  apollo: {
    templates: {
      query: GET_TEMPLATES,
      variables () {
        return this.queryVars
      }
    }
  },

  i18n: {
    sharedMessages: locale
  }
}
</script>

<style lang="postcss" scoped>
  .title {
    @fontsize base;
  }

  .arrow {
    margin-right: 15px;
    opacity: 0.3;
  }

  .subtitle {
    @fontsize base(0.8);
    font-family: theme(typography.families.mono);
    display: flex;
    flex-direction: row;

    .badge {
      margin-top: 5px;
    }
  }
</style>
