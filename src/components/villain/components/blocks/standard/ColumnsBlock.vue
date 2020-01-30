<template>
  <Block
    :block="block"
    :parent="null"
    :config="showConfig"
    @add="$emit('add', $event)"
    @move="$emit('move', $event)"
    @delete="$emit('delete', $event)">
    <!-- parse each block inside columns -->
    <div class="row">
      <div
        v-for="col in block.data"
        :key="col.uid"
        :class="col.class">
        <div v-if="col.data.length">
          <div class="villain-block-container">
            <div class="villain-block-wrapper">
              <VillainPlus
                :parent="col.uid"
                @add="$emit('add', $event)"
                @move="$emit('move', $event)" />
            </div>
          </div>
          <transition-group name="bounce">
            <div
              v-for="b in col.data"
              :key="b.uid"
              class="villain-block-container">
              <component
                :is="b.type + 'Block'"
                :block="b"
                :parent="col.uid"
                :after="b.uid"
                @add="$emit('add', $event)"
                @move="$emit('move', $event)"
                @delete="$emit('delete', $event)" />
            </div>
          </transition-group>
        </div>
        <div v-else>
          <div class="villain-block-container">
            <div class="villain-block-wrapper">
              <VillainPlus
                :parent="col.uid"
                @add="$emit('add', $event)"
                @move="$emit('move', $event)" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <template slot="config">
      <div class="form-group">
        <label>Antall kolonner</label>
        <input
          v-model="columnCount"
          class="form-control"
          type="input">
        <button
          type="button"
          class="btn btn-primary mt-2"
          @click="updateColumns">
          Sett kolonneantall (overskriver nåværende kolonner!)
        </button>
        <template v-if="block.data.length">
          <label class="mt-4">Kolonne CSS-klasser (avansert)</label>
          <input
            v-for="(b, idx) in block.data"
            :key="b.uid"
            v-model="b.class"
            :class="idx > 0 ? 'mt-2' : ''"
            class="form-control"
            type="input">
        </template>
        <div class="text-center mt-3">
        </div>
      </div>
    </template>
  </Block>
</template>

<script>
import systemComponents from '../system'
import standardComponents from '.'

export default {
  name: 'ColumnsBlock',

  components: {
    ...systemComponents,
    ...standardComponents
  },

  props: {
    block: {
      type: Object,
      default: () => {}
    },

    parent: {
      type: String,
      default: null
    }
  },

  data () {
    return {
      columnCount: 2,
      showConfig: false,
      uid: null
    }
  },

  created () {
    console.debug('<ColumnsBlock /> created')
    if (!this.block.data.length) {
      this.showConfig = true
    }
  },

  methods: {
    updateColumns () {
      let colClass
      this.block.data = []

      switch (parseInt(this.columnCount)) {
        case 1:
          colClass = 'col-md-12'
          break
        case 2:
          colClass = 'col-md-6'
          break
        case 3:
          colClass = 'col-md-4'
          break
        case 4:
          colClass = 'col-md-3'
          break
      }

      for (let i = 0; i < this.columnCount; i++) {
        this.addColumn(colClass)
      }

      this.showConfig = false
    },

    addColumn (colClass) {
      this.block.data.push({
        uid: this.createUID(),
        class: colClass,
        data: []
      })
    },

    createUID () {
      return (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase()
    }
  }
}
</script>
