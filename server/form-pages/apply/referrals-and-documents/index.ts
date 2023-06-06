import { Section } from '../../utils/decorators'
import AccommodationReferralDetails from './accommodation-referral-details'
import AttachDocumentsTask from './attach-documents'

@Section({ title: 'Required referrals and documents', tasks: [AccommodationReferralDetails, AttachDocumentsTask] })
export default class ReferralsAndDocuments {}
