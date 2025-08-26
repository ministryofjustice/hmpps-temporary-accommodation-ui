import type { LostBed, Premises, Room } from '@approved-premises/api'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import Page from '../../page'
import LostBedInfoComponent from '../../../components/lostBedInfo'
import LocationHeaderComponent from '../../../components/locationHeader'
import { Cas3Bedspace } from '../../../../server/@types/shared'

export default class LostBedShowPage extends Page {
  private readonly lostBedInfoComponent: LostBedInfoComponent

  private readonly locationHeaderComponent: LocationHeaderComponent

  constructor(
    private readonly premises: Premises,
    private readonly room: Room,
    private readonly bedspace: Cas3Bedspace,
    private readonly lostBed: LostBed,
  ) {
    super('Void booking')

    this.lostBedInfoComponent = new LostBedInfoComponent(lostBed)
    this.locationHeaderComponent = new LocationHeaderComponent({ premises, room, bedspace })
  }

  static visit(premises: Premises, room: Room, bedspace: Cas3Bedspace, lostBed: LostBed): LostBedShowPage {
    if (room) {
      cy.visit(paths.lostBeds.show({ premisesId: premises.id, roomId: room.id, lostBedId: lostBed.id }))
    } else {
      cy.visit(paths.lostBeds.show({ premisesId: premises.id, bedspaceId: bedspace.id, lostBedId: lostBed.id }))
    }
    return new LostBedShowPage(premises, room, bedspace, lostBed)
  }

  shouldShowLostBedDetails(): void {
    this.locationHeaderComponent.shouldShowLocationDetails()

    this.lostBedInfoComponent.shouldShowLostBedDetails()
  }

  clickEditVoidLink(): void {
    cy.get('.moj-cas-page-header-actions').within(() => {
      cy.get('.moj-button-menu').contains('Actions').click()
      cy.get('a').contains('Edit this void').click()
    })
  }

  clickCancelVoidLink(): void {
    cy.get('.moj-cas-page-header-actions').within(() => {
      cy.get('.moj-button-menu').contains('Actions').click()
      cy.get('a').contains('Cancel this void').click()
    })
  }
}
