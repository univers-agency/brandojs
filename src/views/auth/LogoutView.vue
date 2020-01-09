<template>
  <div>Logging out</div>
</template>

<script>

import { onLogout } from '../../vue-apollo'

export default {
  async mounted () {
    await onLogout(this.$apolloProvider.defaultClient)
    this.$root.ready = false
    this.$router.push('login')
  }
}
</script>

<style>

</style>
