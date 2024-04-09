/* istanbul ignore file */

import { Task } from '../../../utils/decorators'
import SexualOffenceConviction from './sexualOffenceConviction'
import RegisteredSexOffender from './registeredSexOffender'

@Task({
  name: 'Offence and behaviour summary',
  actionText: 'Add offence and behaviour summary',
  slug: 'offence-and-behaviour-summary',
  pages: [SexualOffenceConviction, RegisteredSexOffender],
})
export default class OffenceAndBehaviourSummary {}
