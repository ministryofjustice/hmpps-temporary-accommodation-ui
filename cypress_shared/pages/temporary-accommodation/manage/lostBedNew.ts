import type { NewLostBed, Premises, Room } from '@approved-premises/api'
import LostBedEditablePage from './lostBedEditable'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import LocationHeaderComponent from '../../../components/locationHeader'

export default class LostBedNewPage extends LostBedEditablePage {
  private readonly locationHeaderComponent: LocationHeaderComponent

  constructor(private readonly premises: Premises, private readonly room: Room) {
    super('Void a bedspace')

    this.locationHeaderComponent = new LocationHeaderComponent({ premises, room })
  }

  static visit(premises: Premises, room: Room): LostBedNewPage {
    cy.visit(paths.lostBeds.new({ premisesId: premises.id, roomId: room.id }))
    return new LostBedNewPage(premises, room)
  }

  shouldShowBedspaceDetails(): void {
    this.locationHeaderComponent.shouldShowLocationDetails()
  }

  completeForm(newLostBed: NewLostBed): void {
    super.completeEditableForm(newLostBed)
  }
}
