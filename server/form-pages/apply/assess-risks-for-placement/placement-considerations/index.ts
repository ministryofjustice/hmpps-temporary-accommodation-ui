/* istanbul ignore file */

import { Task } from '../../../utils/decorators'
import AccommodationSharing from './accommodationSharing'

@Task({
  name: 'Placement considerations',
  actionText: 'Enter placement considerations',
  slug: 'placement-considerations',
  pages: [AccommodationSharing],
})
export default class PlacementConsiderations {}
