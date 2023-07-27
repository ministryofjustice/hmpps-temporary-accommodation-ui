/* istanbul ignore file */

import { Task } from '../../../utils/decorators'
import AlternativePdu from './alternativePdu'

@Task({
  name: 'Placement location',
  actionText: 'Confirm placement location',
  slug: 'placement-location',
  pages: [AlternativePdu],
})
export default class PlacementLocation {}
