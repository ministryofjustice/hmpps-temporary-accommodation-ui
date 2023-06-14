/* istanbul ignore file */

import { Task } from '../../../utils/decorators'
import FoodAllergies from './foodAllergies'
import PropertySharing from './propertySharing'

@Task({
  name: 'Requirements for placement',
  actionText: 'Provide requirements for placement',
  slug: 'requirements-for-placement',
  pages: [PropertySharing, FoodAllergies],
})
export default class RequirementsForPlacement {}
