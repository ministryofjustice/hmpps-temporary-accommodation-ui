import { Section } from '../../utils/decorators'
import Consent from './consent'
import ContactDetails from './contact-details'
import Eligibility from './eligibility'
import SentenceInformation from './sentence-information'
import OffenceAndBehaviourSummary from './offence-and-behaviour-summary'

@Section({
  title: 'Accommodation need',
  tasks: [OffenceAndBehaviourSummary, SentenceInformation, ContactDetails, Eligibility, Consent],
})
export default class AccommodationNeed {}
