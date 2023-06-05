/* istanbul ignore file */

import { Task } from '../../../utils/decorators'
import AccommodationRequiredFromDate from './accommodationRequiredFromDate'
import EligibilityReason from './eligibilityReason'
import ReleaseDate from './releaseDate'

@Task({
  name: 'Eligibility',
  actionText: 'Confirm eligibility',
  slug: 'eligibility',
  pages: [EligibilityReason, ReleaseDate, AccommodationRequiredFromDate],
})
export default class Eligibility {}
