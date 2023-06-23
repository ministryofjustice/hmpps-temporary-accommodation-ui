/* istanbul ignore file */

import { Task } from '../../../utils/decorators'
import ReferralHistoryDetails from './referralHistoryDetails'
import ReferralsPreviouslySubmitted from './referralsPreviouslySubmitted'

@Task({
  name: 'Accommodation referral history',
  actionText: 'Provide accommodation referral history',
  slug: 'accommodation-referral-history',
  pages: [ReferralsPreviouslySubmitted, ReferralHistoryDetails],
})
export default class AccommodationReferralHistory {}
