<template>
  <article>
    <ContentHeader>
      <template v-slot:title>
        Filbibliotek
      </template>
      <template v-slot:subtitle>
      </template>
      <template v-slot:help>
      </template>
    </ContentHeader>
    <slot></slot>
    <article>
      <h2>
        Inget filbibliotek for denne nettsiden
      </h2>
    </article>
  </article>
</template>

<script>

export default {
}

</script>
