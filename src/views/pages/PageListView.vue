<template>
  <article>
    <ContentHeader>
      <template v-slot:title>{{ $t('pages.title') }}</template>
      <template v-slot:subtitle>{{ $t('pages.subtitle') }}</template>
      <template v-slot:help>
        <div>
          <Dropdown>
            <template v-slot:default>{{ $t('pages.actions') }}</template>
            <template v-slot:content>
              <li>
                <router-link :to="{ name: 'pages-new' }">{{ $t('pages.new') }}</router-link>
              </li>
              <li>
                <button
                  type="button"
                  @click="reprocess">
                  {{ $t('pages.reprocess') }}
                </button>
              </li>
            </template>
          </Dropdown>
        </div>
      </template>
    </ContentHeader>

    <div class="row">
      <div class="half">
        <h2>{{ $t('pages.index') }}</h2>
      </div>
    </div>
    <ContentList
      v-if="pages"
      :entries="pages"
      :sortable="true"
      :status="true"
      :filter-keys="['title']"
      @updateQuery="queryVars = $event"
      @sort="sortPages">
      <template #selected="{ entries, clearSelection}">
        <li>
          <button
            @click="deleteEntries(entries, clearSelection)">
            Slett sider
          </button>
        </li>
      </template>
      <template v-slot:row="{ entry }">
        <div class="col-1">
          <div class="circle">
            <span>{{ entry.language }}</span>
          </div>
        </div>
        <div class="col-7 title flex-h">
          <router-link
            :to="{ name: 'pages-edit', params: { pageId: entry.id } }"
            class="link name-link">
            {{ entry.title }}
          </router-link>
          <div class="badge">{{ entry.key }}</div>
        </div>
        <div class="col-2">
          <ChildrenButton
            v-show="(entry.fragments ? entry.fragments.length : 0) + (entry.children ? entry.children.length : 0)"
            :id="entry.id"
            :length="(entry.fragments ? entry.fragments.length : 0) + (entry.children ? entry.children.length : 0)"
            :visible-children="visibleChildren">
          </ChildrenButton>
        </div>
        <div class="col-4">
          <ItemMeta
            :entry="entry"
            :user="entry.creator" />
        </div>
        <div class="col-1">
          <CircleDropdown>
            <li>
              <router-link
                :to="{ name: 'sections-new', params: { pageId: entry.id } }">
                {{ $t('pages.new-section') }}
              </router-link>
            </li>
            <li>
              <router-link
                :to="{ name: 'pages-edit', params: { pageId: entry.id } }">
                {{ $t('pages.edit-page') }}
              </router-link>
            </li>

            <li>
              <button
                type="button"
                @click="duplicatePage(entry)">
                {{ $t('pages.duplicate-page') }}
              </button>
            </li>

            <li>
              <button
                type="button"
                @click="reprocessPage(entry)">
                {{ $t('pages.reprocess-page') }}
              </button>
            </li>

            <li>
              <button
                type="button"
                @click="deleteEntry(entry.id)">
                {{ $t('pages.delete-page') }}
              </button>
            </li>
          </CircleDropdown>
        </div>
      </template>
      <template v-slot:children="{ entry }">
        <template v-if="visibleChildren.includes(entry.id)">
          <ContentList
            v-if="entry.fragments.length"
            :level="2"
            :entries="entry.fragments"
            :sortable="true"
            :sort-parent="entry.id"
            sequence-handle="section-sequence-handle"
            @sort="sortSections($event, entry.id)"
            @move="moveSections">
            <template v-slot:row="{ entry: section }">
              <div class="col-1">
                <div class="circle">
                  <span>{{ section.language }}</span>
                </div>
              </div>
              <div class="col-8 subtitle">
                <div class="arrow">↳</div>
                <div class="flex-v">
                  <router-link
                    :to="{ name: 'sections-edit', params: { sectionId: section.id } }">
                    {{ section.title || 'Ingen tittel' }}
                  </router-link>
                  <div class="keys">
                    <div class="badge">{{ section.parentKey }}</div>
                    <div class="badge">{{ section.key }}</div>
                  </div>
                </div>
              </div>
              <div class="col-5 flex-v">
                <div class="badge">{{ $t('pages.section') }}</div>
              </div>
              <div class="col-1">
                <CircleDropdown>
                  <li>
                    <router-link
                      :to="{ name: 'sections-edit', params: { sectionId: section.id } }">
                      {{ $t('pages.edit-section') }}
                    </router-link>
                  </li>
                  <li>
                    <button
                      type="button"
                      @click="duplicateSection(section)">
                      {{ $t('pages.duplicate-section') }}
                    </button>
                  </li>

                  <li>
                    <button @click="deleteSection(section)">{{ $t('pages.delete-section') }}</button>
                  </li>
                </CircleDropdown>
              </div>
            </template>
          </ContentList>
          <ContentList
            v-if="entry.children.length"
            :level="2"
            :entries="entry.children">
            <template v-slot:row="{ entry: subPage }">
              <div class="col-1"></div>
              <div class="col-1">
                <div class="circle">
                  <span>{{ entry.language }}</span>
                </div>
              </div>
              <div class="col-8 title flex-h">
                <router-link :to="{ name: 'pages-edit', params: { pageId: subPage.id } }">
                  {{ subPage.title }}
                </router-link>
                <div class="badge">{{ subPage.key }}</div>
              </div>
              <div class="col-5 flex-v">
                <div class="badge">{{ $t('pages.subpage') }}</div>
              </div>
              <div class="col-1">
                <CircleDropdown>
                  <li>
                    <router-link
                      :to="{ name: 'pages-edit', params: { pageId: subPage.id } }">
                      {{ $t('pages.edit-subpage') }}
                    </router-link>
                  </li>
                  <li>
                    <button @click="deleteEntry(subPage.id)">{{ $t('pages.delete-subpage') }}</button>
                  </li>
                </CircleDropdown>
              </div>
            </template>
          </ContentList>
        </template>
      </template>
    </ContentList>
  </article>
