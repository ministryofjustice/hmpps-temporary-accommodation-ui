import { Premises, Room } from '../../server/@types/shared'
import Component from './component'

export default class LocationHeaderComponent extends Component {
  constructor(
    private readonly details: { premises?: Premises; room?: Room; crn?: string },
    private readonly hideAddress: boolean = false,
  ) {
    super()
  }

  shouldShowLocationDetails(): void {
    const { premises, room, crn } = this.details

    cy.get('.location-header').within(() => {
      if (room) {
        cy.get('h2').contains('Bedspace reference').siblings('p').should('contain', room.name)
      } else {
        cy.contains('Bedspace reference').should('not.exist')
      }

      if (premises) {
        cy.get('h2').contains('Property reference').siblings('p').should('contain', premises.name)
      } else {
        cy.contains('Property reference').should('not.exist')
      }

      if (premises && !this.hideAddress) {
        cy.get('h2')
          .contains('Property address')
          .siblings('p')
          .should('contain', premises.addressLine1)
          .should('contain', premises.postcode)
      } else {
        cy.contains('Property address').should('not.exist')
      }

      if (crn) {
        cy.get('p').should('contain', `CRN: ${crn}`)
      } else {
        cy.contains(`CRN: ${crn}`).should('not.exist')
      }
    })
  }
}
