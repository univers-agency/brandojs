import { Ability } from '@casl/ability'
import subjectTypeFromGraphql from './subjectTypeFromGraphql'

export default new Ability([], { subjectName: subjectTypeFromGraphql })
