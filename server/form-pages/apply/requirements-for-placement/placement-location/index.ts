/* istanbul ignore file */

import { Task } from '../../../utils/decorators'
import AlternativePdu from './alternativePdu'
import AlternativePduReason from './alternativePduReason'

@Task({
  name: 'Placement location',
  actionText: 'Confirm placement location',
  slug: 'placement-location',
  pages: [AlternativePdu, AlternativePduReason],
})
export default class PlacementLocation {}
