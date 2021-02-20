/**
 * Revisions mixin
 *
 * import Revisions from 'brandojs/src/mixins/Revisions'
 *
 * export default {
 *   mixins: [
 *     Revisions({
 *       schema: 'Brando.Pages.Page',
 *       id: project.id
 *     })
 *   ],
 *
 * @param {*} param0
 */

import GET_REVISIONS from '../gql/revisions/REVISIONS_QUERY.graphql'

export default function ({ schema, prop, key }) {
  return {
    inject: [
      'adminChannel'
    ],

    data () {
      return {
        revisionMeta: {
          schema,
          prop,
          key
        },
        activeRevision: {},
        revisionSet: false
      }
    },

    methods: {
      selectRevision (revision) {
        this.activeRevision = revision
        this.$parent.queryVars = { ...this.$parent.queryVars, revision: revision.revision }
        this.$parent.$apollo.queries[this.revisionMeta.prop].refresh()
      }
    },

    apollo: {
      revisions: {
        query: GET_REVISIONS,
        fetchPolicy: 'no-cache',
        variables () {
          return {
            filter: { entry_type: schema, entry_id: this[prop][key] }
          }
        },

        skip () {
          if (this.revisionSet) {
            return true
          }
          if (!this[prop]) {
            return true
          }
          if (!this[prop][key]) {
            return true
          }
          return !this[prop][key]
        }
      }
    }
  }
}
