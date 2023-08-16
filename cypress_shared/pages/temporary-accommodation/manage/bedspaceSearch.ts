import {
  TemporaryAccommodationBedSearchParameters as BedSearchParameters,
  BedSearchResults,
  Room,
  TemporaryAccommodationBedSearchResult,
} from '../../../../server/@types/shared'
import { PlaceContext } from '../../../../server/@types/ui'

import paths from '../../../../server/paths/temporary-accommodation/manage'
import BedspaceSearchResult from '../../../components/bedspaceSearchResult'
import Page from '../../page'

export default class BedspaceSearchPage extends Page {
  private readonly bedspaceSeachResults: Map<string, BedspaceSearchResult>

  constructor(results?: BedSearchResults) {
    super('Search for available bedspaces')

    this.bedspaceSeachResults = new Map<string, BedspaceSearchResult>()

    results?.results.forEach(result => {
      this.bedspaceSeachResults.set(
        `${result.room.id}`,
        new BedspaceSearchResult(result as TemporaryAccommodationBedSearchResult),
      )
    })
  }

  static visit(): BedspaceSearchPage {
    cy.visit(paths.bedspaces.search({}))
    return new BedspaceSearchPage()
  }

  shouldShowSearchResults(checkCount = true) {
    if (checkCount) {
      if (this.bedspaceSeachResults.size === 1) {
        cy.get('p').should('contain', '1 result')
      } else {
        cy.get('p').should('contain', `${this.bedspaceSeachResults.size} results`)
      }
    }

    this.bedspaceSeachResults.forEach(result => result.shouldShowResult(checkCount))
  }

  shouldShowEmptySearchResults() {
    cy.get('p').should('contain', 'There are no available bedspaces')
  }

  shouldShowPrefilledSearchParameters(searchParameters: BedSearchParameters) {
    this.shouldShowDateInputsByLegend('Available from', searchParameters.startDate)
    this.shouldShowTextInputByLabel('Number of days required', `${searchParameters.durationDays}`)
    this.shouldShowSelectInputByLabel('Probation Delivery Unit (PDU)', searchParameters.probationDeliveryUnit)
  }

  shouldShowPrefilledSearchParametersFromPlaceContext(placeContext: NonNullable<PlaceContext>) {
    this.shouldShowDateInputsByLegend('Available from', placeContext.assessment.application.arrivalDate)
  }

  completeForm(searchParameters: BedSearchParameters) {
    this.completeDateInputsByLegend('Available from', searchParameters.startDate)
    this.completeTextInputByLabel('Number of days required', `${searchParameters.durationDays}`)
    this.completeSelectInputByLabel('Probation Delivery Unit (PDU)', searchParameters.probationDeliveryUnit)
  }

  clickBedspaceLink(room: Room) {
    cy.get('a').contains(room.name).click()
  }

  clickOverlapLink(room: Room, crn: string) {
    this.bedspaceSeachResults.get(`${room.id}`)!.clickOverlapLink(crn)
  }
}
