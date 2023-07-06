/* istanbul ignore file */

import { Task } from '../../../utils/decorators'
import ApprovalsForSpecificRisks from './approvalsForSpecificRisks'

@Task({
  name: 'Approvals for specific risks',
  actionText: 'Enter approvals for specific risks',
  slug: 'approvals-for-specific-risks',
  pages: [ApprovalsForSpecificRisks],
})
export default class ApprovalsForSpecificRisksTask {}
