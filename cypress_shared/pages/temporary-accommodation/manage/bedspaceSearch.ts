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
  private readonly bedspaceSearchResults: Map<string, BedspaceSearchResult>

  constructor(results?: BedSearchResults) {
    super(results ? 'Bedspace search results' : 'Search for available bedspaces')

    this.bedspaceSearchResults = new Map<string, BedspaceSearchResult>()

    results?.results.forEach(result => {
      this.bedspaceSearchResults.set(
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
      cy.get('h1').should('contain', `(${this.bedspaceSearchResults.size})`)
    }

    this.bedspaceSearchResults.forEach(result => result.shouldShowResult(checkCount))
  }

  shouldShowEmptySearchResults() {
    cy.get('h2').should('contain', 'There are no available bedspaces')
  }

  shouldShowPrefilledSearchParameters(searchParameters: BedSearchParameters) {
    this.shouldShowDateInputsByLegend('Available from', searchParameters.startDate)
    this.shouldShowTextInputByLabel('Number of days required', `${searchParameters.durationDays}`)
    this.shouldShowSelectInputByLabel('Probation Delivery Unit (PDU)', searchParameters.probationDeliveryUnit)
  }

  shouldShowPrefilledSearchParametersFromPlaceContext(placeContext: NonNullable<PlaceContext>) {
    this.shouldShowDateInputsByLegend('Available from', placeContext.assessment.accommodationRequiredFromDate)
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
    this.bedspaceSearchResults.get(`${room.id}`)!.clickOverlapLink(crn)
  }

  clickClearFilters() {
    cy.get('a').contains('Clear filters').click()
  }

  shouldShowDefaultSearchParameters() {
    this.shouldShowEmptyDateInputs('startDate')
    this.shouldShowTextInputByLabel('Number of days required', '84')
    this.shouldShowSelectInputByLabel('Probation Delivery Unit (PDU)', 'Select a PDU')
  }
}
