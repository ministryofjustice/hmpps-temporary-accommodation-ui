import type { LostBed, Premises, Room } from '@approved-premises/api'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import Page from '../../page'
import LostBedInfoComponent from '../../../components/lostBedInfo'
import LocationHeaderComponent from '../../../components/locationHeader'

export default class LostBedShowPage extends Page {
  private readonly lostBedInfoComponent: LostBedInfoComponent

  private readonly locationHeaderComponent: LocationHeaderComponent

  constructor(private readonly premises: Premises, private readonly room: Room, private readonly lostBed: LostBed) {
    super('Void booking')

    this.lostBedInfoComponent = new LostBedInfoComponent(lostBed)
    this.locationHeaderComponent = new LocationHeaderComponent({ premises, room })
  }

  static visit(premises: Premises, room: Room, lostBed: LostBed): LostBedShowPage {
    cy.visit(paths.lostBeds.show({ premisesId: premises.id, roomId: room.id, lostBedId: lostBed.id }))
    return new LostBedShowPage(premises, room, lostBed)
  }

  shouldShowLostBedDetails(): void {
    this.locationHeaderComponent.shouldShowLocationDetails()

    this.lostBedInfoComponent.shouldShowLostBedDetails()
  }

  clickEditVoidLink(): void {
    cy.get('.moj-page-header-actions').within(() => {
      cy.get('button').contains('Actions').click()
      cy.get('a').contains('Edit this void').click()
    })
  }

  clickCancelVoidLink(): void {
    cy.get('.moj-page-header-actions').within(() => {
      cy.get('button').contains('Actions').click()
      cy.get('a').contains('Cancel this void').click()
    })
  }
}
