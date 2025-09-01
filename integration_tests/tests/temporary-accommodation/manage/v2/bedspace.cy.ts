import { Cas3BedspaceStatus, Cas3Premises, Cas3PremisesBedspaceTotals, Characteristic } from '@approved-premises/api'
import {
  bedFactory,
  bookingFactory,
  cas3BedspaceFactory,
  cas3BedspacesFactory,
  cas3NewBedspaceFactory,
  cas3PremisesFactory,
  cas3PremisesSearchResultFactory,
  cas3PremisesSearchResultsFactory,
  cas3UpdateBedspaceFactory,
  characteristicFactory, lostBedFactory,
} from '../../../../../server/testutils/factories'
import BedspaceNewPage from '../../../../../cypress_shared/pages/temporary-accommodation/manage/v2/bedspaceNew'

import BedspaceShowPage from '../../../../../cypress_shared/pages/temporary-accommodation/manage/v2/bedspaceShow'
import { setupTestUser } from '../../../../../cypress_shared/utils/setupTestUser'
import PremisesListPage from '../../../../../cypress_shared/pages/temporary-accommodation/manage/v2/premisesList'
import Page from '../../../../../cypress_shared/pages/page'
import PremisesShowPage from '../../../../../cypress_shared/pages/temporary-accommodation/manage/v2/premisesShow'
import BedspaceEditPage from '../../../../../cypress_shared/pages/temporary-accommodation/manage/v2/bedspaceEdit'
import BedspaceArchivePage from '../../../../../cypress_shared/pages/temporary-accommodation/manage/v2/bedspaceArchive'
import BedspaceUnarchivePage from '../../../../../cypress_shared/pages/temporary-accommodation/manage/v2/bedspaceUnarchive'
import BedspaceCannotArchivePage from '../../../../../cypress_shared/pages/temporary-accommodation/manage/v2/bedspaceCannotArchive'

