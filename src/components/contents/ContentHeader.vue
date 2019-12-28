<template>
  <transition
    name="fade"
    appear>
    <header id="content-header">
      <div class="content">
        <section class="main">
          <h2>
            <slot name="title">
            </slot>
          </h2>
          <h3>
            <slot name="subtitle">
            </slot>
          </h3>
        </section>
        <section class="help">
          <slot name="help">
          </slot>
        </section>
      </div>
    </header>
  </transition>
</template>

<script>

export default {}

</script>

<style lang="postcss" scoped>
  #content-header {
    @space margin-top sm;
    @space padding-bottom md;
    @space margin-bottom md;
    flex-direction: column;
    border-bottom: 1px solid theme(colors.dark);

    .content {
      @row;
      align-items: flex-end;

      .main {
        @column 8/16;
      }

      .help {
        @column 8/16;
        @fontsize lg;
        font-weight: 200;
      }
    }
  }
</style>
