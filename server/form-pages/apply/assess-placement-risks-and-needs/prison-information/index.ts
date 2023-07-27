/* istanbul ignore file */
import { Task } from '../../../utils/decorators'
import AcctAlerts from './acctAlerts'

import Adjudications from './adjudications'

@Task({
  slug: 'prison-information',
  name: 'Prison information',
  actionText: 'Review prison information',
  pages: [Adjudications, AcctAlerts],
})
export default class PrisonInformation {}
