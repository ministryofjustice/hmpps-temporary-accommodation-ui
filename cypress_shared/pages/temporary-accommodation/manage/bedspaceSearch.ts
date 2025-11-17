import { Cas3Bedspace, Cas3v2BedspaceSearchResults } from '@approved-premises/api'
import { BedspaceSearchFormParameters, PlaceContext } from '@approved-premises/ui'

import paths from '../../../../server/paths/temporary-accommodation/manage'
import BedspaceSearchResult from '../../../components/bedspaceSearchResult'
import Page from '../../page'
import { addPlaceContext } from '../../../../server/utils/placeUtils'

export default class BedspaceSearchPage extends Page {
  private readonly bedspaceSearchResults: Map<string, BedspaceSearchResult>

  constructor(results?: Cas3v2BedspaceSearchResults) {
    super('Search for available bedspaces')

    this.bedspaceSearchResults = new Map<string, BedspaceSearchResult>()

    results?.results.forEach(result => {
      this.bedspaceSearchResults.set(`${result.bedspace.id}`, new BedspaceSearchResult(result))
    })
  }

  static visit(placeContext?: PlaceContext): BedspaceSearchPage {
    cy.visit(addPlaceContext(paths.bedspaces.search({}), placeContext))
    return new BedspaceSearchPage()
  }

  shouldShowSearchResults(checkCount = true) {
    if (checkCount) {
      cy.get('h2').should('contain', `${this.bedspaceSearchResults.size} results for your bedspace search`)
    }

    this.bedspaceSearchResults.forEach(result => result.shouldShowResult(checkCount))
  }

  shouldShowEmptySearchResults() {
    cy.get('h2').should('contain', 'There are no available bedspaces')
  }

  shouldShowPrefilledSearchParameters(searchParameters: BedspaceSearchFormParameters) {
    this.shouldShowDateInputsByLegend('Available from', searchParameters.startDate)
    this.shouldShowTextInputByLabel('Number of days required', `${searchParameters.durationDays}`)
    searchParameters.probationDeliveryUnits.forEach(pduId => {
      this.shouldShowCheckedInputByValue(pduId)
    })
  }

  shouldShowPrefilledSearchParametersFromPlaceContext(placeContext: NonNullable<PlaceContext>) {
    this.shouldShowDateInputsByLegend('Available from', placeContext.assessment.accommodationRequiredFromDate)
  }

  completeForm(searchParameters: BedspaceSearchFormParameters) {
    this.completeDateInputsByLegend('Available from', searchParameters.startDate)
    this.completeTextInputByLabel('Number of days required', `${searchParameters.durationDays}`)

    searchParameters.probationDeliveryUnits.forEach(pdu => {
      this.checkCheckboxByNameAndValue('probationDeliveryUnits[]', pdu)
    })

    this.getLegend('Property attributes')
    this.getLegend('Occupancy')
    if (typeof searchParameters.occupancyAttribute !== 'undefined') {
      this.checkRadioByNameAndValue('occupancyAttribute', searchParameters.occupancyAttribute)
    }

    this.getLegend('Suitable for a person with sexual risk (optional)')
    if (typeof searchParameters.sexualRiskAttributes !== 'undefined') {
      searchParameters.sexualRiskAttributes.forEach(attribute => {
        this.checkCheckboxByNameAndValue('sexualRiskAttributes[]', attribute)
      })
    }

    this.getLegend('Bedspace attributes')
    this.getLegend('Accessibility (optional)')
    if (typeof searchParameters.accessibilityAttributes !== 'undefined') {
      searchParameters.accessibilityAttributes.forEach(attribute => {
        this.checkCheckboxByNameAndValue('accessibilityAttributes[]', attribute)
      })
    }
  }

  clickBedspaceLink(bedspace: Cas3Bedspace) {
    cy.get('a').contains(bedspace.reference).click()
  }

  clickOverlapLink(bedspace: Cas3Bedspace, crn: string) {
    this.bedspaceSearchResults.get(`${bedspace.id}`)!.clickOverlapLink(crn)
  }

  clickClearFilters() {
    cy.get('a').contains('Clear filters').click()
  }

  shouldShowDefaultSearchParameters(placeContext?: PlaceContext) {
    if (placeContext) {
      this.shouldShowDateInputs('startDate', placeContext.assessment.accommodationRequiredFromDate)
    } else {
      this.shouldShowEmptyDateInputs('startDate')
    }
    this.shouldShowTextInputByLabel('Number of days required', '84')
  }
}
