import { setupTestUser } from '../../../../../cypress_shared/utils/setupTestUser'
import Page from '../../../../../cypress_shared/pages/page'
import BedspaceShowPage from '../../../../../cypress_shared/pages/temporary-accommodation/manage/v2/bedspaceShow'
import BedspaceArchivePage from '../../../../../cypress_shared/pages/temporary-accommodation/manage/v2/bedspaceArchive'
import { cas3BedspaceFactory, cas3PremisesFactory } from '../../../../../server/testutils/factories'

context('Bedspace Archive', () => {
  beforeEach(() => {
    cy.task('reset')
    setupTestUser('assessor')

    // Given I am signed in
    cy.signIn()

    // And there is reference data in the database
    cy.task('stubPremisesReferenceData')
    cy.task('stubRoomReferenceData')
  })

  it('Archives bedspace with today date option and shows success message', () => {
    // Given there is an active premises in the database
    const premises = cas3PremisesFactory.build({ status: 'online' })
    cy.task('stubSinglePremisesV2', premises)

    // And there is an online bedspace in the database
    const bedspace = cas3BedspaceFactory.build({ status: 'online' })
    cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace })

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

  it('uses the archive endpoint when user selects another date option and submits', () => {
    // Given there is an active premises in the database
    const premises = cas3PremisesFactory.build({ status: 'online' })
    cy.task('stubSinglePremisesV2', premises)

    // And there is an online bedspace in the database
    const bedspace = cas3BedspaceFactory.build({ status: 'online' })
    cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace })

    // When I visit the show bedspace page
    const bedspaceShowPage = BedspaceShowPage.visit(premises, bedspace)

    // Then I should see the archive button and be able to click it
    bedspaceShowPage.clickArchiveLink()

    // And I should navigate to the archive bedspace page
    const archivePage = Page.verifyOnPage(BedspaceArchivePage, premises, bedspace)
    archivePage.shouldShowBedspaceDetails()

    // When I set up the API stub (success response)
    cy.task('stubBedspaceArchiveV2', { premisesId: premises.id, bedspaceId: bedspace.id })
    const archivedBedspace = { ...bedspace, status: 'archived' }
    cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace: archivedBedspace })

    // And I select the another date option and enter a specific date
    archivePage.selectAnotherDateOption()
    archivePage.enterArchiveDate('15', '3', '2025')
    archivePage.clickSubmit()

    // Then the API should be called and I should be redirected with success
    const finalBedspaceShowPage = Page.verifyOnPage(BedspaceShowPage, premises, archivedBedspace)
    finalBedspaceShowPage.shouldShowBanner('Bedspace archived')
  })

  it('fails to archive with invalidEndDateInThePast error', () => {
    // Given there is an active premises in the database
    const premises = cas3PremisesFactory.build({ status: 'online' })
    cy.task('stubSinglePremisesV2', premises)

    // And there is an online bedspace in the database
    const bedspace = cas3BedspaceFactory.build({ status: 'online' })
    cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace })

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

  it('fails to archive with invalidEndDateInTheFuture error', () => {
    // Given there is an active premises in the database
    const premises = cas3PremisesFactory.build({ status: 'online' })
    cy.task('stubSinglePremisesV2', premises)

    // And there is an online bedspace in the database
    const bedspace = cas3BedspaceFactory.build({ status: 'online' })
    cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace })

    // When I visit the show bedspace page
    const bedspaceShowPage = BedspaceShowPage.visit(premises, bedspace)

    // Then I should see the archive button and be able to click it
    bedspaceShowPage.clickArchiveLink()

    // And I should navigate to the archive bedspace page
    const archivePage = Page.verifyOnPage(BedspaceArchivePage, premises, bedspace)
    archivePage.shouldShowBedspaceDetails()

    // When I try to archive with future date beyond 3 months
    cy.task('stubBedspaceArchiveV2WithError', {
      premisesId: premises.id,
      bedspaceId: bedspace.id,
      errorType: 'invalidEndDateInTheFuture',
    })

    // Select another date option and enter a far future date
    archivePage.selectAnotherDateOption()
    archivePage.enterArchiveDate('1', '1', '2100')
    archivePage.clickSubmit()

    // Then I should see the validation error based on the API response
    archivePage.shouldShowError('The date is not within the next 3 months')
  })

  it('fails to archive with existingBookings error', () => {
    // Given there is an active premises in the database
    const premises = cas3PremisesFactory.build({ status: 'online' })
    cy.task('stubSinglePremisesV2', premises)

    // And there is an online bedspace in the database
    const bedspace = cas3BedspaceFactory.build({ status: 'online' })
    cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace })

    // When I visit the show bedspace page
    const bedspaceShowPage = BedspaceShowPage.visit(premises, bedspace)

    // Then I should see the archive button and be able to click it
    bedspaceShowPage.clickArchiveLink()

    // And I should navigate to the archive bedspace page
    const archivePage = Page.verifyOnPage(BedspaceArchivePage, premises, bedspace)
    archivePage.shouldShowBedspaceDetails()

    // When I try to archive but there are existing bookings
    cy.task('stubBedspaceArchiveV2WithError', {
      premisesId: premises.id,
      bedspaceId: bedspace.id,
      errorType: 'existingBookings',
    })

    // Archive with today option
    archivePage.completeArchiveWithToday()

    // Then I should see the validation error based on the API response
    archivePage.shouldShowError('This bedspace cannot be archived due to existing bookings after this date.')
  })

  it('fails to archive with existingVoid error', () => {
    // Given there is an active premises in the database
    const premises = cas3PremisesFactory.build({ status: 'online' })
    cy.task('stubSinglePremisesV2', premises)

    // And there is an online bedspace in the database
    const bedspace = cas3BedspaceFactory.build({ status: 'online' })
    cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace })

    // When I visit the show bedspace page
    const bedspaceShowPage = BedspaceShowPage.visit(premises, bedspace)

    // Then I should see the archive button and be able to click it
    bedspaceShowPage.clickArchiveLink()

    // And I should navigate to the archive bedspace page
    const archivePage = Page.verifyOnPage(BedspaceArchivePage, premises, bedspace)
    archivePage.shouldShowBedspaceDetails()

    // When I try to archive but there is an existing void period
    cy.task('stubBedspaceArchiveV2WithError', {
      premisesId: premises.id,
      bedspaceId: bedspace.id,
      errorType: 'existingVoid',
    })

    // Archive with today option
    archivePage.completeArchiveWithToday()

    // Then I should see the validation error based on the API response
    archivePage.shouldShowError('This bedspace cannot be archived due to a void period after this date.')
  })

  it('fails to archive with existingTurnaround error', () => {
    // Given there is an active premises in the database
    const premises = cas3PremisesFactory.build({ status: 'online' })
    cy.task('stubSinglePremisesV2', premises)

    // And there is an online bedspace in the database
    const bedspace = cas3BedspaceFactory.build({ status: 'online' })
    cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace })

    // When I visit the show bedspace page
    const bedspaceShowPage = BedspaceShowPage.visit(premises, bedspace)

    // Then I should see the archive button and be able to click it
    bedspaceShowPage.clickArchiveLink()

    // And I should navigate to the archive bedspace page
    const archivePage = Page.verifyOnPage(BedspaceArchivePage, premises, bedspace)
    archivePage.shouldShowBedspaceDetails()

    // When I try to archive but there is an existing turnaround
    cy.task('stubBedspaceArchiveV2WithError', {
      premisesId: premises.id,
      bedspaceId: bedspace.id,
      errorType: 'existingTurnaround',
    })

    // Archive with today option
    archivePage.completeArchiveWithToday()

    // Then I should see the validation error based on the API response
    archivePage.shouldShowError('This bedspace cannot be archived due to a turnaround scheduled after this date.')
  })
})
