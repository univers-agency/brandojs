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
import USER_FRAGMENT from '../../gql/users/USER_FRAGMENT.graphql'

export default {
  components: {
    UserForm
  },

  data () {
    return {
      user: {
        language: 'no'
      }
    }
  },

  fragments: {
    user: USER_FRAGMENT
  },

  methods: {
    async save () {
      const userParams = this.$utils.stripParams(this.user, ['__typename', 'password_confirm', 'id', 'deletedAt'])
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
          }
        })

        this.$toast.success({ message: 'Bruker opprettet' })
        this.$router.push({ name: 'users' })
      } catch (err) {
        this.$utils.showError(err)
      }
    }
  }
}
</script>

<style>

</style>
