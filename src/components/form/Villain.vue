<template>
  <div
    v-if="token"
    class="villain-component">
    <KFieldBase
      :name="name"
      :label="label"
      :rules="rules"
      :helpText="helpText"
      :value="value">
      <template v-slot>
        <VillainEditor
          ref="villain"
          v-model="innerValue"
          :templates="templates"
          :template-mode="templateMode"
          :json="innerValue"
          :visible-blocks="visibleBlocks"
          :extra-headers="{'authorization': `Bearer ${token}`}" />
      </template>
    </KFieldBase>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import VillainEditor from '../villain/components/VillainEditor'

export default {
  components: {
    VillainEditor
  },

  props: {
    hasError: {
      type: Boolean,
      default: false
    },

    helpText: {
      type: String,
      default: null
    },

    errorText: {
      type: String,
      default: ''
    },

    label: {
      type: String,
      required: false,
      default: ''
    },

    imageSeries: {
      type: String,
      default: 'post'
    },

    value: {
      type: [String, Array],
      default: null
    },

    name: {
      type: String,
      required: true
    },

    templateMode: {
      type: Boolean,
      default: false
    },

    templates: {
      type: String,
      default: 'all'
    },

    rules: {
      type: String,
      default: null
    },

    visibleBlocks: {
      type: Array,
      default: () => []
    }
  },

  computed: {
    id () {
      return this.name.replace('[', '_').replace(']', '_')
    },

    innerValue: {
      get () { return this.value },
      set (innerValue) {
        this.$emit('input', innerValue)
      }
    }
  },

  created () {
    this.innerValue = this.value
  },

  methods: {
    input (e) {
      this.innerValue = e
      this.$emit('input', e)
    }
  },

  apollo: {
    token: gql`
      query getToken {
        token @client
      }
    `
  }
}
</script>
<style lang="postcss">
  .villain-editor {
    .villain-image-table {
      width: 100%;

      table {
        width: 100%;
      }
    }

    .villain-image-library table.villain-image-table td img {
      max-width: 80px;
    }

    .villain-image-library.row {
      flex-wrap: wrap !important;
      .col-12 {
        width: 100%;
      }
    }

    .villain-config-content-buttons {
      button + button {
        margin-top: -1px;
      }
    }

    .villain-block-help-content {
      h5 {
        @fontsize lg;
        margin-bottom: 30px;
      }

      p {
        margin-bottom: 15px !important;
      }

      code {
        @fontsize base(0.8);
      }
    }

    .villain-help-content-buttons {
      margin-top: 30px !important;
    }

    label {
      display: inline-block;
    }

    input, textarea {
      display: block;
      width: 100%;
    }

    select {
      min-width: 50%;
      padding: 12px 15px 12px;
      margin-bottom: 15px;
      display: block;
    }
  }

</style>
