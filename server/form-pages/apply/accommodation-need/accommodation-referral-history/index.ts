/* istanbul ignore file */

import { Task } from '../../../utils/decorators'
import ReferralHistoryDetails from './referralHistoryDetails'
import ReferralsPreviouslySubmitted from './referralsPreviouslySubmitted'

@Task({
  name: 'Behaviour in previous accommodation',
  actionText: 'Provide details of behaviour in previous accommodation',
  slug: 'accommodation-referral-history',
  pages: [ReferralsPreviouslySubmitted, ReferralHistoryDetails],
})
export default class AccommodationReferralHistory {}
