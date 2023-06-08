/* istanbul ignore file */

import { Task } from '../../../utils/decorators'
import FoodAllergies from './foodAllergies'
import RoomSharing from './roomSharing'

@Task({
  name: 'Requirements for placement',
  actionText: 'Provide requirements for placement',
  slug: 'requirements-for-placement',
  pages: [RoomSharing, FoodAllergies],
})
export default class RequirementsForPlacement {}
