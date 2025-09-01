import {
  AssessmentSummary,
  Booking,
  Cas3Bedspace,
  Cas3BedspaceSearchResults,
  Cas3Premises,
  LostBed,
  Person,
  TemporaryAccommodationPremises as Premises,
  Room,
} from '../../server/@types/shared'
import { PlaceContext } from '../../server/@types/ui'
import {
  assessmentSummaryFactory,
  bedFactory,
  bedspaceSearchFormParametersFactory,
  bedspaceSearchResultFactory,
  bedspaceSearchResultsFactory,
  bookingFactory,
  lostBedFactory,
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

export default class PlaceHelper {
  private readonly bedspaceSearchResults: Cas3BedspaceSearchResults

  private readonly person: Person

  private readonly booking: Booking

  private readonly assessmentSummaries: Array<AssessmentSummary>

  private readonly timeline: TimeLineFactory

  private readonly bookings: Array<Booking>

  private readonly lostBeds: Array<LostBed>

  constructor(
    private readonly placeContext: NonNullable<PlaceContext>,
    private readonly premises: Premises,
    private readonly room: Room,
    private readonly cas3Premises: Cas3Premises,
    private readonly cas3Bedspace: Cas3Bedspace,
  ) {
    if (room) {
      this.bedspaceSearchResults = bedspaceSearchResultsFactory.build({
        results: [bedspaceSearchResultFactory.forBedspace(this.premises, this.room, null).build()],
      })
      this.person = this.placeContext.assessment.application.person
      this.booking = bookingFactory.build({
        person: this.person,
        bed: bedFactory.build({ id: room.beds[0].id }),
      })
      this.lostBeds = lostBedFactory
        .active()
        .params({
          bedId: room.beds[0].id,
        })
        .buildList(5)
    } else {
      this.bedspaceSearchResults = bedspaceSearchResultsFactory.build({
        results: [bedspaceSearchResultFactory.forBedspace(this.premises, null, this.cas3Bedspace).build()],
      })
      this.person = this.placeContext.assessment.application.person
      this.booking = bookingFactory.build({
        person: this.person,
        bed: bedFactory.build({ id: cas3Bedspace.id }),
      })
      this.lostBeds = lostBedFactory
        .active()
        .params({
          bedId: cas3Bedspace.id,
        })
        .buildList(5)
    }
    this.assessmentSummaries = [
      assessmentSummaryFactory.build({
        ...this.placeContext.assessment,
        person: this.person,
      }),
      ...assessmentSummaryFactory.buildList(5),
    ]
    this.timeline = timelineEventsFactory.build()
    this.bookings = [this.booking]
  }

  setupStubs() {
    cy.task('stubFindAssessment', this.placeContext.assessment)
    cy.task('log', this.placeContext.assessment)
    cy.task('stubAssessmentReferralHistoryGet', {
      assessment: this.placeContext.assessment,
      referralNotes: this.timeline.events,
    })
    cy.task('stubBedspaceSearchReferenceData')
    cy.task('stubBedspaceSearch', this.bedspaceSearchResults)
    cy.task('stubSinglePremises', this.premises)
    cy.task('stubSinglePremisesV2', this.cas3Premises)
    cy.task('stubBedspaceV2', { premisesId: this.premises.id, bedspace: this.cas3Bedspace })
    cy.task('stubFindPerson', { person: this.person })
    cy.task('stubAssessments', { data: this.assessmentSummaries })
    cy.task('stubBookingCreate', { premisesId: this.premises.id, booking: this.booking })
    cy.task('stubBooking', { premisesId: this.premises.id, booking: this.booking })
    cy.task('stubBookingsForPremisesId', { premisesId: this.premises.id, bookings: this.bookings })
    cy.task('stubLostBedsForPremisesId', { premisesId: this.premises.id, lostBeds: this.lostBeds })
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

    const searchParameters = bedspaceSearchFormParametersFactory.build({
      startDate: this.placeContext.arrivalDate,
      probationDeliveryUnits: [this.premises.probationDeliveryUnit.id],
    })

    bedspaceSearchPage.completeForm(searchParameters)
    bedspaceSearchPage.clickSubmit()

    // I am taken to the search results page
    const resultsBedspaceSearchPage = Page.verifyOnPage(BedspaceSearchPage, this.bedspaceSearchResults)

    // And the place context header is visible
    resultsBedspaceSearchPage.shouldShowPlaceContextHeader(this.placeContext)
  }

  private searchResultsToBedspace() {
    // Given I am viewing bedspace search results
    const resultsBedspaceSearchPage = Page.verifyOnPage(BedspaceSearchPage, this.bedspaceSearchResults)

    // When I click a bedspace
    if (this.room) {
      resultsBedspaceSearchPage.clickBedspaceLink(this.room)
    } else {
      resultsBedspaceSearchPage.clickBedspaceLinkV2(this.cas3Bedspace)
    }

    if (this.room) {
      Page.verifyOnPage(BedspaceShowPage, this.premises, this.room, null, this.room.name)
    } else {
      // I am taken to the bedspace show page
      Page.verifyOnPage(BedspaceShowPage, this.premises, this.room, this.cas3Bedspace, this.cas3Bedspace.reference)
    }
  }

  private bedspaceToNewBooking() {
    // Given I am viewing the bedspace show page
    let bedspaceShowPage: BedspaceShowPage
    if (this.room) {
      bedspaceShowPage = Page.verifyOnPage(BedspaceShowPage, this.premises, this.room, null, this.room.name)
    } else {
      bedspaceShowPage = Page.verifyOnPage(
        BedspaceShowPage,
        this.premises,
        null,
        this.cas3Bedspace,
        this.cas3Bedspace.reference,
      )
    }

    // And I click "Book bedspace"
    bedspaceShowPage.clickBookBedspaceLink()

    // I am taken to the new booking page
    let bookingNewPage: BookingNewPage
    if (this.room) {
      bookingNewPage = Page.verifyOnPage(BookingNewPage, this.premises, this.room, null)
    } else {
      bookingNewPage = Page.verifyOnPage(BookingNewPage, this.premises, null, this.cas3Bedspace)
    }

    // And the place context banner is visible
    bookingNewPage.shouldShowPlaceContextHeader(this.placeContext)

    // And the CRN and arrival date are prefilled
    bookingNewPage.shouldShowPrefilledBookingDetailsFromPlaceContext(this.placeContext)
  }

  private newBookingToSelectAssessment() {
    // Given I am viewing the new booking page
    let bookingNewPage: BookingNewPage
    if (this.room) {
      bookingNewPage = Page.verifyOnPage(BookingNewPage, this.premises, this.room, null)
    } else {
      bookingNewPage = Page.verifyOnPage(BookingNewPage, this.premises, null, this.cas3Bedspace)
    }

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
    let bookingConfirmPage: BookingConfirmPage
    if (this.room) {
      bookingConfirmPage = Page.verifyOnPage(BookingConfirmPage, this.premises, this.room, null, this.person)
    } else {
      bookingConfirmPage = Page.verifyOnPage(BookingConfirmPage, this.premises, null, this.cas3Bedspace, this.person)
    }

    // And the place context header is visible
    bookingConfirmPage.shouldShowPlaceContextHeader(this.placeContext)
  }

  private confirmToShowBooking() {
    // Given I am viewing the booking confirm page
    let bookingConfirmPage: BookingConfirmPage
    if (this.room) {
      bookingConfirmPage = Page.verifyOnPage(BookingConfirmPage, this.premises, this.room, null, this.person)
    } else {
      bookingConfirmPage = Page.verifyOnPage(BookingConfirmPage, this.premises, null, this.cas3Bedspace, this.person)
    }

    // When I click submit
    bookingConfirmPage.clickSubmit()

    // I am taken to the show booking page
    let bookingShowPage: BookingShowPage
    if (this.room) {
      bookingShowPage = Page.verifyOnPage(BookingShowPage, this.premises, this.room, null, this.booking)
    } else {
      bookingShowPage = Page.verifyOnPage(BookingShowPage, this.premises, null, this.cas3Bedspace, this.booking)
    }

    // And the place context header is not visible
    bookingShowPage.shouldNotShowPlaceContextHeader()
  }
}
