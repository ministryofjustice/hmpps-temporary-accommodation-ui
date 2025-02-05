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
  bedSearchApiParametersFactory,
  bedSearchResultFactory,
  bedSearchResultsFactory,
  bookingFactory,
  newBookingFactory,
  timelineEventsFactory,
} from '../../server/testutils/factories'
import type { TimeLineFactory } from '../../server/testutils/factories/timelineEvents'
import AssessmentSummaryPage from '../pages/assess/summary'
import Page from '../pages/page'
import BedspaceSearchPage from '../pages/temporary-accommodation/manage/bedspaceSearch'
import BedspaceShowPage from '../pages/temporary-accommodation/manage/bedspaceShow'
import BookingConfirmPage from '../pages/temporary-accommodation/manage/bookingConfirm'
import BookingNewPage from '../pages/temporary-accommodation/manage/bookingNew'
import BookingSelectAssessmentPage from '../pages/temporary-accommodation/manage/bookingSelectAssessment'
import BookingShowPage from '../pages/temporary-accommodation/manage/bookingShow'
import { characteristicsToSearchAttributes } from '../utils/bedspaceSearch'

export default class PlaceHelper {
  private readonly bedSearchResults: BedSearchResults

  private readonly person: Person

  private readonly booking: Booking

  private readonly assessmentSummaries: Array<AssessmentSummary>

  private readonly timeline: TimeLineFactory

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
    this.timeline = timelineEventsFactory.build()
  }

  setupStubs() {
    cy.task('stubFindAssessment', this.placeContext.assessment)
    cy.task('log', this.placeContext.assessment)
    cy.task('stubAssessmentReferralHistoryGet', {
      assessment: this.placeContext.assessment,
      referralNotes: this.timeline.events,
    })
    cy.task('stubBedspaceSearchReferenceData')
    cy.task('stubBedSearch', this.bedSearchResults)
    cy.task('stubSinglePremises', this.premises)
    cy.task('stubSingleRoom', { premisesId: this.premises.id, room: this.room })
    cy.task('stubFindPerson', { person: this.person })
    cy.task('stubAssessments', { data: this.assessmentSummaries })
    cy.task('stubBookingCreate', { premisesId: this.premises.id, booking: this.booking })
    cy.task('stubBooking', { premisesId: this.premises.id, booking: this.booking })
  }

  startPlace() {
    AssessmentSummaryPage.visit(this.placeContext.assessment, this.timeline)
  }

  completePlace() {
    this.assessmentToBedspaceSearch()
    this.bedspaceSearchToSearchResults()
    this.searchResultsToBedspace()
    this.bedspaceToNewBooking()
    this.newBookingToSelectAssessment()
    this.selectAssessmentToConfirm()
    this.confirmToShowBooking()
  }

  private assessmentToBedspaceSearch() {
    // Given I am viewing a ready to place assessment
    const assessmentSummaryPage = Page.verifyOnPage(AssessmentSummaryPage, this.placeContext.assessment, this.timeline)

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
    const searchParameters = bedSearchApiParametersFactory.build({
      startDate: this.placeContext.arrivalDate,
      probationDeliveryUnits: [this.premises.probationDeliveryUnit.id],
      attributes: characteristicsToSearchAttributes(this.premises),
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

    // And the assessment is preselected
    selectAssessmentPage.shouldShowPreselectedAsssessmentFromPlaceContext(this.placeContext)
  }

  private selectAssessmentToConfirm() {
    // Given I am viewing the select assessment page
    const selectAssessmentPage = Page.verifyOnPage(BookingSelectAssessmentPage, this.assessmentSummaries)

    // When I complete the form
    selectAssessmentPage.selectAssessment(
      assessmentSummaryFactory.build({ ...this.placeContext.assessment, person: this.person }),
    )
    selectAssessmentPage.clickSubmit()

    // I am taken to the booking confirm page
    const bookingConfirmPage = Page.verifyOnPage(BookingConfirmPage, this.premises, this.room, this.person)

    // And the place context header is visible
    bookingConfirmPage.shouldShowPlaceContextHeader(this.placeContext)
  }

  private confirmToShowBooking() {
    // Given I am viewing the booking confirm page
    const bookingConfirmPage = Page.verifyOnPage(BookingConfirmPage, this.premises, this.room, this.person)

    // When I click submit
    bookingConfirmPage.clickSubmit()

    // I am taken to the show booking page
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, this.premises, this.room, this.booking)

    // And the place context header is not visible
    bookingShowPage.shouldNotShowPlaceContextHeader()
  }
}
