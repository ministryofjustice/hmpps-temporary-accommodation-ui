import type {
  TemporaryAccommodationLostBed as LostBed,
  NewLostBedCancellation,
  Premises,
  Room,
} from '@approved-premises/api'

import Page from '../../page'
import LocationHeaderComponent from '../../../components/locationHeader'
import paths from '../../../../server/paths/temporary-accommodation/manage'

export default class LostBedCancelPage extends Page {
  private readonly locationHeaderComponent: LocationHeaderComponent

  constructor(private readonly premises: Premises, private readonly room: Room, private readonly lostBed: LostBed) {
    super('Cancel void booking')

    this.locationHeaderComponent = new LocationHeaderComponent({ premises, room })
  }

  static visit(premises: Premises, room: Room, lostBed: LostBed): LostBedCancelPage {
    cy.visit(paths.lostBeds.cancellations.new({ premisesId: premises.id, roomId: room.id, lostBedId: lostBed.id }))
    return new LostBedCancelPage(premises, room, lostBed)
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
