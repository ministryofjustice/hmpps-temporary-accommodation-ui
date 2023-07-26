/* istanbul ignore file */

import { Task } from '../../../utils/decorators'
import FoodAllergies from './foodAllergies'

@Task({
  name: 'Food allergies',
  actionText: 'Provide any food allergies',
  slug: 'food-allergies',
  pages: [FoodAllergies],
})
export default class FoodAllergiesTask {}
