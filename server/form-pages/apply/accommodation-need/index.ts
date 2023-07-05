import { Section } from '../../utils/decorators'
import BehaviourInPreviousAccommodation from './behaviour-in-previous-accommodation'
import Consent from './consent'
import ContactDetails from './contact-details'
import Eligibility from './eligibility'
import SentenceInformation from './sentence-information'

@Section({
  title: 'Accommodation need',
  tasks: [SentenceInformation, ContactDetails, Eligibility, BehaviourInPreviousAccommodation, Consent],
})
export default class AccommodationNeed {}
