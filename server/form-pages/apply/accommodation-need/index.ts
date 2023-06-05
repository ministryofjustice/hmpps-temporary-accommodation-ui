import { Section } from '../../utils/decorators'
import ContactDetails from './contact-details'
import Eligibility from './eligibility'
import SentenceInformation from './sentence-information'

@Section({ title: 'Accommodation need', tasks: [SentenceInformation, ContactDetails, Eligibility] })
export default class AccommodationNeed {}
