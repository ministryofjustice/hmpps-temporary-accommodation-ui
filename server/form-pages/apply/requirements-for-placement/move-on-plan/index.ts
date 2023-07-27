/* istanbul ignore file */

import { Task } from '../../../utils/decorators'
import MoveOnPlan from './moveOnPlan'

@Task({
  name: 'Move on plan',
  actionText: 'Outline move on plan',
  slug: 'move-on-plan',
  pages: [MoveOnPlan],
})
export default class MoveOnPlanTask {}
