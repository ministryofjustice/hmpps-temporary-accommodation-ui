import type { Application, FullPerson, TemporaryAccommodationApplication } from '@approved-premises/api'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

export default class PduEvidencePage extends ApplyPage {
  application: Application

  constructor(application: TemporaryAccommodationApplication) {
    const pduName = application.data?.['placement-location']?.['placement-pdu'].pduName
    super(
      `Evidence from ${pduName} PDU that they’ll consider a CAS3 bedspace for ${(application.person as FullPerson).name}`,
      application,
      'placement-location',
      'pdu-evidence',
      paths.applications.show({
        id: application.id,
      }),
    )
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('pduEvidence')
  }
}
