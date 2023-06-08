/* istanbul ignore file */

import { Task } from '../../../utils/decorators'
import CrsDetails from './crsDetails'
import CrsSubmitted from './crsSubmitted'
import DtrDetails from './dtrDetails'
import DtrSubmitted from './dtrSubmitted'
import OtherAccommodationOptions from './otherAccommodationOptions'

@Task({
  name: 'Accommodation referral details',
  actionText: 'Enter accommodation referral details',
  slug: 'accommodation-referral-details',
  pages: [DtrSubmitted, DtrDetails, CrsSubmitted, CrsDetails, OtherAccommodationOptions],
})
export default class AccommodationReferralDetails {}
