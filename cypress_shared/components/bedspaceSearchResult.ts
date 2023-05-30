import { BedSearchResult } from '../../server/@types/shared'
import Component from './component'

export default class BedspaceSearchResult extends Component {
  constructor(private readonly result: BedSearchResult) {
    super()
  }

  shouldShowResult(checkCount = true): void {
    cy.get('table')
      .contains(this.result.room.name)
      .parent()
      .within(() => {
        cy.get('td').eq(0).should('contain', this.result.room.name)
        cy.get('td').eq(1).should('contain', `${this.result.premises.addressLine1}, ${this.result.premises.postcode}`)
        if (checkCount) {
          cy.get('td').eq(2).should('contain', this.result.premises.bedCount)
        }
      })
  }
}
