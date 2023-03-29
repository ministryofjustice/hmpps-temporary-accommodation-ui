import { BedSearchResult } from '../../server/@types/shared'
import Component from './component'

export default class BedspaceSearchResult extends Component {
  constructor(private readonly result: BedSearchResult) {
    super()
  }

  shouldShowResult(checkCount = true): void {
    cy.get('div[data-cy-result]')
      .contains(this.result.room.name)
      .parents('div[data-cy-result]')
      .within(() => {
        this.shouldShowKeyAndValue('Address', `${this.result.premises.addressLine1}, ${this.result.premises.postcode}`)

        if (checkCount) {
          this.shouldShowKeyAndValue('Bedspaces in property', `${this.result.premises.bedCount}`)
        }
      })
  }
}
