<template>
  <article>
    <ContentHeader>
      <template v-slot:title>{{ $t('menus.title') }}</template>
      <template v-slot:subtitle>{{ $t('menus.subtitle') }}</template>
      <template v-slot:help>
        <div>
          <Dropdown>
            <template v-slot:default>{{ $t('menus.actions') }}</template>
            <template v-slot:content>
              <li>
                <router-link :to="{ name: 'navigation-new' }">{{ $t('menus.new') }}</router-link>
              </li>
            </template>
          </Dropdown>
        </div>
      </template>
    </ContentHeader>

    <div class="row">
      <div class="half">
        <h2>{{ $t('menus.index') }}</h2>
      </div>
    </div>
    <ContentList
      v-if="menus"
      :entries="menus"
      :sortable="true"
      :status="true"
      :filter-keys="['title']"
      @updateQuery="queryVars = $event"
      @sort="sortMenus">
      <template #empty>
        Ingen menyer fantes. Det kan være menyene er hardkodet i applikasjonen!
      </template>
      <template #selected="{ entries, clearSelection}">
        <li>
          <button
            @click="deleteEntries(entries, clearSelection)">
            Slett menyer
          </button>
        </li>
      </template>
      <template v-slot:row="{ entry }">
        <div class="col-1">
          <div class="circle">
            <span>{{ entry.language }}</span>
          </div>
        </div>
        <div class="col-7 title">
          <router-link
            :to="{ name: 'navigation-edit', params: { menuId: entry.id } }"
            class="link name-link">
            {{ entry.title }}
          </router-link><br>
          <div class="badge">{{ entry.key }}</div>
        </div>
        <div class="col-2 justify-end">
          <ChildrenButton
            :id="entry.id"
            :length="(entry.items ? entry.items.length : 0)"
            :visible-children="visibleChildren">
          </ChildrenButton>
        </div>
        <div class="col-4 justify-end">
          <ItemMeta
            :entry="entry"
            :user="entry.creator" />
        </div>
        <div class="col-1">
          <CircleDropdown>
            <li>
              <router-link
                :to="{ name: 'navigation-items-new', params: { menuId: entry.id } }">
                {{ $t('menus.new-item') }}
              </router-link>
            </li>
            <li>
              <router-link
                :to="{ name: 'navigation-edit', params: { menuId: entry.id } }">
                {{ $t('menus.edit-menu') }}
              </router-link>
            </li>

            <li>
              <button
                type="button"
                @click="duplicateMenu(entry)">
                {{ $t('menus.duplicate-menu') }}
              </button>
            </li>

            <li>
              <button
                type="button"
                @click="deleteEntry(entry.id)">
                {{ $t('menus.delete-menu') }}
              </button>
            </li>
          </CircleDropdown>
        </div>
      </template>
      <template v-slot:children="{ entry }">
        <template v-if="visibleChildren.includes(entry.id)">
          <ContentList
            v-if="entry.items.length"
            :level="2"
            :entries="entry.items"
            :sortable="true"
            :status="true"
            :sort-parent="entry.id"
            sequence-handle="item-sequence-handle"
            @sort="sortItems($event, entry.id)">
            <template v-slot:row="{ entry: item }">
              <div class="col-1">
                <div class="circle">
                </div>
              </div>
              <div class="col-6 subtitle">
                <div class="arrow">↳</div>
                <div class="flex-v">
                  <router-link
                    :to="{ name: 'navigation-items-edit', params: { menuItemId: item.id } }">
                    {{ item.title || 'Ingen tittel' }}
                  </router-link>
                  <div class="keys">
                    <div class="badge">{{ item.key }}</div>
                  </div>
                </div>
              </div>
              <div class="col-3 justify-end">
                <div class="badge">{{ $t('menus.item') }}</div>
              </div>
              <div class="col-4 justify-end">
                <ItemMeta
                  :entry="item"
                  :user="item.creator" />
              </div>
              <div class="col-1">
                <CircleDropdown>
                  <li>
                    <router-link
                      :to="{ name: 'navigation-items-edit', params: { menuItemId: item.id } }">
                      {{ $t('menus.edit-item') }}
                    </router-link>
                  </li>
                  <li>
                    <button
                      type="button"
                      @click="duplicateItem(item)">
                      {{ $t('menus.duplicate-item') }}
                    </button>
                  </li>

                  <li>
                    <button @click="deleteItem(item)">{{ $t('menus.delete-item') }}</button>
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
import GET_MENUS from '../../gql/navigation/MENUS_QUERY.graphql'
import locale from '../../locales/menus'

