<template>
  <KForm
    :back="{ name: 'users' }"
    @save="save">
    <section class="row">
      <div class="half">
        <KInput
          v-model="user.name"
          label="Navn"
          helpText="navn som brukes når du er artikkelforfatter"
          rules="required"
          placeholder="Navn Navnesen"
          name="user[name]" />
        <KInputEmail
          v-model="user.email"
          label="Epost"
          helpText="brukes til innlogging og notifikasjoner"
          rules="required|email"
          placeholder="min@epost.no"
          name="user[email]" />
        <KInputRadios
          v-model="user.role"
          rules="required"
          :options="[
            { name: 'Super', value: 'superuser' },
            { name: 'Admin', value: 'admin' },
            { name: 'Redaktør', value: 'editor' },
            { name: 'Bruker', value: 'user' },
          ]"
          name="user[role]"
          label="Rolle" />
        <KInputPassword
          v-model="user.password"
          rules="min:6|confirmed:user[passwordConfirm]"
          name="user[password]"
          label="Passord"
          placeholder="Passord" />
        <KInputPassword
          v-model="user.passwordConfirm"
          name="user[passwordConfirm]"
          label="Bekreft passord"
          placeholder="Bekreft passord" />
      </div>
      <div class="half">
        <KInputImage
          v-model="user.avatar"
          name="user[avatar]"
          preview-key="xlarge"
          label="Profilbilde"
          helpText="Klikk på bildet for å sette fokuspunkt." />
      </div>
    </section>
  </KForm>
</template>

<script>
export default {
  props: {
    user: {
      type: Object,
      default: () => {}
    },

    save: {
      type: Function,
      required: true
    }
  }
}
</script>

<style>

</style>
