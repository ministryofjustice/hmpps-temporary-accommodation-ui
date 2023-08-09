import { BedSearchResult } from '../../server/@types/shared'
import Component from './component'

export default class BedspaceSearchResult extends Component {
  constructor(private readonly result: BedSearchResult) {
    super()
  }

  shouldShowResult(checkCount = true): void {
    cy.get(`[data-cy-room-id="${this.result.room.id}"]`).within(() => {
      cy.get('h2').should('contain', this.result.room.name)
      if (this.result.premises.town) {
        cy.get('h3').should(
          'contain',
          `${this.result.premises.addressLine1}, ${this.result.premises.town}, ${this.result.premises.postcode}`,
        )
      } else {
        cy.get('h3').should('contain', `${this.result.premises.addressLine1},${this.result.premises.postcode}`)
      }

      this.result.premises.characteristics.forEach(characteristic => {
        cy.get('ul[data-cy-premises-key-characteristics] > li').should('contain', characteristic.name)
      })

      this.result.room.characteristics.forEach(characteristic => {
        cy.get('ul[data-cy-bedspace-key-characteristics] > li').should('contain', characteristic.name)
      })

      if (checkCount) {
        this.shouldShowKeyAndValue('Number of bedspaces', `${this.result.premises.bedCount}`)
      }
    })
  }
}
