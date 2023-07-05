/* istanbul ignore file */

import { Task } from '../../../utils/decorators'
import PreviousStays from './previousStays'
import PreviousStaysDetails from './previousStaysDetails'

@Task({
  name: 'Behaviour in previous accommodation',
  actionText: 'Provide details of behaviour in previous accommodation',
  slug: 'behaviour-in-previous-accommodation',
  pages: [PreviousStays, PreviousStaysDetails],
})
export default class BehaviourInPreviousAccommodation {}
