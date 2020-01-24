<template>
  <router-link
    v-if="to"
    :class="{ loading }"
    :to="to">
    <template v-if="loading">
      <svg
        preserveAspectRatio="xMidYMid meet"
        viewBox="0 0 120 30"
        xmlns="http://www.w3.org/2000/svg"
        fill="#FCF5F3">
        <circle
          cx="15"
          cy="15"
          r="15">
          <animate
            attributeName="r"
            from="15"
            to="15"
            begin="0s"
            dur="0.8s"
            values="15;9;15"
            calcMode="linear"
            repeatCount="indefinite" />
          <animate
            attributeName="fill-opacity"
            from="1"
            to="1"
            begin="0s"
            dur="0.8s"
            values="1;.5;1"
            calcMode="linear"
            repeatCount="indefinite" />
        </circle>
        <circle
          cx="60"
          cy="15"
          r="9"
          fill-opacity="0.3">
          <animate
            attributeName="r"
            from="9"
            to="9"
            begin="0s"
            dur="0.8s"
            values="9;15;9"
            calcMode="linear"
            repeatCount="indefinite" />
          <animate
            attributeName="fill-opacity"
            from="0.5"
            to="0.5"
            begin="0s"
            dur="0.8s"
            values=".5;1;.5"
            calcMode="linear"
            repeatCount="indefinite" />
        </circle>
        <circle
          cx="105"
          cy="15"
          r="15">
          <animate
            attributeName="r"
            from="15"
            to="15"
            begin="0s"
            dur="0.8s"
            values="15;9;15"
            calcMode="linear"
            repeatCount="indefinite" />
          <animate
            attributeName="fill-opacity"
            from="1"
            to="1"
            begin="0s"
            dur="0.8s"
            values="1;.5;1"
            calcMode="linear"
            repeatCount="indefinite" />
        </circle>
      </svg>
    </template>
    <template v-else>
      <slot></slot>
    </template>
  </router-link>
  <button
    v-else
    type="button"
    :class="{ dark, loading }"
    @click.prevent="$emit('click')">
    <template v-if="loading">
      <svg
        preserveAspectRatio="xMidYMid meet"
        viewBox="0 0 120 30"
        xmlns="http://www.w3.org/2000/svg"
        fill="#FCF5F3">
        <circle
          cx="15"
          cy="15"
          r="15">
          <animate
            attributeName="r"
            from="15"
            to="15"
            begin="0s"
            dur="0.8s"
            values="15;9;15"
            calcMode="linear"
            repeatCount="indefinite" />
          <animate
            attributeName="fill-opacity"
            from="1"
            to="1"
            begin="0s"
            dur="0.8s"
            values="1;.5;1"
            calcMode="linear"
            repeatCount="indefinite" />
        </circle>
        <circle
          cx="60"
          cy="15"
          r="9"
          fill-opacity="0.3">
          <animate
            attributeName="r"
            from="9"
            to="9"
            begin="0s"
            dur="0.8s"
            values="9;15;9"
            calcMode="linear"
            repeatCount="indefinite" />
          <animate
            attributeName="fill-opacity"
            from="0.5"
            to="0.5"
            begin="0s"
            dur="0.8s"
            values=".5;1;.5"
            calcMode="linear"
            repeatCount="indefinite" />
        </circle>
        <circle
          cx="105"
          cy="15"
          r="15">
          <animate
            attributeName="r"
            from="15"
            to="15"
            begin="0s"
            dur="0.8s"
            values="15;9;15"
            calcMode="linear"
            repeatCount="indefinite" />
          <animate
            attributeName="fill-opacity"
            from="1"
            to="1"
            begin="0s"
            dur="0.8s"
            values="1;.5;1"
            calcMode="linear"
            repeatCount="indefinite" />
        </circle>
      </svg>
    </template>
    <template v-else>
      <slot></slot>
    </template>
  </button>
</template>

<script>
export default {
  props: {
    loading: {
      type: Boolean,
      default: false
    },

    to: {
      type: [Object, Boolean]
    },

    dark: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="postcss" scoped>
  a {
    padding-top: 11px;
    display: inline-block;
    font-weight: 300;
  }

  button {
    padding-top: 5px;
  }

  button, a {
    color: theme(colors.peach);
    border: 1px solid theme(colors.blue);
    background-color: theme(colors.blue);
    height: 60px;
    border-radius: 30px;
    padding-bottom: 6px;
    padding-left: 25px;
    padding-right: 25px;
    min-width: 205px;
    text-align: center;
    transition: background-color 0.25s ease, border-color 0.25s ease;

    &.dark {
      background-color: theme(colors.dark);
      border: 1px solid theme(colors.dark);
      color: theme(colors.peach);

      &:hover {
        background-color: black;
        color: theme(colors.peach);
      }
    }

    &.loading {
      background-color: theme(colors.gray);
      border: 1px solid theme(colors.gray);

      svg {
        width: 35%;
        margin: 0 auto;
        margin-top: -5px;
      }
    }

    &:hover {
      background-color: theme(colors.dark);
      border-color: theme(colors.dark);
    }
  }
</style>
