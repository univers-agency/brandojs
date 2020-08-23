<template>
  <article v-if="user">
    <ContentHeader>
      <template v-slot:title>
        Brukere
      </template>
      <template v-slot:subtitle>
        Nytt passord
      </template>
    </ContentHeader>
    <div class="notice">
      Vi anbefaler deg å sette ditt eget, sikre passord ved første innlogging.
    </div>
    <UserPasswordForm
      :user="user"
      :save="save" />
  </article>
</template>

<script>

import gql from 'graphql-tag'
import UserPasswordForm from './UserPasswordForm'
import GET_ME from '../../gql/users/ME_QUERY.graphql'
import GET_USER from '../../gql/users/USER_QUERY.graphql'

export default {
  components: {
    UserPasswordForm
  },

  data () {
    return {
    }
  },

  methods: {
    async save (setLoader) {
      setLoader(true)

      const userParams = this.$utils.stripParams(this.user, ['__typename', 'passwordConfirm', 'id', 'active', 'deletedAt', 'lastLogin'])
      this.$utils.validateImageParams(userParams, ['avatar'])

      if (userParams.config) {
        delete userParams.config.__typename
      }

      try {
        await this.$apollo.mutate({
          mutation: gql`
            mutation UpdateUser($userId: ID!, $userParams: UserParams) {
              updateUser(
                userId: $userId,
                userParams: $userParams
              ) {
                id
              }
            }
          `,
          variables: {
            userParams,
            userId: this.me.id
          }
        })

        setLoader(false)
        this.$toast.success({ message: 'Passord oppdatert' })
        this.$router.push({ name: 'users' })
      } catch (err) {
        this.$utils.showError(err)
        setLoader(false)
      }
    }
  },

  apollo: {
    me: GET_ME,

    user: {
      query: GET_USER,
      fetchPolicy: 'no-cache',
      variables () {
        return {
          userId: this.me.id
        }
      },

      skip () {
        return !this.me
      }
    }
  }
}
</script>

<style>
  .notice {
    margin-bottom: 2rem;
  }
</style>
