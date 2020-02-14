<template>
  <article v-if="user">
    <ContentHeader>
      <template v-slot:title>
        Brukere
      </template>
      <template v-slot:subtitle>
        Ny bruker
      </template>
    </ContentHeader>
    <UserForm
      :user="user"
      :save="save" />
  </article>
</template>

<script>

import gql from 'graphql-tag'
import UserForm from './UserForm'
import GET_USERS from '../../gql/users/USERS_QUERY.graphql'
import USER_FRAGMENT from '../../gql/users/USER_FRAGMENT.graphql'

export default {
  components: {
    UserForm
  },

  data () {
    return {
      user: {
        language: 'nb'
      }
    }
  },

  fragments: {
    user: USER_FRAGMENT
  },

  methods: {
    async save () {
      const userParams = this.$utils.stripParams(this.user, ['__typename', 'password_confirm', 'id', 'active', 'deleted_at'])
      this.$utils.validateImageParams(userParams, ['avatar'])

      try {
        await this.$apollo.mutate({
          mutation: gql`
            mutation CreateUser($userParams: CreateUserParams) {
              createUser(
                userParams: $userParams
              ) {
                ...user
              }
            }
            ${USER_FRAGMENT}
          `,
          variables: {
            userParams
          },
          update: (store, { data: { createUser } }) => {
            try {
              const query = {
                query: GET_USERS
              }
              const data = store.readQuery(query)
              data.users.push(createUser)
              // Write back to the cache
              store.writeQuery({
                ...query,
                data
              })
            } catch (e) {
              console.log(e)
              // ignore errors. usually means it's just not in cache.
            }
          }
        })

        this.$toast.success({ message: 'Bruker opprettet' })
        this.$router.push({ name: 'users' })
      } catch (err) {
        this.$utils.showError(err)
      }
    }
  },

  apollo: {
    me: gql`query Me {
      me {
        id
        full_name
        email
        avatar {
          focal
          thumb: url(size: "xlarge")
        }
        role
        language
        active
      }
    }`
  }
}
</script>

<style>

</style>
