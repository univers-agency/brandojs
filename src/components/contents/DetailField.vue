<template>
  <dl>
    <dt>
      {{ label }}
    </dt>
    <dd>
      <div class="actions">
        <slot
          name="actions"
          :field="value"></slot>
      </div>
      <slot :field="value">
        <template v-if="value">
          {{ value }}
        </template>
        <template v-else>
          <span class="fallback">{{ fallback }}</span>
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
  .actions {
    padding-bottom: 15px;
  }

  dl {
    margin-bottom: 20px;
    background-color: #FCF5F3;
    padding: 0.5rem 1rem 1rem 1rem;

    dt {
      @font mono;
      @fontsize sm(0.8);
      text-transform: uppercase;
      margin-bottom: 3px;
      background-color: #fcf5f4;
      border-bottom: 2px solid;
      display: inline-block;
      padding-bottom: 3px;
    }

    dd {
      @fontsize lg;
      font-weight: 300;
      margin-top: 5px;

      .flex-h {
        margin-top: 15px;
      }

      .fallback {
        opacity: 0.4;
      }

      >>> .list .list-row {
        background-color: transparent;
      }

      >>> .list[data-level="1"] {
        margin-top: 0;
      }
    }
  }
</style>
