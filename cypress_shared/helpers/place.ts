import { BedSearchResults, TemporaryAccommodationPremises as Premises, Room } from '../../server/@types/shared'
import { PlaceContext } from '../../server/@types/ui'
import {
  bedSearchParametersFactory,
  bedSearchResultFactory,
  bedSearchResultsFactory,
} from '../../server/testutils/factories'
import AssessmentSummaryPage from '../pages/assess/summary'
import Page from '../pages/page'
import BedspaceSearchPage from '../pages/temporary-accommodation/manage/bedspaceSearch'
import BedspaceShowPage from '../pages/temporary-accommodation/manage/bedspaceShow'

export default class PlaceHelper {
  private readonly bedSearchResults: BedSearchResults

  constructor(
    private readonly placeContext: NonNullable<PlaceContext>,
    private readonly premises: Premises,
    private readonly room: Room,
  ) {
    this.bedSearchResults = bedSearchResultsFactory.build({
      results: [bedSearchResultFactory.forBedspace(this.premises, this.room).build()],
    })
  }

  setupStubs() {
    cy.task('stubFindAssessment', this.placeContext.assessment)
    cy.task('stubBedspaceSearchReferenceData')
    cy.task('stubBedSearch', this.bedSearchResults)
    cy.task('stubSinglePremises', this.premises)
    cy.task('stubSingleRoom', { premisesId: this.premises.id, room: this.room })
  }

  startPlace() {
    AssessmentSummaryPage.visit(this.placeContext.assessment)
  }

  progressPlace() {
    this.assessmentToBedspaceSearch()
    this.bedspaceSearchToSearchResults()
    this.searchResultsToBedspace()
  }

  private assessmentToBedspaceSearch() {
    // Given I am viewing a ready to place assessment
    const assessmentSummaryPage = Page.verifyOnPage(AssessmentSummaryPage, this.placeContext.assessment)

    // When I click "Place referral"
    assessmentSummaryPage.clickAction('Place referral')

    // I am taken to the bedspace search page
    const bedspaceSearchPage = Page.verifyOnPage(BedspaceSearchPage)

    // And the place context header is visible
    bedspaceSearchPage.shouldShowPlaceContextHeader(this.placeContext)

    // And the start date is prefilled
    bedspaceSearchPage.shouldShowPrefilledSearchParametersFromPlaceContext(this.placeContext)
  }

  private bedspaceSearchToSearchResults() {
    // Given I am viewing the bedspace search page
    const bedspaceSearchPage = Page.verifyOnPage(BedspaceSearchPage)

    // When I fill out the form
    const searchParameters = bedSearchParametersFactory.build({
      startDate: this.placeContext.arrivalDate,
    })
    bedspaceSearchPage.completeForm(searchParameters)
    bedspaceSearchPage.clickSubmit()

    // I am taken to the search results page
    const resultsBedspaceSearchPage = Page.verifyOnPage(BedspaceSearchPage, this.bedSearchResults)

    // And the place context header is visible
    resultsBedspaceSearchPage.shouldShowPlaceContextHeader(this.placeContext)
  }

  private searchResultsToBedspace() {
    // Given I am viewing bedspace search results
    const resultsBedspaceSearchPage = Page.verifyOnPage(BedspaceSearchPage, this.bedSearchResults)

    // When I click a bedspace
    resultsBedspaceSearchPage.clickBedspaceLink(this.room)

    // I am taken to the bedspace show page
    const bedspaceShowPage = Page.verifyOnPage(BedspaceShowPage, this.premises, this.room)

    // And the place context header is visible
    bedspaceShowPage.shouldShowPlaceContextHeader(this.placeContext)
  }
}