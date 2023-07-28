/* istanbul ignore file */

import { Task } from '../../../utils/decorators'
import PreviousStays from './previousStays'
import PreviousStaysDetails from './previousStaysDetails'

@Task({
  name: 'Behaviour in CAS',
  actionText: 'Outline behaviour in CAS',
  slug: 'behaviour-in-cas',
  pages: [PreviousStays, PreviousStaysDetails],
})
export default class BehaviourInCas {}
