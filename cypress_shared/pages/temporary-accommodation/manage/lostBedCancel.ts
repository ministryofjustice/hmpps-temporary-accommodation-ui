import type { Cas3Bedspace, Cas3Premises, LostBed, NewLostBedCancellation } from '@approved-premises/api'

import Page from '../../page'
import LocationHeaderComponent from '../../../components/locationHeader'
import paths from '../../../../server/paths/temporary-accommodation/manage'

export default class LostBedCancelPage extends Page {
  private readonly locationHeaderComponent: LocationHeaderComponent

  constructor(
    private readonly premises: Cas3Premises,
    private readonly bedspace: Cas3Bedspace,
    private readonly lostBed: LostBed,
  ) {
    super('Cancel void booking')

    this.locationHeaderComponent = new LocationHeaderComponent({ premises })
  }

  static visit(premises: Cas3Premises, bedspace: Cas3Bedspace, lostBed: LostBed): LostBedCancelPage {
    cy.visit(
      paths.lostBeds.cancellations.new({ premisesId: premises.id, bedspaceId: bedspace.id, lostBedId: lostBed.id }),
    )
    return new LostBedCancelPage(premises, bedspace, lostBed)
  }

  shouldShowBedspaceDetails(): void {
    this.locationHeaderComponent.shouldShowLocationDetails()
  }

  clearForm(): void {
    super.getTextInputByIdAndClear('notes')
  }

  completeForm(cancelLostBed: NewLostBedCancellation): void {
    super.getTextInputByIdAndClear('notes')
    this.getLabel('Notes')
    this.getTextInputByIdAndEnterDetails('notes', cancelLostBed.notes)

    this.clickSubmit()
  }
}
