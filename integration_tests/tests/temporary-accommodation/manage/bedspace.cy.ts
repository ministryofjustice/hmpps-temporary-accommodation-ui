import Page from '../../../../cypress_shared/pages/page'
import BedspaceEditPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceEdit'
import BedspaceNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceNew'
import BedspaceShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceShow'
import PremisesShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/premisesShow'
import { setupTestUser } from '../../../../cypress_shared/utils/setupTestUser'
import {
  bedFactory,
  bookingFactory,
  lostBedFactory,
  newRoomFactory,
  premisesFactory,
  roomFactory,
  updateRoomFactory,
} from '../../../../server/testutils/factories'

context('Bedspace', () => {
  beforeEach(() => {
    cy.task('reset')
    setupTestUser('assessor')
  })

  it('should navigate to the create bedspace page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is reference data in the database
    cy.task('stubPremisesReferenceData')
    cy.task('stubRoomReferenceData')

    // And there is an active premises in the database
    const premises = premisesFactory.active().build()
    cy.task('stubSinglePremises', premises)

    // When I visit the show premises page
    const premisesShowPage = PremisesShowPage.visit(premises)

    // Add I click the add bedspace link
    premisesShowPage.clickAddBedspaceLink()

    // Then I navigate to the new bedspace page
    Page.verifyOnPage(BedspaceNewPage, premises)
  })

  it('should navigate to the edit bedspace page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is reference data in the database
    cy.task('stubPremisesReferenceData')
    cy.task('stubRoomReferenceData')

    // And there is a premises with rooms in the database
    const premises = premisesFactory.build()
    const rooms = roomFactory.buildList(5)

    cy.task('stubPremisesWithRooms', { premises, rooms })
    cy.task('stubSingleRoom', { premisesId: premises.id, room: rooms[0] })

    // When I visit the show premises page
    const premisesShowPage = PremisesShowPage.visit(premises)

    // Add I click a view bedspace link
    premisesShowPage.clickBedpaceViewLink(rooms[0])

    // And I click the edit bedspace link
    const bedspaceShowPage = Page.verifyOnPage(BedspaceShowPage, premises, rooms[0])
    bedspaceShowPage.clickBedspaceEditLink()

    // Then I navigate to the edit bedspace page
    Page.verifyOnPage(BedspaceEditPage, premises, rooms[0])
  })

  it('should navigate to the show bedspace page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is reference data in the database
    cy.task('stubPremisesReferenceData')
    cy.task('stubRoomReferenceData')

    // And there is a premises with rooms in the database
    const premises = premisesFactory.build()
    const rooms = roomFactory.buildList(5)

    cy.task('stubPremisesWithRooms', { premises, rooms })
    cy.task('stubSingleRoom', { premisesId: premises.id, room: rooms[0] })

    // When I visit the show premises page
    const premisesShowPage = PremisesShowPage.visit(premises)

    // Add I click a view bedspace link
    premisesShowPage.clickBedpaceViewLink(rooms[0])

    // Then I navigate to the show bedspace page
    Page.verifyOnPage(BedspaceShowPage, premises, rooms[0])
  })

  it('allows me to create a bedspace', () => {
    // Given I am signed in
    cy.signIn()

    // And there is reference data in the database
    cy.task('stubRoomReferenceData')

    // When I visit the new bedspace page
    const premises = premisesFactory.build()
    cy.task('stubSinglePremises', premises)

    const page = BedspaceNewPage.visit(premises)

    // Then I should see the bedspace details
    page.shouldShowBedspaceDetails()

    // And when I fill out the form
    const room = roomFactory.build()
    const newRoom = newRoomFactory.build({
      name: room.name,
      characteristicIds: room.characteristics.map(characteristic => characteristic.id),
      notes: room.notes,
    })
    cy.task('stubRoomCreate', { premisesId: premises.id, room })
    cy.task('stubSingleRoom', { premisesId: premises.id, room })

    page.completeForm(newRoom)

    // Then a room should have been created in the API
    cy.task('verifyRoomCreate', premises.id).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.name).equal(newRoom.name)
      expect(requestBody.characteristicIds).members(newRoom.characteristicIds)
      expect(requestBody.notes.replaceAll('\r\n', '\n')).equal(newRoom.notes)
    })

    // And I should be redirected to the show bedspace page
    const bedspaceShowPage = Page.verifyOnPage(BedspaceShowPage, premises, room)
    bedspaceShowPage.shouldShowBanner('Bedspace created')
  })

  it('shows errors when the API returns an error', () => {
    // Given I am signed in
    cy.signIn()

    // And there is reference data in the database
    cy.task('stubRoomReferenceData')

    // When I visit the new bedspace page
    const premises = premisesFactory.build()
    cy.task('stubSinglePremises', premises)

    const page = BedspaceNewPage.visit(premises)

    // And I miss required fields
    cy.task('stubRoomCreateErrors', { premisesId: premises.id, params: ['name'] })
    page.clickSubmit()

    // Then I should see error messages relating to those fields
    page.shouldShowErrorMessagesForFields(['name'])
  })

  it('navigates back from the new bedspace page to the show premises page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is reference data in the database
    cy.task('stubRoomReferenceData')

    // When I visit the new bedspace page
    const premises = premisesFactory.build()
    cy.task('stubSinglePremises', premises)

    const page = BedspaceNewPage.visit(premises)

    // And I click the previous bread crumb
    page.clickBreadCrumbUp()

    // Then I navigate to the show premises page
    Page.verifyOnPage(PremisesShowPage, premises)
  })

  it('allows me to edit a bedspace', () => {
    // Given I am signed in
    cy.signIn()

    // And there is reference data in the database
    cy.task('stubRoomReferenceData')

    // And there is a premises and a room in the database
    const premises = premisesFactory.build()
    const room = roomFactory.build()

    const premisesId = premises.id

    cy.task('stubSinglePremises', premises)
    cy.task('stubSingleRoom', { premisesId, room })

    // When I visit the edit bedspace page
    const page = BedspaceEditPage.visit(premises, room)

    // Then I should see the bedspace details
    page.shouldShowBedspaceDetails()

    // And when I fill out the form
    cy.task('stubRoomUpdate', { premisesId, room })
    const updatedRoom = updateRoomFactory.build({ name: 'new-room-name' })
    page.completeForm(updatedRoom)

    // Then the room should have been update in the API
    cy.task('verifyRoomUpdate', { premisesId, room }).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.name).equal(updatedRoom.name)
      expect(requestBody.characteristicIds).members(updatedRoom.characteristicIds)
      expect(requestBody.notes.replaceAll('\r\n', '\n')).equal(updatedRoom.notes)
    })

    // And I should be redirected to the show bedspace page
    const bedspaceShowPage = Page.verifyOnPage(BedspaceShowPage, premises, room)
    bedspaceShowPage.shouldShowBanner('Bedspace updated')
  })

  it('navigates back from the edit bedspace page to the show bedspace page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is reference data in the database
    cy.task('stubRoomReferenceData')

    // And there is a premises and a room in the database
    const premises = premisesFactory.build()
    const room = roomFactory.build()

    cy.task('stubSinglePremises', premises)
    cy.task('stubSingleRoom', { premisesId: premises.id, room })

    // When I visit the edit bedspace page
    const page = BedspaceEditPage.visit(premises, room)

    // And I click the previous bread crumb
    page.clickBreadCrumbUp()

    // Then I navigate to the show bedspace page
    Page.verifyOnPage(BedspaceShowPage, premises, room)
  })

  it('shows a single bedspace in an active premises', () => {
    // Given I am signed in
    cy.signIn()

    // And there is an active premises, a room, bookings and a lost bed in the database
    const premises = premisesFactory.active().build()
    const room = roomFactory.build()
    const bed = bedFactory.build({
      id: room.beds[0].id,
    })
    const bookings = bookingFactory
      .params({
        bed,
      })
      .buildList(5)

    const lostBed = lostBedFactory.active().build({
      bedId: bed.id,
    })

    cy.task('stubSinglePremises', premises)
    cy.task('stubSingleRoom', { premisesId: premises.id, room })
    cy.task('stubBookingsForPremisesId', { premisesId: premises.id, bookings })
    cy.task('stubLostBedsForPremisesId', { premisesId: premises.id, lostBeds: [lostBed] })

    // When I visit the show bedspace page
    const page = BedspaceShowPage.visit(premises, room)

    // Then I should see the bedspace details
    page.shouldShowBedspaceDetails()
    page.shouldShowAsActive()
    page.shouldShowPremisesAttributes()

    // And I should see the booking and lost bed details
    bookings.forEach(booking => {
      page.shouldShowBookingDetails(booking)
    })
    page.shouldShowLostBedDetails(lostBed)
  })

  it('shows a single bedspace in an archived premises', () => {
    // Given I am signed in
    cy.signIn()

    // And there is an archived premises, a room, bookings, and a lost bed in the database
    const premises = premisesFactory.archived().build()
    const room = roomFactory.build()
    const bed = bedFactory.build({
      id: room.beds[0].id,
    })
    const bookings = bookingFactory
      .params({
        bed,
      })
      .buildList(5)
    const lostBed = lostBedFactory.active().build({ bedId: bed.id })

    cy.task('stubSinglePremises', premises)
    cy.task('stubSingleRoom', { premisesId: premises.id, room })
    cy.task('stubBookingsForPremisesId', { premisesId: premises.id, bookings })
    cy.task('stubLostBedsForPremisesId', { premisesId: premises.id, lostBeds: [lostBed] })

    // When I visit the show bedspace page
    const page = BedspaceShowPage.visit(premises, room)

    // Then I should see the bedspace details
    page.shouldShowBedspaceDetails()
    page.shouldShowAsArchived()
    page.shouldShowPremisesAttributes()

    // And I should see the booking and lost bed details
    bookings.forEach(booking => {
      page.shouldShowBookingDetails(booking)
    })
    page.shouldShowLostBedDetails(lostBed)
  })

  it('navigates back from the show bedspace page to the show premises page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises with rooms in the database
    const premises = premisesFactory.build()
    const rooms = roomFactory.buildList(5)

    cy.task('stubPremisesWithRooms', { premises, rooms })
    cy.task('stubSingleRoom', { premisesId: premises.id, room: rooms[0] })

    // When I visit the show bedspace page
    const page = BedspaceShowPage.visit(premises, rooms[0])

    // And I click the previous bread crumb
    page.clickBreadCrumbUp()

    // Then I navigate to the show premises page
    Page.verifyOnPage(PremisesShowPage, premises)
  })
})
