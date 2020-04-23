<template>
  <header class="navigation-header">
    <div
      class="logo"
      :style="$app.logoStyle"
      v-html="$app.logo" />
  </header>
</template>

<script>

import GET_IDENTITY from '../../gql/identity/IDENTITY_QUERY.graphql'

export default {
  apollo: {
    identity: {
      query: GET_IDENTITY
    }
  }
}
</script>

<style lang="postcss">
  .navigation-header {
    @space margin-bottom sm;
    display: flex;
    flex-direction: column;
    align-items: center;

    .logo {
      max-height: 200px;
      width: 100%;
      height: 200px;
      display: flex;
      justify-content: center;

      svg {
        display: block;
        width: auto;
        height: 100%;
        width: 100%;
      }
    }
  }
</style>
