import type { NewLostBed, Premises, Room } from '@approved-premises/api'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import LocationHeaderComponent from '../../../components/locationHeader'
import LostBedEditablePage from './lostBedEditable'

export default class LostBedNewPage extends LostBedEditablePage {
  private readonly locationHeaderComponent: LocationHeaderComponent

  constructor(premises: Premises, room: Room) {
    super('Void a bedspace', premises, room)

    this.locationHeaderComponent = new LocationHeaderComponent({ premises, room })
  }

  static visit(premises: Premises, room: Room): LostBedNewPage {
    cy.visit(paths.lostBeds.new({ premisesId: premises.id, roomId: room.id }))
    return new LostBedNewPage(premises, room)
  }

  shouldShowBedspaceDetails(): void {
    this.locationHeaderComponent.shouldShowLocationDetails(true)
  }

  completeForm(newLostBed: NewLostBed): void {
    super.completeEditableForm(newLostBed)
  }
}
