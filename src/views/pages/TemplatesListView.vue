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
                  @click="createBlankTemplate">
                  {{ $t('templates.new') }}
                </button>
              </li>
              <li>
                <button
                  @click="showImportTemplates = true">
                  {{ $t('templates.import-templates') }}
                </button>
              </li>
            </template>
          </Dropdown>
        </div>
      </template>
    </ContentHeader>

    <KModal
      v-if="showImportTemplates"
      ref="importModal"
      v-shortkey="['esc', 'enter']"
      ok-text="OK"
      @shortkey.native="showImportTemplates = false"
      @ok="importTemplates">
      <template #header>
        {{ $t('templates.import-templates') }}
      </template>
      <KInputTextarea
        v-model="importTemplatesJSON"
        label="JSON"
        name="templates[import]" />
    </KModal>

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
          <div
            class="svg-wrapper"
            v-html="entry.svg" />
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
      showImportTemplates: false,
      importTemplatesJSON: '',
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
      this.$toast.success({ message: 'Copied to clipboard' })
      clearSelection()
    },

    async importTemplates () {
      if (this.importTemplatesJSON === '') {
        await this.$refs.importModal.close()
        this.showImportTemplates = false
        return
      }

      const importedTemplates = JSON.parse(this.importTemplatesJSON)

      importedTemplates.forEach(t => {
        if (!t.class) {
          this.$toast.error({ message: 'Error in template format. No data.class found' })
          return
        }

        delete t.id
        delete t.insertedAt
        delete t.updatedAt
        delete t.deletedAt
        delete t.__typename

        t.refs = JSON.stringify(t.refs)
        t.vars = JSON.stringify(t.vars)

        this.$alerts.alertConfirm('OBS', `Are you sure you want to import this template?<br><br>${t.namespace}: <strong>${t.class}</strong>`, async (data) => {
          if (!data) {
            return
          }
          this.createTemplate(t, false)
        })
      })

      await this.$refs.importModal.close()
      this.showImportTemplates = false
    },

    createBlankTemplate () {
      const params = {
        name: 'New module',
        namespace: 'general',
        class: 'module',
        code: '<article data-v="module">\n\t<div class="inner">\n\t\t/* */\n\t</div>\n</article>',
        helpText: 'Help text',
        refs: '[]',
        vars: '{}'
      }

      this.createTemplate(params)
    },

    async createTemplate (params, gotoTemplate = true) {
      const templateParams = params

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
            this.$apollo.queries.templates.refresh()
            if (gotoTemplate) {
              this.$router.push({ name: 'templates-edit', params: { templateId: createTemplate.id } })
            }
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

  >>> .svg-wrapper {
    svg {
      width: 100%;
      height: auto;
    }
  }
</style>
