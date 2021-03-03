<template>
  <article v-if="user">
    <ContentHeader>
      <template #title>
        {{ $t('profile.title') }}
      </template>
      <template #subtitle>
        {{ $t('profile.helpText') }}
      </template>
    </ContentHeader>
    <KForm
      :back="{ name: 'users' }"
      @save="save">
      <section class="row">
        <div class="half">
          <KInput
            v-model="user.name"
            :label="$t('user.name')"
            :help-text="$t('user.name.help')"
            rules="required"
            placeholder="Navn Navnesen"
            name="user[name]" />
          <KInputEmail
            v-model="user.email"
            :label="$t('user.email')"
            :help-text="$t('user.email.help')"
            rules="required|email"
            placeholder="min@epost.no"
            name="user[email]" />
          <KInputRadios
            v-model="user.role"
            rules="required"
            :label="$t('user.role')"
            :options="[
              { name: $t('role.super'), value: 'superuser' },
              { name: $t('role.admin'), value: 'admin' },
              { name: $t('role.editor'), value: 'editor' },
              { name: $t('role.user'), value: 'user' },
            ]"
            name="user[role]" />
          <KInputRadios
            v-model="user.language"
            rules="required"
            :options="[
              { name: 'English', value: 'en' },
              { name: 'Norsk', value: 'no' }
            ]"
            name="user[language]"
            :label="$t('user.language')" />
          <KInputPassword
            v-model="user.password"
            :label="$t('user.password')"
            :placeholder="$t('user.password')"
            rules="min:6|confirmed:user[passwordConfirm]"
            name="user[password]" />
          <KInputPassword
            v-model="user.passwordConfirm"
            :label="$t('user.passwordConfirm')"
            :placeholder="$t('user.passwordConfirm')"
            name="user[passwordConfirm]" />
        </div>
        <div class="half">
          <KInputImage
            v-model="user.avatar"
            preview-key="xlarge"
            :label="$t('user.avatar')"
            :help-text="$t('user.avatar.help')"
            name="user[avatar]" />
        </div>
      </section>
    </KForm>
  </article>
</template>

<script>
import gql from 'graphql-tag'
import GET_ME from '../../gql/users/ME_QUERY.graphql'
import GET_USER from '../../gql/users/USER_QUERY.graphql'

export default {
  data () {
    return {
    }
  },

  methods: {
    async save () {
      const userParams = this.$utils.stripParams(this.user, ['__typename', 'passwordConfirm', 'id', 'active', 'lastLogin', 'deletedAt'])
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

        this.$toast.success({ message: 'Profil oppdatert' })
      } catch (err) {
        this.$utils.showError(err)
      }
    }
  },

  apollo: {
    me: GET_ME,

    user: {
      query: GET_USER,
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

</style>
<i18n>
{
  "en": {
    "user.language": "Language",
    "user.password": "Password",
    "user.passwordConfirm": "Confirm password",
    "user.avatar": "Avatar",
    "user.avatar.help": "Click to set focal point.",
    "user.email": "Email",
    "user.email.help": "used for login and notifications",
    "user.name": "Name",
    "user.name.help": "name also used as entry author",
    "user.role": "Role",
    "profile.title": "Your User Profile",
    "profile.helpText": "Administrate user info",
    "role.super": "Super",
    "role.admin": "Admin",
    "role.editor": "Editor",
    "role.user": "User"
  },
  "no": {
    "user.language": "Språk",
    "user.password": "Passord",
    "user.passwordConfirm": "Bekreft passord",
    "user.avatar": "Profilbilde",
    "user.avatar.help": "Klikk på bildet for å sette fokuspunkt.",
    "user.email": "Epost",
    "user.email.help": "brukes til innlogging og notifikasjoner",
    "user.name": "Navn",
    "user.name.help": "navnet brukes også som artikkelforfatter",
    "user.role": "Rolle",
    "profile.title": "Din brukerprofil",
    "profile.helpText": "Administrasjon av brukerinfo",
    "role.super": "Super",
    "role.admin": "Admin",
    "role.editor": "Redaktør",
    "role.user": "Bruker"
  }
}
</i18n>
