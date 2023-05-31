import { Section } from '../../utils/decorators'
import ContactDetails from './contact-details'
import SentenceInformation from './sentence-information'

@Section({ title: 'Accommodation need', tasks: [SentenceInformation, ContactDetails] })
export default class AccommodationNeed {}
