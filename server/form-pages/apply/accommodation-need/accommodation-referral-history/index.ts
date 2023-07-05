/* istanbul ignore file */

import { Task } from '../../../utils/decorators'
import PreviousStaysDetails from './referralHistoryDetails'
import PreviousStays from './referralsPreviouslySubmitted'

@Task({
  name: 'Behaviour in previous accommodation',
  actionText: 'Provide details of behaviour in previous accommodation',
  slug: 'behaviour-in-previous-accommodation',
  pages: [PreviousStays, PreviousStaysDetails],
})
export default class BehaviourInPreviousAccommodation {}
