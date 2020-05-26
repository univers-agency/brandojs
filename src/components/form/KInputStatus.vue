<template>
  <KFieldBase
    :name="name"
    :label="label"
    :rules="rules"
    :helpText="helpText"
    :value="value">
    <template v-slot>
      <div
        v-if="options.length"
        class="radios-wrapper">
        <div
          v-for="o in options"
          :key="o.value"
          class="form-check">
          <label class="form-check-label">
            <input
              v-model="innerValue"
              :name="name"
              :value="o.value"
              class="form-check-input"
              type="radio">
            <span class="label-text">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 12 12">
                <circle
                  :class="o.value"
                  r="6"
                  cy="6"
                  cx="6" />
              </svg>{{ o.label }}</span>
          </label>
        </div>
      </div>
      <div v-else>
        Ingen tilgjengelige valg
      </div>
    </template>
  </KFieldBase>
</template>

<script>

// import { gsap } from 'gsap'

export default {
  props: {
    disabled: {
      type: Boolean,
      default: false
    },

    helpText: {
      type: String,
      default: null
    },

    label: {
      type: String,
      required: true
    },

    rules: {
      type: String,
      default: null
    },

    name: {
      type: String,
      required: true
    },

    value: {
      type: [String, Number],
      default: ''
    }
  },

  data () {
    return {
      options: [
        { value: 'draft', label: 'Kladd' },
        { value: 'pending', label: 'Venter' },
        { value: 'published', label: 'Publisert' },
        { value: 'disabled', label: 'Deaktivert' }
      ]
    }
  },

  computed: {
    id () {
      return this.name.replace('[', '_').replace(']', '_')
    },

    innerValue: {
      get () { return this.value },
      set (innerValue) { this.$emit('input', innerValue) }
    }
  },

  created () {
    if (this.value) {
      this.innerValue = this.value
    }
  }
}
</script>

<style lang="postcss" scoped>
  .radios-wrapper {
    margin-top: 8px;

    .form-check {
      margin-bottom: 5px;
    }

    input {
      margin-right: 17px;
      margin-top: 2px;
    }

    label {
      display: flex;

      span {
        display: inline-flex;
        align-items: center;
      }
    }
  }

  svg {
    margin-right: 12px;
    circle {
      fill: theme(colors.blue);

      &.draft {
        fill: theme(colors.status.draft);
      }

      &.pending {
        fill: theme(colors.status.pending);
      }

      &.published {
        fill: theme(colors.status.published);
      }

      &.disabled {
        fill: theme(colors.status.disabled);
      }
    }
  }
</style>
