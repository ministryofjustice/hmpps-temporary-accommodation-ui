import { Section } from '../../utils/decorators'
import AccommodationReferralHistory from './accommodation-referral-history'
import Consent from './consent'
import ContactDetails from './contact-details'
import Eligibility from './eligibility'
import SentenceInformation from './sentence-information'

@Section({
  title: 'Accommodation need',
  tasks: [SentenceInformation, ContactDetails, Eligibility, AccommodationReferralHistory, Consent],
})
export default class AccommodationNeed {}
