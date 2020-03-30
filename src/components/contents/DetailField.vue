<template>
  <dl>
    <dt>
      {{ label }}
    </dt>
    <dd>
      <slot
        name="actions"
        :field="value"></slot>
      <slot :field="value">
        <template v-if="value">
          {{ value }}
        </template>
        <template v-else>
          {{ fallback }}
        </template>
      </slot>
    </dd>
  </dl>
</template>

<script>
export default {
  props: {
    fallback: {
      type: String,
      default: '—'
    },
    label: String,
    value: [String, Number, Array, Object]
  }
}
</script>

<style lang="postcss" scoped>
  dl {
    margin-bottom: 20px;

    dt {
      @font mono;
      @fontsize sm(0.8);
      margin-bottom: -8px;
      text-transform: uppercase;
    }

    dd {
      @fontsize lg;
      margin-top: 5px;
      .flex-h {
        margin-top: 15px;
      }
    }
  }
</style>
