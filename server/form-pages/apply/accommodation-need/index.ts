import { Section } from '../../utils/decorators'
import Consent from './consent'
import ContactDetails from './contact-details'
import Eligibility from './eligibility'
import SentenceInformation from './sentence-information'
import OffenceAndBehaviourSummary from './offence-and-behaviour-summary'
import PlacementLocation from './placement-location'

@Section({
  title: 'Accommodation need',
  tasks: [PlacementLocation, OffenceAndBehaviourSummary, SentenceInformation, ContactDetails, Eligibility, Consent],
})
export default class AccommodationNeed {}
