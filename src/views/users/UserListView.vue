<template>
  <div class="user-list">
    <ContentHeader>
      <template #title>
        Brukere
      </template>
      <template #subtitle>
        Administrasjon av brukere.
      </template>
      <template #help>
        <div class="float-right">
          <ButtonPrimary
            :to="{ name: 'users-new' }">
            + Ny bruker
          </ButtonPrimary>
        </div>
      </template>
    </ContentHeader>

    <ContentList
      v-if="users"
      :selectable="false"
      :tools="false"
      :entries="users">
      <template v-slot:header>
        <div class="col-2"></div>
        <div class="col-10">Info</div>
        <div class="col-3">Rolle</div>
        <div class="col-1"></div>
      </template>
      <template v-slot:row="{ entry }">
        <div class="col-2">
          <div class="thumb">
            <img :src="entry.avatar ? entry.avatar.thumb : '/images/admin/avatar.png'" />
          </div>
        </div>
        <div class="col-10">
          <router-link
            v-if="$can('manage', entry)"
            :to="{ name: 'users-edit', params: { userId: entry.id } }"
            class="link name-link"
            :class="{ inactive: !entry.active }">
            {{ entry.full_name }}
          </router-link>
          <span v-else>
            {{ entry.full_name }}
          </span>
          <br>
          {{ entry.email }}
        </div>
        <div class="col-3">
          <div class="badge">
            {{ entry.role }}
          </div>
        </div>
        <div class="col-1">
          <CircleDropdown v-if="$can('manage', entry)">
            <li>
              <router-link
                :to="{ name: 'users-edit', params: { userId: entry.id } }">
                Editér bruker
              </router-link>
              <button
                v-if="entry.active"
                @click="toggleActive(entry, false)">
                Deaktiver bruker
              </button>
              <button
                v-else
                @click="toggleActive(entry, true)">
                Aktiver bruker
              </button>
            </li>
          </CircleDropdown>
        </div>
      </template>
    </ContentList>
  </div>
</template>

<script>

import gql from 'graphql-tag'
import GET_USERS from '../../gql/users/USERS_QUERY.graphql'

export default {
  data () {
    return {
    }
  },

  methods: {
    async toggleActive (user, active) {
      const userParams = { active }
      try {
        await this.$apollo.mutate({
          mutation: gql`
            mutation UpdateUser($userId: ID!, $userParams: UpdateUserParams) {
              updateUser(
                userId: $userId,
                userParams: $userParams
              ) {
                id
                active
              }
            }
          `,
          variables: {
            userParams,
            userId: user.id
          }
        })

        this.$toast.success({ message: `Bruker ${active ? 'aktivert' : 'deaktivert'}` })
      } catch (err) {
        this.$utils.showError(err)
      }
    }
  },

  apollo: {
    users: {
      query: GET_USERS
    }
  }
}
</script>

<style lang="postcss" scoped>
  .name-link {
    &.inactive {
      text-decoration: line-through;
      opacity: 0.6;
    }
  }
</style>
