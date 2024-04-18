import { Premises, Room } from '../../server/@types/shared'
import Component from './component'

export default class LocationHeaderComponent extends Component {
  constructor(
    private readonly details: { premises?: Premises; room?: Room },
    private readonly hideAddress: boolean = false,
  ) {
    super()
  }

  shouldShowLocationDetails(showBedspaceId: boolean = false): void {
    const { premises } = this.details
    const { room } = this.details

    cy.get('.location-header').within(() => {
      if (premises && !this.hideAddress) {
        if (showBedspaceId) {
          cy.get('h2').contains('Property address').siblings('p').should('contain', room.name)
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
