<template>
  <article v-if="user">
    <ContentHeader>
      <template v-slot:title>
        {{ $t('user.title') }}
      </template>
      <template v-slot:subtitle>
        {{ $t('user.subtitle') }}
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

export default {
  components: {
    UserForm
  },

  data () {
    return {
      user: {
        language: 'no',
        config: {
          resetPasswordOnFirstLogin: true,
          showMutationNotifications: true
        }
      }
    }
  },

  methods: {
    async save () {
      const userParams = this.$utils.stripParams(this.user, ['__typename', 'passwordConfirm', 'id', 'lastLogin', 'deletedAt'])
      this.$utils.validateImageParams(userParams, ['avatar'])

      if (userParams.config) {
        delete userParams.config.__typename
      }

      try {
        await this.$apollo.mutate({
          mutation: gql`
            mutation CreateUser($userParams: UserParams) {
              createUser(
                userParams: $userParams
              ) {
                id
              }
            }
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

<i18n>
{
  "en": {
    "user.title": "Users",
    "user.subtitle": "New user"
  },
  "no": {
    "user.title": "Brukere",
    "user.subtitle": "Ny bruker"
  }
}
</i18n>
