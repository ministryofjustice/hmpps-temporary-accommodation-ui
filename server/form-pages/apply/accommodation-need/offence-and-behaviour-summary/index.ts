/* istanbul ignore file */

import { Task } from '../../../utils/decorators'
import SexualOffenceConviction from './sexualOffenceConviction'

@Task({
  name: 'Offence and behaviour information',
  actionText: 'Add offence and behaviour summary',
  slug: 'offence-and-behaviour-summary',
  pages: [SexualOffenceConviction],
})
export default class OffenceAndBehaviourSummary {}
