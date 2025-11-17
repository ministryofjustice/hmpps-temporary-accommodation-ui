import type { Cas3Bedspace, Cas3Premises, Cas3VoidBedspace } from '@approved-premises/api'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import Page from '../../page'
import LostBedInfoComponent from '../../../components/lostBedInfo'
import LocationHeaderComponent from '../../../components/locationHeader'

export default class LostBedShowPage extends Page {
  private readonly lostBedInfoComponent: LostBedInfoComponent

  private readonly locationHeaderComponent: LocationHeaderComponent

  constructor(
    private readonly premises: Cas3Premises,
    private readonly bedspace: Cas3Bedspace,
    private readonly lostBed: Cas3VoidBedspace,
  ) {
    super('Void booking')

    this.lostBedInfoComponent = new LostBedInfoComponent(lostBed)
    this.locationHeaderComponent = new LocationHeaderComponent({ premises, bedspace })
  }

  static visit(premises: Cas3Premises, bedspace: Cas3Bedspace, lostBed: Cas3VoidBedspace): LostBedShowPage {
    cy.visit(paths.lostBeds.show({ premisesId: premises.id, bedspaceId: bedspace.id, lostBedId: lostBed.id }))
    return new LostBedShowPage(premises, bedspace, lostBed)
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
