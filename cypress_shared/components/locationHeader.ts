import { Cas3Bedspace, Premises } from '../../server/@types/shared'
import Component from './component'

export default class LocationHeaderComponent extends Component {
  constructor(
    private readonly details: { premises?: Premises; bedspace?: Cas3Bedspace },
    private readonly hideAddress: boolean = false,
  ) {
    super()
  }

  shouldShowLocationDetails(showBedspaceId: boolean = false): void {
    const { premises, bedspace } = this.details

    cy.get('.location-header').within(() => {
      if (premises && !this.hideAddress) {
        if (showBedspaceId) {
          cy.get('h2').contains('Property address').siblings('p').should('contain', bedspace.reference)
        }
        cy.get('h2')
          .contains('Property address')
          .siblings('p')
          .should('contain', premises.addressLine1)
          .should('contain', premises.town)
          .should('contain', premises.postcode)
      } else {
        cy.contains('Property address').should('not.exist')
      }
    })
  }
}