context('Bedspace', () => {
  beforeEach(() => {
    cy.task('reset')
    setupTestUser('assessor')

    // Given I am signed in
    cy.signIn()

    // And there is reference data in the database
    cy.task('stubPremisesReferenceDataV2')
  })

  it('should navigate to the bedspace show page', () => {
    // And there is an active premises in the database with an active bedspace
    const bedspace = cas3BedspaceFactory.build({ status: 'online', startDate: '2023-10-18' })
    const bedspaceSummary = {
      id: bedspace.id,
      status: bedspace.status,
      reference: bedspace.reference,
    }
    const premises = cas3PremisesFactory.build({ status: 'online' })
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

    const searchResult = cas3PremisesSearchResultFactory.build({ ...premises, bedspaces: [bedspaceSummary] })
    const searchResults = cas3PremisesSearchResultsFactory.build({ results: [searchResult] })
    cy.task('stubSinglePremisesV2', premises)
    cy.task('stubPremisesSearchV2', { searchResults, postcodeOrAddress: '', premisesStatus: 'online' })

    // And there is an online bedspace in the database for that premises
    cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace })
    cy.task('stubBookingsForPremisesId', { premisesId: premises.id, bookings })
    cy.task('stubLostBedsForPremisesId', { premisesId: premises.id, lostBeds })

    // When I visit the premises page
    const premisesPage = PremisesListPage.visit()

    // Then I should see the premises listed
    premisesPage.shouldShowOnlyPremises([searchResult])

    // When I click the bedspace reference
    premisesPage.clickBedspaceReference(bedspace.reference)

    // Then I should land on the show bedspace page
    const bedspacePage = new BedspaceShowPage(premises, bedspace)
    Page.verifyOnPage(BedspaceShowPage, premises, bedspace)

    // Then I should see the bedspace details
    bedspacePage.shouldShowStatus('Online')
    bedspacePage.shouldShowStartDate('18 October 2023')
    bedspacePage.shouldShowDetails()
    bedspacePage.shouldShowAdditionalDetails()
  })

  it('should navigate to the bedspace via its property', () => {
    // And there is an active premises with an online bedspace in the database
    const premises = cas3PremisesFactory.build({
      status: 'online',
      startDate: '2025-02-01',
      totalOnlineBedspaces: 1,
      totalUpcomingBedspaces: 0,
      totalArchivedBedspaces: 0,
    })
    const bedspace = cas3BedspaceFactory.build({ status: 'online', startDate: '2025-03-02' })
    const bedspaces = cas3BedspacesFactory.build({
      bedspaces: [bedspace],
      totalOnlineBedspaces: 1,
      totalUpcomingBedspaces: 0,
      totalArchivedBedspaces: 0,
    })
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
    cy.task('stubSinglePremisesV2', premises)
    cy.task('stubPremisesBedspacesV2', { premisesId: premises.id, bedspaces })
    cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace })
    cy.task('stubBookingsForPremisesId', { premisesId: premises.id, bookings })
    cy.task('stubLostBedsForPremisesId', { premisesId: premises.id, lostBeds })

    // When I visit the premises show page
    const premisesPage = PremisesShowPage.visit(premises)

    // Then I should see the premises overview
    premisesPage.shouldShowPremisesOverview(premises, 'Online', '1 February 2025')

    // When I click on the "Bedspaces overview" tab
    premisesPage.clickBedspacesOverviewTab()

    // Then I should see the bedspace summaries
    premisesPage.shouldShowBedspaceSummaries(bedspaces.bedspaces)

    // When I click on the "View bedspace" link
    premisesPage.clickViewBedspaceLink(bedspace)

    // Then I navigate to the show bedspace page
    const bedspacePage = Page.verifyOnPage(BedspaceShowPage, premises, bedspace)

    // And I should see the bedspace details
    bedspacePage.shouldShowStatus('Online')
    bedspacePage.shouldShowStartDate('2 March 2025')
    bedspacePage.shouldShowDetails()
    bedspacePage.shouldShowAdditionalDetails()
  })

  describe('creating a bedspace', () => {
    let premises: Cas3Premises

    beforeEach(() => {
      premises = cas3PremisesFactory.build({ status: 'online' })
      cy.task('stubSinglePremisesV2', premises)
    })

    it('allows me to create a bedspace', () => {
      // When I visit the new bedspace page
      const page = BedspaceNewPage.visit(premises)

      // Then I should see the bedspace details
      page.shouldShowBedspaceDetails()

      // And when I fill out the form
      const bedspace = cas3BedspaceFactory.build()
      const newBedspace = cas3NewBedspaceFactory.build({
        reference: bedspace.reference,
        characteristicIds: bedspace.characteristics.map(characteristic => characteristic.id),
        notes: bedspace.notes,
        startDate: bedspace.startDate,
      })

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

      cy.task('stubBedspaceCreate', { premisesId: premises.id, bedspace })
      cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace })
      cy.task('stubBookingsForPremisesId', { premisesId: premises.id, bookings })
      cy.task('stubLostBedsForPremisesId', { premisesId: premises.id, lostBeds })

      page.completeForm(newBedspace)

      // Then a bedspace should have been created in the API
      cy.task('verifyBedspaceCreate', premises.id).then(requests => {
        expect(requests).to.have.length(1)
        const requestBody = JSON.parse(requests[0].body)

        expect(requestBody.reference).equal(newBedspace.reference)
        expect(requestBody.characteristicIds).members(newBedspace.characteristicIds)
        expect(requestBody.notes.replaceAll('\r\n', '\n')).equal(newBedspace.notes)
        expect(requestBody.startDate).equal(newBedspace.startDate)
      })

      // And I should be redirected to the show bedspace page
      const bedspaceShowPage = Page.verifyOnPage(BedspaceShowPage, premises, bedspace)
      bedspaceShowPage.shouldShowBanner('Bedspace added')
    })

    it('should allow me to navigate to the new bedspace page from a premises with no bedspaces', () => {
      // And there is an online premises with no bedspaces in the database
      premises = cas3PremisesFactory.build({
        status: 'online',
        totalOnlineBedspaces: 0,
        totalArchivedBedspaces: 0,
        totalUpcomingBedspaces: 0,
      })
      const bedspaces = cas3BedspacesFactory.build({
        bedspaces: [],
        totalOnlineBedspaces: 0,
        totalArchivedBedspaces: 0,
        totalUpcomingBedspaces: 0,
      })
      cy.task('stubSinglePremisesV2', premises)
      cy.task('stubPremisesBedspacesV2', { premisesId: premises.id, bedspaces })

      // When I navigate to the show premises page
      const premisesPage = PremisesShowPage.visit(premises)

      // And click on the bedspaces tab
      premisesPage.clickBedspacesOverviewTab()

      // And click on the "Add a bedspace" link
      premisesPage.clickNewBedspaceLink()

      // Then I should be taken to the add bedspace page
      Page.verifyOnPage(BedspaceNewPage, premises)
    })

    describe('shows errors', () => {
      it('when no bedspace reference is entered', () => {
        // When I visit the new bedspace page
        const page = BedspaceNewPage.visit(premises)

        // And I miss required fields
        cy.task('stubBedspaceCreateErrors', { premisesId: premises.id, errors: [{ field: 'reference' }] })
        page.clickSubmit()

        // Then I should see error messages relating to those fields
        page.shouldShowErrorMessagesForFields(['reference'])
      })

      it('when an invalid bedspace start date is entered', () => {
        // When I visit the new bedspace page
        const page = BedspaceNewPage.visit(premises)

        // And I enter an invalid date
        cy.task('stubBedspaceCreateErrors', {
          premisesId: premises.id,
          errors: [{ field: 'startDate', type: 'invalid' }],
        })
        page.clickSubmit()

        // Then I should see error messages relating to those fields
        page.shouldShowErrorMessagesForFields(['startDate'], 'invalid')
      })
    })
  })

  describe('viewing a bedspace', () => {
    it('shows the property summary with property details', () => {
      // And there is an active premises in the database
      const premises = cas3PremisesFactory.build({
        status: 'online',
        characteristics: characteristicFactory.buildList(5),
      })
      // And there is an online bedspace in the database
      const bedspace = cas3BedspaceFactory.build({ status: 'online', startDate: '2024-01-02' })
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
      cy.task('stubSinglePremisesV2', premises)
      cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace })
      cy.task('stubBookingsForPremisesId', { premisesId: premises.id, bookings })
      cy.task('stubLostBedsForPremisesId', { premisesId: premises.id, lostBeds })

      // When I visit the show bedspace page
      const page = BedspaceShowPage.visit(premises, bedspace)

      // Then I should see the property address and details
      page.shouldShowPropertyAddress()
      page.shouldShowPropertyDetails()
    })

    it('shows the property summary without property details', () => {
      // And there is an active premises in the database
      const premises = cas3PremisesFactory.build({
        status: 'online',
        characteristics: [],
      })
      // And there is an online bedspace in the database
      const bedspace = cas3BedspaceFactory.build({ status: 'online', startDate: '2024-01-02' })
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
      cy.task('stubSinglePremisesV2', premises)
      cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace })
      cy.task('stubBookingsForPremisesId', { premisesId: premises.id, bookings })
      cy.task('stubLostBedsForPremisesId', { premisesId: premises.id, lostBeds })

      // When I visit the show bedspace page
      const page = BedspaceShowPage.visit(premises, bedspace)

      // Then I should see the property address and details
      page.shouldShowPropertyAddress()
      page.shouldShowNoPropertyDetails()
    })

    it('shows an online bedspace', () => {
      // And there is an active premises in the database
      const premises = cas3PremisesFactory.build({ status: 'online' })
      // And there is an online bedspace in the database
      const bedspace = cas3BedspaceFactory.build({ status: 'online', startDate: '2024-01-02' })
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

      cy.task('stubSinglePremisesV2', premises)
      cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace })
      cy.task('stubBookingsForPremisesId', { premisesId: premises.id, bookings })
      cy.task('stubLostBedsForPremisesId', { premisesId: premises.id, lostBeds })

      // When I visit the show bedspace page
      const page = BedspaceShowPage.visit(premises, bedspace)

      // Then I should see the bedspace details
      page.shouldShowStatus('Online')
      page.shouldShowStartDate('2 January 2024')
      page.shouldShowDetails()
      page.shouldShowAdditionalDetails()
    })

    it('shows an archived bedspace', () => {
      // And there is an active premises in the database
      const premises = cas3PremisesFactory.build({ status: 'online' })
      // And there is an online bedspace in the database
      const bedspace = cas3BedspaceFactory.build({ status: 'archived', startDate: '2024-02-03' })
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

      cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace })
      cy.task('stubSinglePremisesV2', premises)
      cy.task('stubBookingsForPremisesId', { premisesId: premises.id, bookings })
      cy.task('stubLostBedsForPremisesId', { premisesId: premises.id, lostBeds })

      // When I visit the show bedspace page
      const page = BedspaceShowPage.visit(premises, bedspace)

      // Then I should see the bedspace details
      page.shouldShowStatus('Archived')
      page.shouldShowStartDate('3 February 2024')
      page.shouldShowDetails()
      page.shouldShowAdditionalDetails()
    })

    describe('cancel archive', () => {
      it('allows cancelling of an upcoming archive', () => {
        // And there is an active premises in the database
        const premises = cas3PremisesFactory.build({ status: 'online' })
        // And there is an online bedspace in the database scheduled for archive
        const bedspace = cas3BedspaceFactory.build({
          status: 'online',
          startDate: '2024-02-03',
          endDate: '2026-08-01',
        })
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
        cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace })
        cy.task('stubSinglePremisesV2', premises)
        cy.task('stubBookingsForPremisesId', { premisesId: premises.id, bookings })
        cy.task('stubLostBedsForPremisesId', { premisesId: premises.id, lostBeds })

        // And the premises totals are stubbed
        const totals = { premisesEndDate: null, status: 'online' } as Cas3PremisesBedspaceTotals
        cy.task('stubPremisesBedspaceTotalsV2', { premisesId: premises.id, totals })

        // When I visit the show bedspace page
        const page = BedspaceShowPage.visit(premises, bedspace)

        // When I click the cancel archive action
        page.clickAction('Cancel scheduled bedspace archive')

        // Then I should see the cancel archive confirmation page
        page.shouldShowCancelArchive(bedspace)

        // And when I confirm cancellation
        cy.task('stubBedspaceCancelArchive', { premisesId: premises.id, bedspace })
        cy.task('stubBedspaceV2', {
          premisesId: premises.id,
          bedspace: { ...bedspace, status: 'online', endDate: undefined },
        })
        page.confirmCancelArchive()

        // Then I should be redirected to the bedspace page with the archive cancelled
        const updatedBedspace = { ...bedspace, status: 'online' as Cas3BedspaceStatus, endDate: undefined }
        Page.verifyOnPage(BedspaceShowPage, premises, updatedBedspace)
        page.shouldShowBanner('Bedspace archive cancelled')
      })

      it('shows the premise archive message if the premises is scheduled to be archived', () => {
        // And there is an active premises in the database
        const premises = cas3PremisesFactory.build({ status: 'online' })
        // And there is an online bedspace in the database scheduled for archive
        const bedspace = cas3BedspaceFactory.build({
          status: 'online',
          startDate: '2024-02-03',
          endDate: '2026-08-01',
        })
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

        cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace })
        cy.task('stubSinglePremisesV2', premises)
        cy.task('stubBookingsForPremisesId', { premisesId: premises.id, bookings })
        cy.task('stubLostBedsForPremisesId', { premisesId: premises.id, lostBeds })

        // And the premises totals are stubbed
        const totals = { premisesEndDate: '2126-08-01', status: 'online' } as Cas3PremisesBedspaceTotals
        cy.task('stubPremisesBedspaceTotalsV2', { premisesId: premises.id, totals })

        // When I visit the show bedspace page
        const page = BedspaceShowPage.visit(premises, bedspace)

        // And I click the cancel archive action
        page.clickAction('Cancel scheduled bedspace archive')

        // Then I should see the cancel archive confirmation page
        page.shouldShowCancelArchive(bedspace)

        // And I should see the extra archive message
        cy.get('main').contains('The scheduled archive of the property and any other bedspaces will also be cancelled.')
      })

      it('shows an error if cancelling the archive fails', () => {
        // And there is an active premises in the database
        const premises = cas3PremisesFactory.build({ status: 'online' })
        // And there is an online bedspace in the database scheduled for archive
        const bedspace = cas3BedspaceFactory.build({
          status: 'online',
          startDate: '2024-02-03',
          endDate: '2126-08-01',
        })
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

        cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace })
        cy.task('stubSinglePremisesV2', premises)
        cy.task('stubBookingsForPremisesId', { premisesId: premises.id, bookings })
        cy.task('stubLostBedsForPremisesId', { premisesId: premises.id, lostBeds })

        // And the premises totals are stubbed
        const totals = { premisesEndDate: null, status: 'online' } as Cas3PremisesBedspaceTotals
        cy.task('stubPremisesBedspaceTotalsV2', { premisesId: premises.id, totals })

        const page = BedspaceShowPage.visit(premises, bedspace)

        // When I click the cancel archive action
        page.clickAction('Cancel scheduled bedspace archive')

        // Then I should see the cancel archive confirmation page
        page.shouldShowCancelArchive(bedspace)

        // And when I confirm cancellation
        cy.task('stubBedspaceCancelArchiveError', { premisesId: premises.id, bedspace })
        page.confirmCancelArchive()

        // Then I should see error messages
        page.shouldShowErrorMessagesForFields(['bedspaceId'], 'bedspaceNotScheduledToArchive')
      })
    })

    it('shows an upcoming bedspace', () => {
      // And there is an active premises in the database
      const premises = cas3PremisesFactory.build({ status: 'online' })
      // And there is an online bedspace in the database
      const bedspace = cas3BedspaceFactory.build({ status: 'upcoming', startDate: '2024-03-04' })
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

      cy.task('stubSinglePremisesV2', premises)
      cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace })
      cy.task('stubBookingsForPremisesId', { premisesId: premises.id, bookings })
      cy.task('stubLostBedsForPremisesId', { premisesId: premises.id, lostBeds })

      // When I visit the show bedspace page
      const page = BedspaceShowPage.visit(premises, bedspace)

      // Then I should see the bedspace details
      page.shouldShowStatus('Upcoming')
      page.shouldShowStartDate('4 March 2024')
      page.shouldShowDetails()
      page.shouldShowAdditionalDetails()
    })
  })

  describe('editing a bedspace', () => {
    it('should navigate to the edit bedspace page from the show bedspace page', () => {
      // And there is online premises in the database with an online bedspace
      const bedspace = cas3BedspaceFactory.build({ status: 'online' })
      const premises = cas3PremisesFactory.build({ status: 'online' })
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

      cy.task('stubSinglePremisesV2', premises)
      cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace })
      cy.task('stubBookingsForPremisesId', { premisesId: premises.id, bookings })
      cy.task('stubLostBedsForPremisesId', { premisesId: premises.id, lostBeds })

      // When I visit the show bedspace page
      const showPage = BedspaceShowPage.visit(premises, bedspace)

      // And click on the "Edit bedspace details" action
      showPage.clickAction('Edit bedspace details')

      // Then I should see the edit bedspace page
      Page.verifyOnPage(BedspaceEditPage)
    })

    it('should show the existing bedspace information on the edit page', () => {
      // And there is an online premises in the database with an online bedspace
      const characteristics: Array<Characteristic> = [
        {
          id: '12e2e689-b3fb-469d-baec-2fb68e15e85b',
          name: 'Single bed',
          serviceScope: 'temporary-accommodation',
          modelScope: 'room',
        },
        {
          id: '7dd3bac5-3d1c-4acb-b110-b1614b2c95d8',
          name: 'Shared kitchen',
          serviceScope: 'temporary-accommodation',
          modelScope: 'room',
        },
      ]
      const bedspace = cas3BedspaceFactory.build({ status: 'online', characteristics })
      const premises = cas3PremisesFactory.build({ status: 'online' })
      cy.task('stubSinglePremisesV2', premises)
      cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace })

      // When I visit the edit bedspace page
      const page = BedspaceEditPage.visit(premises, bedspace)

      // Then I should see the existing bedspace information
      page.shouldShowPropertySummary(premises)
      page.validateEnteredInformation(bedspace)
    })

    it('should redirect to the existing bedspace when the bedspace is updated successfully', () => {
      // And there is an online premises in the database with an online bedspace
      const characteristics: Array<Characteristic> = [
        {
          id: '12e2e689-b3fb-469d-baec-2fb68e15e85b',
          name: 'Single bed',
          serviceScope: 'temporary-accommodation',
          modelScope: 'room',
        },
        {
          id: '7dd3bac5-3d1c-4acb-b110-b1614b2c95d8',
          name: 'Shared kitchen',
          serviceScope: 'temporary-accommodation',
          modelScope: 'room',
        },
      ]
      const bedspace = cas3BedspaceFactory.build({ status: 'online', characteristics })
      const premises = cas3PremisesFactory.build({ status: 'online' })
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

      cy.task('stubSinglePremisesV2', premises)
      cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace })
      cy.task('stubBookingsForPremisesId', { premisesId: premises.id, bookings })
      cy.task('stubLostBedsForPremisesId', { premisesId: premises.id, lostBeds })

      // When I visit the edit bedspace page
      const page = BedspaceEditPage.visit(premises, bedspace)

      // And update the bedspace details
      const updatedCharacteristics: Array<Characteristic> = [
        {
          id: 'e730bdea-6157-4910-b1b0-450b29bf0c9f',
          name: 'Shared bathroom',
          serviceScope: 'temporary-accommodation',
          modelScope: 'room',
        },
        {
          id: '08b756e2-0b82-4f49-a124-35ea4ebb1634',
          name: 'Double bed',
          serviceScope: 'temporary-accommodation',
          modelScope: 'room',
        },
      ]
      const updatedBedspace = cas3UpdateBedspaceFactory.build({
        characteristicIds: updatedCharacteristics.map(ch => ch.id),
      })
      page.clearForm()
      page.enterReference(updatedBedspace.reference)
      page.enterCharacteristics(updatedCharacteristics.map(ch => ch.name))
      page.enterAdditionalDetails(updatedBedspace.notes)

      // And the backend responds with 200 ok
      const expectedBedspace = cas3BedspaceFactory.build({
        ...bedspace,
        ...updatedBedspace,
        characteristics: updatedCharacteristics,
      })
      cy.task('stubBedspaceUpdate', { premisesId: premises.id, bedspace })
      cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace: expectedBedspace })

      // When I submit the form
      page.clickSubmit()

      // Then the bedspace should have been updated in the backend
      cy.task('verifyBedspaceUpdate', { premisesId: premises.id, bedspaceId: bedspace.id }).then(requests => {
        expect(requests).to.have.length(1)
        const requestBody = JSON.parse(requests[0].body)

        expect(requestBody.reference).equal(updatedBedspace.reference)
        expect(requestBody.characteristicIds).members(updatedBedspace.characteristicIds)
        expect(requestBody.notes).equal(updatedBedspace.notes)
      })

      // And I should be taken to the existing updated bedspace
      const showPage = Page.verifyOnPage(BedspaceShowPage, premises, expectedBedspace)

      // And I should see the "Bedspace updated" banner
      showPage.shouldShowBedspaceUpdatedBanner()

      // And I should see the bedspace details
      showPage.shouldShowStatus('Online')
      showPage.shouldShowDetails()
      showPage.shouldShowAdditionalDetails()
    })

    it('should show errors when editing a bedspace fails', () => {
      // And there is an online premises in the database with an online bedspace
      const characteristics: Array<Characteristic> = [
        {
          id: '12e2e689-b3fb-469d-baec-2fb68e15e85b',
          name: 'Single bed',
          serviceScope: 'temporary-accommodation',
          modelScope: 'room',
        },
        {
          id: '7dd3bac5-3d1c-4acb-b110-b1614b2c95d8',
          name: 'Shared kitchen',
          serviceScope: 'temporary-accommodation',
          modelScope: 'room',
        },
      ]
      const bedspace = cas3BedspaceFactory.build({ status: 'online', characteristics })
      const premises = cas3PremisesFactory.build({ status: 'online' })
      cy.task('stubSinglePremisesV2', premises)
      cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace })

      // When I visit the edit bedspace page
      const page = BedspaceEditPage.visit(premises, bedspace)

      // And clear the bedspace reference
      page.getTextInputByIdAndClear('reference')

      // And the backend responds with 400
      cy.task('stubBedspaceUpdateErrors', {
        premisesId: premises.id,
        bedspaceId: bedspace.id,
        fields: ['reference'],
      })

      // When the form is submitted
      page.clickSubmit()

      // Then I should be returned to the edit bedspace page
      Page.verifyOnPage(BedspaceEditPage)

      // And I should see an error message for the missing reference
      page.shouldShowErrorMessagesForFields(['reference'], 'empty')

      // And I should see the previous bedspace information
      page.validateEnteredCharacteristics(bedspace.characteristics.map(ch => ch.name))
      page.validateEnteredAdditionalDetails(bedspace.notes)
    })
  })

  describe('archiving a bedspace', () => {
    it('navigates to archive page when can-archive allows it, and archives successfully with success message based on the API response', () => {
      // Given there is an active premises in the database
      const premises = cas3PremisesFactory.build({ status: 'online' })
      // And there is an online bedspace in the database
      const bedspace = cas3BedspaceFactory.build({ status: 'online' })
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

      cy.task('stubSinglePremisesV2', premises)
      cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace })
      cy.task('stubBookingsForPremisesId', { premisesId: premises.id, bookings })
      cy.task('stubLostBedsForPremisesId', { premisesId: premises.id, lostBeds })

      // And the bedspace can be archived
      cy.task('stubBedspaceCanArchiveV2', { premisesId: premises.id, bedspaceId: bedspace.id })

      // When I visit the show bedspace page
      const bedspaceShowPage = BedspaceShowPage.visit(premises, bedspace)

      // Then I should see the archive button and be able to click it
      bedspaceShowPage.clickArchiveLink()

      // And I should navigate to the archive bedspace page
      const archivePage = Page.verifyOnPage(BedspaceArchivePage, premises, bedspace)
      archivePage.shouldShowBedspaceDetails()

      // When I archive with today option
      cy.task('stubBedspaceArchiveV2', { premisesId: premises.id, bedspaceId: bedspace.id })
      const archivedBedspace = { ...bedspace, status: 'archived' }
      cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace: archivedBedspace })
      archivePage.completeArchiveWithToday()

      // Then I should be redirected to the bedspace show page with success message based on the API response
      const finalBedspaceShowPage = Page.verifyOnPage(BedspaceShowPage, premises, archivedBedspace)
      finalBedspaceShowPage.shouldShowBanner('Bedspace archived')
      finalBedspaceShowPage.shouldShowAsArchived()
      finalBedspaceShowPage.shouldNotShowArchiveLink()
    })

    it('shows cannot archive page when bedspace has blocking booking/void', () => {
      // Given there is an active premises in the database
      const premises = cas3PremisesFactory.build({ status: 'online' })
      // And there is an online bedspace in the database
      const bedspace = cas3BedspaceFactory.build({ status: 'online' })
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

      cy.task('stubSinglePremisesV2', premises)
      cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace })
      cy.task('stubBookingsForPremisesId', { premisesId: premises.id, bookings })
      cy.task('stubLostBedsForPremisesId', { premisesId: premises.id, lostBeds })

      // And the bedspace cannot be archived due to blocking booking/void
      cy.task('stubBedspaceCanArchiveV2WithBlocking', {
        premisesId: premises.id,
        bedspaceId: bedspace.id,
        blockingDate: '2025-08-28',
        entityId: 'some-entity-id',
        entityReference: 'some-reference',
      })

      // When I visit the show bedspace page
      const bedspaceShowPage = BedspaceShowPage.visit(premises, bedspace)

      // And I click the archive button
      bedspaceShowPage.clickArchiveLink()

      // Then I should be redirected to the cannot archive page
      const cannotArchivePage = Page.verifyOnPage(BedspaceCannotArchivePage, bedspace.reference)
      cannotArchivePage.shouldShowCannotArchiveMessage()
      cannotArchivePage.shouldShowReturnButton()

      // When I click the return button
      cannotArchivePage.clickReturnToBedspaceDetails()

      // Then I should be back on the bedspace show page
      Page.verifyOnPage(BedspaceShowPage, premises, bedspace)
    })

    it('navigates to archive page, and fails to archive with error based on the API response', () => {
      // Given there is an active premises in the database
      const premises = cas3PremisesFactory.build({ status: 'online' })
      // And there is an online bedspace in the database
      const bedspace = cas3BedspaceFactory.build({ status: 'online' })
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

      cy.task('stubSinglePremisesV2', premises)
      cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace })
      cy.task('stubBookingsForPremisesId', { premisesId: premises.id, bookings })
      cy.task('stubLostBedsForPremisesId', { premisesId: premises.id, lostBeds })

      // And the bedspace can be archived
      cy.task('stubBedspaceCanArchiveV2', { premisesId: premises.id, bedspaceId: bedspace.id })

      // When I visit the show bedspace page
      const bedspaceShowPage = BedspaceShowPage.visit(premises, bedspace)

      // Then I should see the archive button and be able to click it
      bedspaceShowPage.clickArchiveLink()

      // And I should navigate to the archive bedspace page
      const archivePage = Page.verifyOnPage(BedspaceArchivePage, premises, bedspace)
      archivePage.shouldShowBedspaceDetails()

      // When I try to archive with past date
      cy.task('stubBedspaceArchiveV2WithError', {
        premisesId: premises.id,
        bedspaceId: bedspace.id,
        errorType: 'invalidEndDateInThePast',
      })

      // Select another date option and enter a past date (1/1/1900)
      archivePage.selectAnotherDateOption()
      archivePage.enterArchiveDate('1', '1', '1900')
      archivePage.clickSubmit()

      // Then I should see the validation error based on the API response
      archivePage.shouldShowError('The date is not within the next 3 months')
    })
  })

  describe('unarchiving a bedspace', () => {
    it('navigates to unarchive page, and unarchives successfully with success message based on the API response', () => {
      // Given there is an active premises in the database
      const premises = cas3PremisesFactory.build({ status: 'online' })
      // And there is an archived bedspace in the database
      const bedspace = cas3BedspaceFactory.build({ status: 'archived' })
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

      cy.task('stubSinglePremisesV2', premises)
      cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace })
      cy.task('stubBookingsForPremisesId', { premisesId: premises.id, bookings })
      cy.task('stubLostBedsForPremisesId', { premisesId: premises.id, lostBeds })

      // When I visit the show bedspace page
      const bedspaceShowPage = BedspaceShowPage.visit(premises, bedspace)

      // Then I should see the archive button and be able to click it
      bedspaceShowPage.clickUnarchiveLink()

      // And I should navigate to the unarchive bedspace page
      const unarchivePage = Page.verifyOnPage(BedspaceUnarchivePage, premises, bedspace)
      unarchivePage.shouldShowBedspaceDetails()

      // When I unarchive with today option
      cy.task('stubBedspaceUnarchiveV2', { premisesId: premises.id, bedspaceId: bedspace.id })
      const unarchivedBedspace = { ...bedspace, status: 'online' }
      cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace: unarchivedBedspace })
      unarchivePage.completeUnarchiveWithToday()

      // Then I should be redirected to the bedspace show page with success message based on the API response
      const finalBedspaceShowPage = Page.verifyOnPage(BedspaceShowPage, premises, unarchivedBedspace)
      finalBedspaceShowPage.shouldShowBanner('Bedspace online')
      finalBedspaceShowPage.shouldShowAsOnline()
      finalBedspaceShowPage.shouldShowArchiveLink()
    })

    it('navigates to unarchive page, and fails to archive with error based on the API response', () => {
      // Given there is an active premises in the database
      const premises = cas3PremisesFactory.build({ status: 'online' })
      // And there is an archived bedspace in the database
      const bedspace = cas3BedspaceFactory.build({ status: 'archived' })
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

      cy.task('stubSinglePremisesV2', premises)
      cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace })
      cy.task('stubBookingsForPremisesId', { premisesId: premises.id, bookings })
      cy.task('stubLostBedsForPremisesId', { premisesId: premises.id, lostBeds })

      // When I visit the show bedspace page
      const bedspaceShowPage = BedspaceShowPage.visit(premises, bedspace)

      // Then I should see the unarchive button and be able to click it
      bedspaceShowPage.clickUnarchiveLink()

      // And I should navigate to the unarchive bedspace page
      const unarchivePage = Page.verifyOnPage(BedspaceUnarchivePage, premises, bedspace)
      unarchivePage.shouldShowBedspaceDetails()

      // When I try to unarchive with past date
      cy.task('stubBedspaceUnarchiveV2WithError', {
        premisesId: premises.id,
        bedspaceId: bedspace.id,
        errorType: 'invalidEndDateInThePast',
      })

      // Select another date option and enter a past date (1/1/1900)
      unarchivePage.selectAnotherDateOption()
      unarchivePage.enterArchiveDate('1', '1', '1900')
      unarchivePage.clickSubmit()

      // Then I should see the validation error based on the API response
      unarchivePage.shouldShowError('The restart date must be after the last archive end date')
    })
  })
})