export default {
  data () {
    return {
      visibleChildren: [],
      queryVars: {
        filter: null,
        offset: 0,
        limit: 50,
        status: 'all'
      }
    }
  },

  inject: ['adminChannel'],

  methods: {
    sortMenus (seq) {
      this.adminChannel.channel
        .push('menus:sequence_menus', { ids: seq })
        .receive('ok', payload => {
          this.$toast.success({ message: this.$t('menus.sequence-updated') })
        })
    },

    sortItems (seq, menuId) {
      this.adminChannel.channel
        .push('menu_items:sequence_items', { ids: seq })
        .receive('ok', payload => {
          this.$toast.success({ message: this.$t('menus.sequence-updated') })
        })
    },

    async duplicateMenu (menu) {
      try {
        await this.$apollo.mutate({
          mutation: gql`
            mutation DuplicateMenu($menuId: ID!) {
              duplicateMenu(menuId: $menuId) {
                id
              }
            }
          `,
          variables: {
            menuId: menu.id
          },

          update: (store, { data: { duplicateMenu } }) => {
            this.$apollo.queries.menus.refresh()
          }
        })

        this.$toast.success({ message: this.$t('menus.menu-duplicated') })
      } catch (err) {
        this.$utils.showError(err)
      }
    },

    async duplicateItem (item) {
      try {
        await this.$apollo.mutate({
          mutation: gql`
            mutation DuplicateItem($itemId: ID!) {
              duplicateItem(itemId: $itemId) {
                id
              }
            }
          `,
          variables: {
            itemId: item.id
          },

          update: (store, { data: { duplicateItem } }) => {
            this.$apollo.queries.menus.refresh()
          }
        })

        this.$toast.success({ message: this.$t('menus.item-duplicated') })
      } catch (err) {
        this.$utils.showError(err)
      }
    },

    async deleteItem (item) {
      this.$alerts.alertConfirm(
        'OBS',
        this.$t('menus.are-you-sure-you-want-to-delete-this-item'),
        async confirm => {
          if (!confirm) {
            return false
          } else {
            try {
              await this.$apollo.mutate({
                mutation: gql`
                  mutation DeleteMenuFragment($menuFragmentId: ID!) {
                    deleteMenuFragment(menuFragmentId: $menuFragmentId) {
                      id
                    }
                  }
                `,
                variables: {
                  menuFragmentId: item.id
                },

                update: (store, { data: { deleteMenuFragment } }) => {
                  this.$apollo.queries.menus.refresh()
                }
              })

              this.$toast.success({
                message: this.$t('menus.item-deleted')
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
              mutation DeleteMenu($menuId: ID!) {
                deleteMenu(menuId: $menuId) {
                  id
                }
              }
            `,
            variables: {
              menuId: entryId
            },

            update: (store, { data: { deleteMenu } }) => {
              this.$apollo.queries.menus.refresh()
            }
          })

          this.$toast.success({ message: this.$t('menus.menu-deleted') })
        } catch (err) {
          this.$utils.showError(err)
        }
      }

      if (override) {
        fn()
      } else {
        this.$alerts.alertConfirm('OBS', this.$t('menus.delete-confirm'), async confirm => {
          if (!confirm) {
            return false
          } else {
            fn()
          }
        })
      }
    },

    deleteEntries (entries, clearSelection) {
      this.$alerts.alertConfirm('OBS', this.$t('menus.delete-confirm-many'), async data => {
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
    menus: {
      query: GET_MENUS,
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
