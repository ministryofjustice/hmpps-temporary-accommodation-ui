import Page from '../../../../cypress_shared/pages/page'
import BedspaceShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceShow'
import BookingConfirmPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingConfirm'
import BookingNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingNew'
import BookingSelectAssessmentPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingSelectAssessment'
import BookingShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingShow'
import { setupTestUser } from '../../../../cypress_shared/utils/setupTestUser'
import {
  assessmentSummaryFactory,
  bedFactory,
  bookingFactory,
  cas3BedspaceFactory,
  cas3PremisesFactory,
  lostBedFactory,
  newBookingFactory,
  personFactory,
  premisesFactory,
} from '../../../../server/testutils/factories'

context('Booking', () => {
  beforeEach(() => {
    cy.task('reset')
    setupTestUser('assessor')
  })

  it('navigates to the create booking page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is an active premises and a bedspace the database
    const premises = premisesFactory.active().build()

    const cas3Premises = cas3PremisesFactory.build({ id: premises.id, status: 'online' })
    const cas3Bedspace = cas3BedspaceFactory.build({ status: 'online', startDate: '2023-10-18' })
    const bookings = bookingFactory
      .params({
        bed: bedFactory.build({ id: cas3Bedspace.id }),
      })
      .buildList(5)
    const lostBeds = lostBedFactory
      .active()
      .params({
        bedId: cas3Bedspace.id,
      })
      .buildList(5)
    cy.task('stubSinglePremises', premises)
    cy.task('stubSinglePremisesV2', cas3Premises)
    cy.task('stubBedspaceV2', { premisesId: cas3Premises.id, bedspace: cas3Bedspace })
    cy.task('stubBookingsForPremisesId', { premisesId: premises.id, bookings })
    cy.task('stubLostBedsForPremisesId', { premisesId: premises.id, lostBeds })

    // When I visit the show bedspace page
    const bedspaceShow = BedspaceShowPage.visit(premises, null, cas3Bedspace)

    // Add I click the book bedspace link
    bedspaceShow.clickBookBedspaceLink()

    // Then I navigate to the new booking page
    Page.verifyOnPage(BookingNewPage, premises, null, cas3Bedspace)
  })

  it('navigates to the show booking page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room, and bookings in the database
    const premises = premisesFactory.build()
    const cas3Premises = cas3PremisesFactory.build({ id: premises.id, status: 'online' })
    const cas3Bedspace = cas3BedspaceFactory.build({ status: 'online' })
    const bookings = bookingFactory
      .params({
        bed: bedFactory.build({ id: cas3Bedspace.id }),
      })
      .buildList(5)
    const lostBeds = lostBedFactory
      .active()
      .params({
        bedId: cas3Bedspace.id,
      })
      .buildList(5)

    cy.task('stubSinglePremises', premises)
    cy.task('stubSinglePremisesV2', cas3Premises)
    cy.task('stubBedspaceV2', { premisesId: cas3Premises.id, bedspace: cas3Bedspace })
    cy.task('stubBookingsForPremisesId', { premisesId: premises.id, bookings })
    cy.task('stubLostBedsForPremisesId', { premisesId: premises.id, lostBeds })
    cy.task('stubBooking', { premisesId: premises.id, booking: bookings[0] })

    // When I visit the show bedspace page
    const bedspaceShowPage = BedspaceShowPage.visit(premises, null, cas3Bedspace)

    // Add I click the booking link
    bedspaceShowPage.clickBookingLink(bookings[0])

    // Then I navigate to the booking page
    Page.verifyOnPage(BookingShowPage, premises, null, cas3Bedspace, bookings[0])
  })

  it('allows me to create a booking', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room and a person in the database
    const premises = premisesFactory.build()
    const cas3Bedspace = cas3BedspaceFactory.build({ status: 'online' })
    const person = personFactory.build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace: cas3Bedspace })
    cy.task('stubFindPerson', { person })

    // And there are assessments in the database
    const assessmentSummaries = assessmentSummaryFactory.buildList(5)
    cy.task('stubAssessments', { data: assessmentSummaries })

    // When I visit the new booking page
    const bookingNewPage = BookingNewPage.visit(premises, null, cas3Bedspace)

    // Then I should see the booking details
    bookingNewPage.shouldShowBookingDetails()

    // And when I fill out the form
    const booking = bookingFactory.build({ person, assessmentId: assessmentSummaries[0].id })
    const newBooking = newBookingFactory.build({
      ...booking,
      crn: booking.person.crn,
    })

    bookingNewPage.completeForm(newBooking)

    // And I select an assessment
    const bookingSelectAssessmentPage = Page.verifyOnPage(BookingSelectAssessmentPage, assessmentSummaries)
    bookingSelectAssessmentPage.shouldDisplayAssessments()
    bookingSelectAssessmentPage.selectAssessment(assessmentSummaries[0])

    bookingSelectAssessmentPage.clickSubmit()

    // And I confirm the booking
    const bookingConfirmPage = Page.verifyOnPage(BookingConfirmPage, premises, null, cas3Bedspace, person)
    bookingConfirmPage.shouldShowBookingDetails()

    cy.task('stubBookingCreate', { premisesId: premises.id, booking })
    cy.task('stubBooking', { premisesId: premises.id, booking })

    bookingConfirmPage.clickSubmit()

    // Then a booking should have been created in the API
    cy.task('verifyBookingCreate', premises.id).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.service).equal('temporary-accommodation')
      expect(requestBody.bedId).equal(cas3Bedspace.id)
      expect(requestBody.crn).equal(newBooking.crn)
      expect(requestBody.arrivalDate).equal(newBooking.arrivalDate)
      expect(requestBody.departureDate).equal(newBooking.departureDate)
      expect(requestBody.assessmentId).equal(newBooking.assessmentId)
    })

    // And I should be redirected to the show booking page
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, premises, null, cas3Bedspace, booking)
    bookingShowPage.shouldShowBanner('Booking created')
  })

  it('allows me to create a booking without linking an assessment', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room and a person in the database
    const premises = premisesFactory.build()
    const cas3Bedspace = cas3BedspaceFactory.build({ status: 'online' })
    cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace: cas3Bedspace })
    const person = personFactory.build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace: cas3Bedspace })
    cy.task('stubFindPerson', { person })

    // And there are assessments in the database
    cy.task('stubAssessments', { data: [] })

    // When I visit the new booking page
    const bookingNewPage = BookingNewPage.visit(premises, null, cas3Bedspace)

    // Then I should see the booking details
    bookingNewPage.shouldShowBookingDetails()

    // And when I fill out the form
    const booking = bookingFactory.build({ person })
    const newBooking = newBookingFactory.build({
      ...booking,
      crn: booking.person.crn,
    })

    bookingNewPage.completeForm(newBooking)

    // And I do not select an assessment
    const bookingSelectAssessmentPage = Page.verifyOnPage(BookingSelectAssessmentPage, [])
    bookingSelectAssessmentPage.clickSubmit()

    // And I confirm the booking
    const bookingConfirmPage = Page.verifyOnPage(BookingConfirmPage, premises, null, cas3Bedspace, person)
    bookingConfirmPage.shouldShowBookingDetails()

    cy.task('stubBookingCreate', { premisesId: premises.id, booking })
    cy.task('stubBooking', { premisesId: premises.id, booking })

    bookingConfirmPage.clickSubmit()

    // Then a booking should have been created in the API
    cy.task('verifyBookingCreate', premises.id).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.service).equal('temporary-accommodation')
      expect(requestBody.bedId).equal(cas3Bedspace.id)
      expect(requestBody.crn).equal(newBooking.crn)
      expect(requestBody.arrivalDate).equal(newBooking.arrivalDate)
      expect(requestBody.departureDate).equal(newBooking.departureDate)
      expect(requestBody.assessmentId).equal(undefined)
    })

    // And I should be redirected to the show booking page
    const bookingShowPage = Page.verifyOnPage(BookingShowPage, premises, null, cas3Bedspace, booking)
    bookingShowPage.shouldShowBanner('Booking created')
  })

  it('shows a suggested end date for the booking', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises and a room the database
    const premises = premisesFactory.build()
    const cas3Bedspace = cas3BedspaceFactory.build({ status: 'online' })

    cy.task('stubSinglePremises', premises)
    cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace: cas3Bedspace })

    // When I visit the new booking page
    const page = BookingNewPage.visit(premises, null, cas3Bedspace)

    // And I enter a start date
    page.completeDateInputs('arrivalDate', '2022-07-08')

    // Then I should see a suggested end date
    page.shouldShowEndDateHint('30/9/2022')
  })

  it('shows error when the API returns a person not found 404', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises and a room the database
    const premises = premisesFactory.build()
    const cas3Bedspace = cas3BedspaceFactory.build({ status: 'online' })

    // And there is no person in the database
    const person = personFactory.build()
    cy.task('stubPersonNotFound', { person })

    cy.task('stubSinglePremises', premises)
    cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace: cas3Bedspace })

    // When I visit the new booking page
    const bookingNewPage = BookingNewPage.visit(premises, null, cas3Bedspace)

    // And when I fill out the form with a CRN that is not found in the API
    const booking = bookingFactory.build({ person })
    const newBooking = newBookingFactory.build({
      ...booking,
      crn: booking.person.crn,
    })
    bookingNewPage.completeForm(newBooking)

    // Then I should see the relevant error message
    const page = Page.verifyOnPage(BookingNewPage, premises, null, cas3Bedspace)
    page.shouldShowCrnDoesNotExistErrorMessage()
  })

  it('shows errors when the API returns missing field errors', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room and a person in the database
    const premises = premisesFactory.build()
    const cas3Bedspace = cas3BedspaceFactory.build({ status: 'online' })
    const person = personFactory.build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace: cas3Bedspace })
    cy.task('stubFindPerson', { person })

    // And there are no assessments in the database
    cy.task('stubAssessments', { data: [] })

    // When I visit the new booking page
    const bookingNewPage = BookingNewPage.visit(premises, null, cas3Bedspace)

    // And I miss required fields
    bookingNewPage.clickSubmit()

    // Then I should see error messages relating to those fields
    const returnedBookingNewPage = Page.verifyOnPage(BookingNewPage, premises, null, cas3Bedspace)
    returnedBookingNewPage.shouldShowErrorMessagesForFields(['crn', 'arrivalDate', 'departureDate'])
  })

  it('shows errors when the API returns a 409 Conflict with a void', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room, and a conflicting lost bed in the database
    const premises = premisesFactory.build()
    const cas3Premises = cas3PremisesFactory.build({ id: premises.id, status: 'online' })
    const bedspace = cas3BedspaceFactory.build({ status: 'online', startDate: '2023-10-18' })
    const bookings = bookingFactory
      .params({
        bed: bedFactory.build({ id: bedspace.id }),
      })
      .buildList(5)
    const lostBeds = lostBedFactory
      .active()
      .params({
        bedId: bedspace.id,
      })
      .buildList(5)
    const person = personFactory.build()
    const conflictingLostBed = lostBedFactory.build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubSinglePremisesV2', cas3Premises)
    cy.task('stubBedspaceV2', { premisesId: cas3Premises.id, bedspace })
    cy.task('stubBookingsForPremisesId', { premisesId: premises.id, bookings })
    cy.task('stubLostBedsForPremisesId', { premisesId: premises.id, lostBeds })
    cy.task('stubSingleLostBed', { premisesId: premises.id, lostBed: conflictingLostBed })
    cy.task('stubFindPerson', { person })
    cy.task('stubAssessments', { data: [] })

    // When I visit the new booking page
    const bookingNewPage = BookingNewPage.visit(premises, null, bedspace)

    // And I fill out the form with dates that conflict with an existing booking
    const booking = bookingFactory.build({
      person,
    })
    const newBooking = newBookingFactory.build({
      ...booking,
      crn: booking.person.crn,
    })

    bookingNewPage.completeForm(newBooking)

    // And I select no assessment
    const bookingSelectAssessmentPage = Page.verifyOnPage(BookingSelectAssessmentPage, [])
    bookingSelectAssessmentPage.clickSubmit()

    // And I confirm the booking
    const bookingConfirmPage = Page.verifyOnPage(BookingConfirmPage, premises, null, bedspace, person)

    cy.task('stubBookingCreateConflictError', {
      premisesId: premises.id,
      conflictingEntityId: conflictingLostBed.id,
      conflictingEntityType: 'lost-bed',
    })
    bookingConfirmPage.clickSubmit()

    // Then I should see error messages for the conflict
    const returnedBookingNewPage = Page.verifyOnPage(BookingNewPage, premises, null, bedspace)

    returnedBookingNewPage.shouldShowPrefilledBookingDetails(newBooking)
    returnedBookingNewPage.shouldShowDateConflictErrorMessages(conflictingLostBed, 'lost-bed')
  })

  it('shows errors when the API returns a 409 Conflict with the bedspace end date', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, and a room in the database
    const premises = premisesFactory.build()
    const cas3Bedspace = cas3BedspaceFactory.build({ status: 'online' })
    const person = personFactory.build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace: cas3Bedspace })
    cy.task('stubFindPerson', { person })

    // And there are no assessments in the database
    cy.task('stubAssessments', { data: [] })

    // When I visit the new booking page
    const bookingNewPage = BookingNewPage.visit(premises, null, cas3Bedspace)

    // And I fill out the form with dates that conflict with the bedspace end date
    const booking = bookingFactory.build({
      person,
    })
    const newBooking = newBookingFactory.build({
      ...booking,
      crn: booking.person.crn,
    })

    bookingNewPage.completeForm(newBooking)

    // And I select no assessment
    const bookingSelectAssessmentPage = Page.verifyOnPage(BookingSelectAssessmentPage, [])
    bookingSelectAssessmentPage.clickSubmit()

    // And I confirm the booking
    const bookingConfirmPage = Page.verifyOnPage(BookingConfirmPage, premises, null, cas3Bedspace, person)

    cy.task('stubBookingCreateConflictError', {
      premisesId: premises.id,
      conflictingEntityId: '',
      conflictingEntityType: 'bedspace-end-date',
    })
    bookingConfirmPage.clickSubmit()

    // Then I should see error messages for the conflict
    const returnedBookingNewPage = Page.verifyOnPage(BookingNewPage, premises, null, cas3Bedspace)

    returnedBookingNewPage.shouldShowPrefilledBookingDetails(newBooking)
    returnedBookingNewPage.shouldShowDateConflictErrorMessages(null, 'bedspace-end-date')
  })

  it('shows errors when the API returns a 403 Forbidden error', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises and a room the database
    const premises = premisesFactory.build()
    const cas3Bedspace = cas3BedspaceFactory.build({ status: 'online' })

    cy.task('stubSinglePremises', premises)
    cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace: cas3Bedspace })

    // And there is an inaccessible person in the database
    const person = personFactory.build()
    cy.task('stubFindPersonForbidden', { person })

    // When I visit the new booking page
    const bookingNewPage = BookingNewPage.visit(premises, null, cas3Bedspace)

    // And I fill out the form with a CRN the user does not have permission to access
    const booking = bookingFactory.build({
      person,
    })
    const newBooking = newBookingFactory.build({
      ...booking,
      crn: booking.person.crn,
    })

    bookingNewPage.completeForm(newBooking)

    // Then I should see error messages for the date fields
    bookingNewPage.shouldShowPrefilledBookingDetails(newBooking)
    bookingNewPage.shouldShowUserPermissionErrorMessage()
  })

  it('shows errors when no assessment is seleced', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room and a person in the database
    const premises = premisesFactory.build()
    const cas3Bedspace = cas3BedspaceFactory.build({ status: 'online' })
    const person = personFactory.build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace: cas3Bedspace })
    cy.task('stubFindPerson', { person })

    // And there are assessments in the database
    const assessmentSummaries = assessmentSummaryFactory.buildList(5)
    cy.task('stubAssessments', { data: assessmentSummaries })

    // When I visit the new booking page
    const bookingNewPage = BookingNewPage.visit(premises, null, cas3Bedspace)

    // And when I fill out the form
    const booking = bookingFactory.build({ person })
    const newBooking = newBookingFactory.build({
      ...booking,
      crn: booking.person.crn,
    })

    bookingNewPage.completeForm(newBooking)

    // And I do not select an assessment
    const bookingSelectAssessmentPage = Page.verifyOnPage(BookingSelectAssessmentPage, assessmentSummaries)
    bookingSelectAssessmentPage.clickSubmit()

    // Then I should see error messages relating to those fields
    const revisitedBookingSelectAssessmentPage = Page.verifyOnPage(BookingSelectAssessmentPage, assessmentSummaries)
    revisitedBookingSelectAssessmentPage.shouldShowErrorMessagesForFields(['assessmentId'])
  })

  it('navigates back from the new booking page to the show bedspace page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises and a room the database
    const premises = premisesFactory.build()
    const cas3Premises = cas3PremisesFactory.build({ id: premises.id, status: 'online' })
    const cas3Bedspace = cas3BedspaceFactory.build({ status: 'online' })
    const bookings = bookingFactory
      .params({
        bed: bedFactory.build({ id: cas3Bedspace.id }),
      })
      .buildList(5)
    const lostBeds = lostBedFactory
      .active()
      .params({
        bedId: cas3Bedspace.id,
      })
      .buildList(5)

    cy.task('stubSinglePremises', premises)
    cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace: cas3Bedspace })
    cy.task('stubSinglePremisesV2', cas3Premises)
    cy.task('stubBookingsForPremisesId', { premisesId: premises.id, bookings })
    cy.task('stubLostBedsForPremisesId', { premisesId: premises.id, lostBeds })

    // When I visit the new booking page
    const page = BookingNewPage.visit(premises, null, cas3Bedspace)

    // And I click the previous bread crumb
    page.clickBreadCrumbUp()

    // Then I navigate to the show bedspace page
    Page.verifyOnPage(BedspaceShowPage, premises, null, cas3Bedspace, cas3Bedspace.reference)
  })

  it('navigates back from the confirm booking page to the new booking page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room and a person in the database
    const premises = premisesFactory.build()
    const cas3Bedspace = cas3BedspaceFactory.build({ status: 'online' })
    const person = personFactory.build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace: cas3Bedspace })
    cy.task('stubFindPerson', { person })

    // And there are no assessments in the database
    cy.task('stubAssessments', { data: [] })

    // When I visit the new booking page
    const bookingNewPage = BookingNewPage.visit(premises, null, cas3Bedspace)

    // And I fill out the form
    const booking = bookingFactory.build({ person })
    const newBooking = newBookingFactory.build({
      ...booking,
      crn: booking.person.crn,
    })

    bookingNewPage.completeForm(newBooking)

    // And I select no assessment
    const bookingSelectAssessmentPage = Page.verifyOnPage(BookingSelectAssessmentPage, [])
    bookingSelectAssessmentPage.clickSubmit()

    // And I click the back link on the confirm booking page
    const bookingConfirmPage = Page.verifyOnPage(BookingConfirmPage, premises, null, cas3Bedspace, person)
    bookingConfirmPage.clickBack()

    // Add I click the back link on the select assessment page
    const revisitedBookingSelectAssessmentPage = Page.verifyOnPage(BookingSelectAssessmentPage, [])
    revisitedBookingSelectAssessmentPage.clickBack()

    // Then I navigate to the new booking page
    const returnedBookingNewPage = Page.verifyOnPage(BookingNewPage, premises, null, cas3Bedspace)
    returnedBookingNewPage.shouldShowPrefilledBookingDetails(newBooking)
  })

  it('shows a single booking', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room, and a booking in the database
    const premises = premisesFactory.build()
    const cas3Bedspace = cas3BedspaceFactory.build({ status: 'online' })
    const booking = bookingFactory.build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace: cas3Bedspace })
    cy.task('stubBooking', { premisesId: premises.id, booking })

    // When I visit the show booking page
    const page = BookingShowPage.visit(premises, null, cas3Bedspace, booking)

    // Then I should see the booking details
    page.shouldShowBookingDetails()
  })

  it('navigates back from the show booking page to the show bedspace page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises, a room, and bookings in the database
    const premises = premisesFactory.build()
    const cas3Premises = cas3PremisesFactory.build({ id: premises.id, status: 'online' })
    const cas3Bedspace = cas3BedspaceFactory.build({ status: 'online' })
    const bookings = bookingFactory
      .params({
        bed: bedFactory.build({ id: cas3Bedspace.id }),
      })
      .buildList(5)
    const lostBeds = lostBedFactory
      .active()
      .params({
        bedId: cas3Bedspace.id,
      })
      .buildList(5)

    cy.task('stubSinglePremises', premises)
    cy.task('stubSinglePremisesV2', cas3Premises)
    cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace: cas3Bedspace })
    cy.task('stubBookingsForPremisesId', { premisesId: premises.id, bookings })
    cy.task('stubLostBedsForPremisesId', { premisesId: premises.id, lostBeds })
    cy.task('stubBooking', { premisesId: premises.id, booking: bookings[0] })

    // When I visit the show booking page
    const page = BookingShowPage.visit(premises, null, cas3Bedspace, bookings[0])

    // And I click the previous bread crumb
    page.clickBreadCrumbUp()

    // Then I navigate to the show bedspace page
    Page.verifyOnPage(BedspaceShowPage, premises, null, cas3Bedspace, cas3Bedspace.reference)
  })
})
