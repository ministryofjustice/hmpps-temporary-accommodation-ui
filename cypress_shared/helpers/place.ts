import {
  AssessmentSummary,
  BedSearchResults,
  Booking,
  Person,
  TemporaryAccommodationPremises as Premises,
  Room,
} from '../../server/@types/shared'
import { PlaceContext } from '../../server/@types/ui'
import {
  assessmentSummaryFactory,
  bedSearchParametersFactory,
  bedSearchResultFactory,
  bedSearchResultsFactory,
  bookingFactory,
  newBookingFactory,
} from '../../server/testutils/factories'
import AssessmentSummaryPage from '../pages/assess/summary'
import Page from '../pages/page'
import BedspaceSearchPage from '../pages/temporary-accommodation/manage/bedspaceSearch'
import BedspaceShowPage from '../pages/temporary-accommodation/manage/bedspaceShow'
import BookingNewPage from '../pages/temporary-accommodation/manage/bookingNew'
import BookingSelectAssessmentPage from '../pages/temporary-accommodation/manage/bookingSelectAssessment'

export default class PlaceHelper {
  private readonly bedSearchResults: BedSearchResults

  private readonly person: Person

  private readonly booking: Booking

  private readonly assessmentSummaries: Array<AssessmentSummary>

  constructor(
    private readonly placeContext: NonNullable<PlaceContext>,
    private readonly premises: Premises,
    private readonly room: Room,
  ) {
    this.bedSearchResults = bedSearchResultsFactory.build({
      results: [bedSearchResultFactory.forBedspace(this.premises, this.room).build()],
    })
    this.person = this.placeContext.assessment.application.person
    this.booking = bookingFactory.build({
      person: this.person,
    })
    this.assessmentSummaries = [
      assessmentSummaryFactory.build({
        ...this.placeContext.assessment,
        person: this.person,
      }),
      ...assessmentSummaryFactory.buildList(5),
    ]
  }

  setupStubs() {
    cy.task('stubFindAssessment', this.placeContext.assessment)
    cy.task('stubBedspaceSearchReferenceData')
    cy.task('stubBedSearch', this.bedSearchResults)
    cy.task('stubSinglePremises', this.premises)
    cy.task('stubSingleRoom', { premisesId: this.premises.id, room: this.room })
    cy.task('stubFindPerson', { person: this.person })
    cy.task('stubAssessments', this.assessmentSummaries)
  }

  startPlace() {
    AssessmentSummaryPage.visit(this.placeContext.assessment)
  }

  progressPlace() {
    this.assessmentToBedspaceSearch()
    this.bedspaceSearchToSearchResults()
    this.searchResultsToBedspace()
    this.bedspaceToNewBooking()
    this.newBookingToSelectAssessment()
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

  private bedspaceToNewBooking() {
    // Given I am viewing the bedspace show page
    const bedspaceShowPage = Page.verifyOnPage(BedspaceShowPage, this.premises, this.room)

    // And I click "Book bedspace"
    bedspaceShowPage.clickBookBedspaceLink()

    // I am taken to the new booking page
    const bookingNewPage = Page.verifyOnPage(BookingNewPage, this.premises, this.room)

    // And the place context banner is visible
    bookingNewPage.shouldShowPlaceContextHeader(this.placeContext)

    // And the CRN and arrival date are prefilled
    bookingNewPage.shouldShowPrefilledBookingDetailsFromPlaceContext(this.placeContext)
  }

  private newBookingToSelectAssessment() {
    // Given I am viewing the new booking page
    const bookingNewPage = Page.verifyOnPage(BookingNewPage, this.premises, this.room)

    // When I fill out the form
    const newBooking = newBookingFactory.build({
      crn: this.person.crn,
    })
    bookingNewPage.completeForm(newBooking)

    // I am taken to the select assessment page
    const selectAssessmentPage = Page.verifyOnPage(BookingSelectAssessmentPage, this.assessmentSummaries)

    // And the place context header is visible
    selectAssessmentPage.shouldShowPlaceContextHeader(this.placeContext)
  }
}
