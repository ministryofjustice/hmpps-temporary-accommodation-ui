import { Premises, Room } from '../../server/@types/shared'
import Component from './component'

export default class LocationHeaderComponent extends Component {
  constructor(
    private readonly details: { premises?: Premises; room?: Room },
    private readonly hideAddress: boolean = false,
  ) {
    super()
  }

  shouldShowLocationDetails(): void {
    const { premises } = this.details

    cy.get('.location-header').within(() => {
      if (premises && !this.hideAddress) {
        cy.get('h2')
          .contains('Property address')
          .siblings('p')
          .should('contain', premises.addressLine1)
          .should('contain', premises.postcode)
      } else {
        cy.contains('Property address').should('not.exist')
      }
    })
  }
}
