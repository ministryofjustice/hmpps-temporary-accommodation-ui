/* istanbul ignore file */

import { Task } from '../../../utils/decorators'
import AccommodationSharing from './accommodationSharing'
import Cooperation from './cooperation'

@Task({
  name: 'Placement considerations',
  actionText: 'Enter placement considerations',
  slug: 'placement-considerations',
  pages: [AccommodationSharing, Cooperation],
})
export default class PlacementConsiderations {}
