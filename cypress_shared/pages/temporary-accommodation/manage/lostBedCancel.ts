import type { Cas3Bedspace, LostBed, NewLostBedCancellation, Premises, Room } from '@approved-premises/api'

import Page from '../../page'
import LocationHeaderComponent from '../../../components/locationHeader'
import paths from '../../../../server/paths/temporary-accommodation/manage'

export default class LostBedCancelPage extends Page {
  private readonly locationHeaderComponent: LocationHeaderComponent

  constructor(
    private readonly premises: Premises,
    private readonly room: Room,
    private readonly bedspace: Cas3Bedspace,
    private readonly lostBed: LostBed,
  ) {
    super('Cancel void booking')

    this.locationHeaderComponent = new LocationHeaderComponent({ premises, room })
  }

  static visit(premises: Premises, room: Room, bedspace: Cas3Bedspace, lostBed: LostBed): LostBedCancelPage {
    if (room) {
      cy.visit(
        paths.lostBeds.cancellations.new({ premisesId: premises.id, bedspaceId: room.id, lostBedId: lostBed.id }),
      )
    } else {
      cy.visit(
        paths.lostBeds.cancellations.new({ premisesId: premises.id, bedspaceId: bedspace.id, lostBedId: lostBed.id }),
      )
    }
    return new LostBedCancelPage(premises, room, bedspace, lostBed)
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
