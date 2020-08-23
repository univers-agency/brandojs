<template>
  <KForm
    :back="{ name: 'users' }"
    @save="save">
    <section class="row">
      <div class="half">
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
