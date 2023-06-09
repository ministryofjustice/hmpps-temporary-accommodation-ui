import { TemporaryAccommodationApplication as Application } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'

import ContactDetails from '../../contactDetails'

export default class ProbationPractitioner extends ContactDetails {
  constructor(application: Application) {
    super(
      'Probation practitioner details',
      application,
      'contact-details',
      'probation-practitioner',
      paths.applications.show({ id: application.id }),
    )
  }
}
