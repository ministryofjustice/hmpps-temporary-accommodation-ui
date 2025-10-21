import type { TemporaryAccommodationApplication as Application, FullPerson } from '@approved-premises/api'
import { ReferenceData } from '@approved-premises/ui'
import paths from '../../../../../server/paths/apply'
import ApplyPage from '../../applyPage'

export default class PduEvidencePage extends ApplyPage {
  application: Application

  constructor(application: Application) {
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

    this.application = application
  }

  shouldHaveCorrectRegionalInformation(stubbedProbationRegions: Array<ReferenceData>) {
    const { pduName } = this.application.data['placement-location']['alternative-pdu']
    const { regionName } = this.application.data['placement-location']['different-region']
    const hptEmail = stubbedProbationRegions.find(region => region.name === regionName)?.hptEmail

    cy.get('ol.govuk-list--number li')
      .eq(0)
      .invoke('text')
      .then(text => {
        expect(text).to.contain(regionName)
        expect(text).to.contain(pduName)
        if (hptEmail) expect(text).to.contain(hptEmail)
      })
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('pduEvidence')
  }
}
