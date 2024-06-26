/* istanbul ignore file */

import { Task } from '../../../utils/decorators'
import HistoryOfSexualOffence from './historyOfSexualOffence'
import RegisteredSexOffender from './registeredSexOffender'
import ConcerningSexualBehaviour from './concerningSexualBehaviour'
import HistoryOfArsonOffence from './historyOfArsonOffence'
import ConcerningArsonBehaviour from './concerningArsonBehaviour'

@Task({
  name: 'Offence and behaviour summary',
  actionText: 'Add offence and behaviour summary',
  slug: 'offence-and-behaviour-summary',
  pages: [
    HistoryOfSexualOffence,
    RegisteredSexOffender,
    ConcerningSexualBehaviour,
    HistoryOfArsonOffence,
    ConcerningArsonBehaviour,
  ],
})
export default class OffenceAndBehaviourSummary {}
