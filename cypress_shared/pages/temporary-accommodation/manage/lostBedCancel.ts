import type { Cas3Bedspace, Cas3Premises, Cas3VoidBedspace, Cas3VoidBedspaceCancellation } from '@approved-premises/api'

import Page from '../../page'
import LocationHeaderComponent from '../../../components/locationHeader'
import paths from '../../../../server/paths/temporary-accommodation/manage'

export default class LostBedCancelPage extends Page {
  private readonly locationHeaderComponent: LocationHeaderComponent

  constructor(
    private readonly premises: Cas3Premises,
    private readonly bedspace: Cas3Bedspace,
    private readonly lostBed: Cas3VoidBedspace,
  ) {
    super('Cancel void booking')

    this.locationHeaderComponent = new LocationHeaderComponent({ premises })
  }

  static visit(premises: Cas3Premises, bedspace: Cas3Bedspace, lostBed: Cas3VoidBedspace): LostBedCancelPage {
    cy.visit(
      paths.lostBeds.cancellations.new({ premisesId: premises.id, bedspaceId: bedspace.id, lostBedId: lostBed.id }),
    )
    return new LostBedCancelPage(premises, bedspace, lostBed)
  }

  shouldShowBedspaceDetails(): void {
    this.locationHeaderComponent.shouldShowLocationDetails()
  }

  clearForm(): void {
    super.getTextInputByIdAndClear('cancellationNotes')
  }

  completeForm(cancelLostBed: Cas3VoidBedspaceCancellation): void {
    super.getTextInputByIdAndClear('cancellationNotes')
    this.getLabel('Notes')
    this.getTextInputByIdAndEnterDetails('cancellationNotes', cancelLostBed.cancellationNotes)

    this.clickSubmit()
  }
}
