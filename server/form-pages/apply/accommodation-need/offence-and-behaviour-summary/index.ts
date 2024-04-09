/* istanbul ignore file */

import { Task } from '../../../utils/decorators'
import SexualOffenceConviction from './sexualOffenceConviction'
import RegisteredSexOffender from './registeredSexOffender'
import SexualBehaviourConcerns from './sexualBehaviourConcerns'

@Task({
  name: 'Offence and behaviour summary',
  actionText: 'Add offence and behaviour summary',
  slug: 'offence-and-behaviour-summary',
  pages: [SexualOffenceConviction, RegisteredSexOffender, SexualBehaviourConcerns],
})
export default class OffenceAndBehaviourSummary {}