</template>

<script>
import gql from 'graphql-tag'
import GET_PAGES from '../../gql/pages/PAGES_QUERY.graphql'

export default {
  data () {
    return {
      visibleChildren: [],
      queryVars: {
        filter: null,
        offset: 0,
        limit: 50,
        status: 'published'
      }
    }
  },

  inject: ['adminChannel'],

  methods: {
    reprocess () {
      this.adminChannel.channel
        .push('page:rerender_all')
        .receive('ok', payload => {
          this.$toast.success({ message: 'Sidene ble gjengitt på nytt' })
        })

      this.adminChannel.channel
        .push('page_fragment:rerender_all')
        .receive('ok', payload => {
          this.$toast.success({ message: 'Fragmentene ble gjengitt på nytt' })
        })
    },

    sortPages (seq) {
      this.adminChannel.channel
        .push('pages:sequence_pages', { ids: seq })
        .receive('ok', payload => {
          this.$toast.success({ message: this.$t('pages.sequence-updated') })
        })
    },

    sortSections (seq, pageId) {
      this.adminChannel.channel
        .push('page_fragments:sequence_fragments', { ids: seq })
        .receive('ok', payload => {
          this.$toast.success({ message: this.$t('pages.sequence-updated') })
        })
    },

    moveSections (data) {
      // TODO!: move sections
    },

    async duplicatePage (page) {
      try {
        await this.$apollo.mutate({
          mutation: gql`
            mutation DuplicatePage($pageId: ID!) {
              duplicatePage(pageId: $pageId) {
                id
              }
            }
          `,
          variables: {
            pageId: page.id
          },

          update: (store, { data: { duplicatePage } }) => {
            this.$apollo.queries.pages.refresh()
          }
        })

        this.$toast.success({ message: this.$t('pages.page-duplicated') })
      } catch (err) {
        this.$utils.showError(err)
      }
    },

    async duplicateSection (section) {
      try {
        await this.$apollo.mutate({
          mutation: gql`
            mutation DuplicateSection($sectionId: ID!) {
              duplicateSection(sectionId: $sectionId) {
                id
              }
            }
          `,
          variables: {
            sectionId: section.id
          },

          update: (store, { data: { duplicateSection } }) => {
            this.$apollo.queries.pages.refresh()
          }
        })

        this.$toast.success({ message: this.$t('pages.section-duplicated') })
      } catch (err) {
        this.$utils.showError(err)
      }
    },

    async deleteSection (section) {
      this.$alerts.alertConfirm(
        'OBS',
        this.$t('pages.are-you-sure-you-want-to-delete-this-section'),
        async confirm => {
          if (!confirm) {
            return false
          } else {
            try {
              await this.$apollo.mutate({
                mutation: gql`
                  mutation DeletePageFragment($pageFragmentId: ID!) {
                    deletePageFragment(pageFragmentId: $pageFragmentId) {
                      id
                    }
                  }
                `,
                variables: {
                  pageFragmentId: section.id
                },

                update: (store, { data: { deletePageFragment } }) => {
                  this.$apollo.queries.pages.refresh()
                }
              })

              this.$toast.success({
                message: this.$t('pages.section-deleted')
              })
            } catch (err) {
              this.$utils.showError(err)
            }
          }
        }
      )
    },

    async deleteEntry (entryId, override) {
      const fn = async () => {
        try {
          await this.$apollo.mutate({
            mutation: gql`
              mutation DeletePage($pageId: ID!) {
                deletePage(pageId: $pageId) {
                  id
                }
              }
            `,
            variables: {
              pageId: entryId
            },

            update: (store, { data: { deletePage } }) => {
              this.$apollo.queries.pages.refresh()
            }
          })

          this.$toast.success({ message: this.$t('pages.page-deleted') })
        } catch (err) {
          this.$utils.showError(err)
        }
      }

      if (override) {
        fn()
      } else {
        this.$alerts.alertConfirm('OBS', this.$t('pages.delete-confirm'), async confirm => {
          if (!confirm) {
            return false
          } else {
            fn()
          }
        })
      }
    },

    deleteEntries (entries, clearSelection) {
      this.$alerts.alertConfirm('OBS', this.$t('pages.delete-confirm-many'), async data => {
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
    pages: {
      query: GET_PAGES,
      variables () {
        return this.queryVars
      }
    }
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

<i18n>
{
  "en": {
    "pages.title": "Pages and sections",
    "pages.subtitle": "Content administration",
    "pages.index": "Index",
    "pages.actions": "Actions",
    "pages.new": "New page",
    "pages.reprocess": "Reprocess pages/sections",
    "pages.new-section": "New section",
    "pages.section": "Section",
    "pages.sequence-updated": "Sequence updated",
    "pages.delete-page": "Delete page",
    "pages.duplicate-page": "Duplicate page",
    "pages.duplicate-section": "Duplicate section",
    "pages.edit-section": "Edit section",
    "pages.delete-section": "Delete section",
    "pages.are-you-sure-you-want-to-delete-this-section": "Are you sure you want to delete this section?",
    "pages.edit-page": "Edit page",
    "pages.reprocess-page": "Reprocess page",
    "pages.section-deleted": "Section deleted",
    "pages.delete-confirm": "Are you sure you want to delete this page?",
    "pages.delete-confirm-many": "Are you sure you want to delete these pages?",
    "pages.page-deleted": "Page deleted",
    "pages.page-duplicated": "Page duplicated",
    "pages.section-duplicated": "Section duplicated",
    "pages.subpage": "Subpage",
    "pages.edit-subpage": "Edit subpage",
    "pages.delete-subpage": "Delete subpage"
  },
  "no": {
    "pages.title": "Sider og seksjoner",
    "pages.subtitle": "Innholdsadministrasjon",
    "pages.index": "Oversikt",
    "pages.actions": "Handlinger",
    "pages.new": "Ny side",
    "pages.reprocess": "Behandle sider og seksjoner på nytt",
    "pages.delete-section": "Slett seksjon",
    "pages.edit-page": "Rediger side",
    "pages.new-section": "Ny seksjon",
    "pages.section": "Seksjon",
    "pages.sequence-updated": "Rekkefølge oppdatert",
    "pages.are-you-sure-you-want-to-delete-this-section": "Er du sikker på at du vil slette denne seksjonen?",
    "pages.delete-page": "Slett siden",
    "pages.duplicate-page": "Dupliser side",
    "pages.duplicate-section": "Dupliser seksjon",
    "pages.edit-section": "Rediger seksjon",
    "pages.reprocess-page": "Behandle siden på nytt",
    "pages.section-deleted": "Seksjon slettet",
    "pages.delete-confirm": "Er du sikker på at du vil slette denne siden?",
    "pages.delete-confirm-many": "Er du sikker på at du vil slette disse sidene?",
    "pages.page-deleted": "Siden ble slettet",
    "pages.page-duplicated": "Siden ble duplisert",
    "pages.section-duplicated": "Seksjonen ble duplisert",
    "pages.subpage": "Underside",
    "pages.edit-subpage": "Endre underside",
    "pages.delete-subpage": "Slett underside"
  }
}
</i18n>
