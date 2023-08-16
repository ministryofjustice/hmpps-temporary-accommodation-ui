import { BedSearchResults, Premises, Room } from '../../server/@types/shared'
import { PlaceContext } from '../../server/@types/ui'
import {
  bedSearchParametersFactory,
  bedSearchResultFactory,
  bedSearchResultsFactory,
} from '../../server/testutils/factories'
import AssessmentShowPage from '../pages/assess/show'
import Page from '../pages/page'
import BedspaceSearchPage from '../pages/temporary-accommodation/manage/bedspaceSearch'

export default class PlaceHelper {
  private readonly bedSearchResults: BedSearchResults

  constructor(
    private readonly placeContext: PlaceContext,
    private readonly premises: Premises,
    private readonly room: Room,
  ) {
    this.bedSearchResults = bedSearchResultsFactory.build({
      results: [bedSearchResultFactory.forBedspace(this.premises, this.room).build()],
    })
  }

  setupStubs() {
    cy.task('stubBedspaceSearchReferenceData')
    cy.task('stubFindAssessment', this.placeContext.assessment)
    cy.task('stubBedSearch', this.bedSearchResults)
  }

  startPlace() {
    AssessmentShowPage.visit(this.placeContext.assessment)
  }

  progressPlace() {
    this.assessmentToBedspaceSearch()
    this.bedspaceSearchToSearchResults()
  }

  private assessmentToBedspaceSearch() {
    // Given I am viewing a ready to place assessment
    const assessmentShowPage = Page.verifyOnPage(AssessmentShowPage, this.placeContext.assessment)

    // When I click "Place referral"
    assessmentShowPage.clickAction('Place referral')

    // I am taken to the bedspace search page
    const bedspaceSearchPage = Page.verifyOnPage(BedspaceSearchPage)

    // And the place context header is visible
    bedspaceSearchPage.shouldShowPlaceContextHeader(this.placeContext)

    // And the start date is prefilled
    bedspaceSearchPage.shouldShowPrefilledStartDate(this.placeContext.assessment.application.arrivalDate)
  }

  private bedspaceSearchToSearchResults() {
    // Given I am viewing the bedspace search page
    const bedspaceSearchPage = Page.verifyOnPage(BedspaceSearchPage)

    // When I fill out the form
    const searchParameters = bedSearchParametersFactory.build()
    bedspaceSearchPage.completeForm(searchParameters)
    bedspaceSearchPage.clickSubmit()

    // I am taken to the search results page
    const resultsBedspaceSearchPage = Page.verifyOnPage(BedspaceSearchPage, this.bedSearchResults)

    // And the place context header is visible
    resultsBedspaceSearchPage.shouldShowPlaceContextHeader(this.placeContext)
  }
}
