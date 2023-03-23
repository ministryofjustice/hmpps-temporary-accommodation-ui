import {
  TemporaryAccommodationBedSearchParameters as BedSearchParameters,
  BedSearchResults,
  Room,
} from '../../../../server/@types/shared'

import paths from '../../../../server/paths/temporary-accommodation/manage'
import BedspaceSearchResult from '../../../components/bedspaceSearchResult'
import Page from '../../page'

export default class BedspaceSearchPage extends Page {
  private readonly bedspaceSeachResults: BedspaceSearchResult[] | undefined

  constructor(results?: BedSearchResults) {
    super('List of available bedspaces')

    this.bedspaceSeachResults = results?.results.map(result => new BedspaceSearchResult(result))
  }

  static visit(): BedspaceSearchPage {
    cy.visit(paths.bedspaces.search({}))
    return new BedspaceSearchPage()
  }

  shouldShowSearchResults(checkCount = true) {
    const bedspaceSeachResults = this.bedspaceSeachResults as BedspaceSearchResult[]

    if (checkCount) {
      if (bedspaceSeachResults.length === 1) {
        cy.get('p').should('contain', 'Showing 1 result')
      } else {
        cy.get('p').should('contain', `Showing ${bedspaceSeachResults.length} results`)
      }
    }

    bedspaceSeachResults.forEach(result => result.shouldShowResult(checkCount))
  }

  shouldShowEmptySearchResults() {
    cy.get('p').should('contain', 'No bedspaces found')
  }

  shouldShowPrefilledSearchParameters(searchParameters: BedSearchParameters) {
    this.shouldShowDateInputsByLegend('Available on', searchParameters.startDate)
    this.shouldShowTextInputByLabel('Days available for', `${searchParameters.durationDays}`)
    this.shouldShowSelectInputByLabel('PDU', searchParameters.probationDeliveryUnit)
  }

  completeForm(searchParameters: BedSearchParameters) {
    this.completeDateInputsByLegend('Available on', searchParameters.startDate)
    this.completeTextInputByLabel('Days available for', `${searchParameters.durationDays}`)
    this.completeSelectInputByLabel('PDU', searchParameters.probationDeliveryUnit)
  }

  clickBedspaceLink(room: Room) {
    cy.get('h4').contains(room.name).parent().siblings().contains('View').click()
  }
}
