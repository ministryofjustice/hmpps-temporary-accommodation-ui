import { Cas3Premises } from '@approved-premises/api'
import {
  cas3BedspaceFactory,
  cas3NewBedspaceFactory,
  cas3PremisesFactory,
  cas3PremisesSearchResultFactory,
  cas3PremisesSearchResultsFactory,
  characteristicFactory,
} from '../../../../../server/testutils/factories'
import BedspaceNewPage from '../../../../../cypress_shared/pages/temporary-accommodation/manage/v2/bedspaceNew'

import BedspaceShowPage from '../../../../../cypress_shared/pages/temporary-accommodation/manage/v2/bedspaceShow'
import { setupTestUser } from '../../../../../cypress_shared/utils/setupTestUser'
import PremisesListPage from '../../../../../cypress_shared/pages/temporary-accommodation/manage/v2/premisesList'
import Page from '../../../../../cypress_shared/pages/page'

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
    const searchResult = cas3PremisesSearchResultFactory.build({ ...premises, bedspaces: [bedspaceSummary] })
    const searchResults = cas3PremisesSearchResultsFactory.build({ results: [searchResult] })
    cy.task('stubSinglePremisesV2', premises)
    cy.task('stubPremisesSearchV2', { searchResults, postcodeOrAddress: '', premisesStatus: 'online' })

    // And there is an online bedspace in the database for that premises
    cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace })

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

  describe('creating a bedspace', () => {
    let premises: Cas3Premises
    let page: BedspaceNewPage

    beforeEach(() => {
      // When I visit the new bedspace page
      premises = cas3PremisesFactory.build({ status: 'online' })

      cy.task('stubSinglePremisesV2', premises)
      page = BedspaceNewPage.visit(premises)
    })

    it('allows me to create a bedspace', () => {
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

      cy.task('stubBedspaceCreate', { premisesId: premises.id, bedspace })
      cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace })

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
      bedspaceShowPage.shouldShowBanner('Bedspace created')
    })

    describe('shows errors', () => {
      it('when no bedspace reference is entered', () => {
        // And I miss required fields
        cy.task('stubBedspaceCreateErrors', { premisesId: premises.id, errors: [{ field: 'reference' }] })
        page.clickSubmit()

        // Then I should see error messages relating to those fields
        page.shouldShowErrorMessagesForFields(['reference'])
      })

      it('when an invalid bedspace start date is entered', () => {
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
      cy.task('stubSinglePremisesV2', premises)

      // And there is an online bedspace in the database
      const bedspace = cas3BedspaceFactory.build({ status: 'online', startDate: '2024-01-02' })
      cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace })

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
      cy.task('stubSinglePremisesV2', premises)

      // And there is an online bedspace in the database
      const bedspace = cas3BedspaceFactory.build({ status: 'online', startDate: '2024-01-02' })
      cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace })

      // When I visit the show bedspace page
      const page = BedspaceShowPage.visit(premises, bedspace)

      // Then I should see the property address and details
      page.shouldShowPropertyAddress()
      page.shouldShowNoPropertyDetails()
    })

    it('shows an online bedspace', () => {
      // And there is an active premises in the database
      const premises = cas3PremisesFactory.build({ status: 'online' })
      cy.task('stubSinglePremisesV2', premises)

      // And there is an online bedspace in the database
      const bedspace = cas3BedspaceFactory.build({ status: 'online', startDate: '2024-01-02' })
      cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace })

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
      cy.task('stubSinglePremisesV2', premises)

      // And there is an online bedspace in the database
      const bedspace = cas3BedspaceFactory.build({ status: 'archived', startDate: '2024-02-03' })
      cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace })

      // When I visit the show bedspace page
      const page = BedspaceShowPage.visit(premises, bedspace)

      // Then I should see the bedspace details
      page.shouldShowStatus('Archived')
      page.shouldShowStartDate('3 February 2024')
      page.shouldShowDetails()
      page.shouldShowAdditionalDetails()
    })

    it('shows an upcoming bedspace', () => {
      // And there is an active premises in the database
      const premises = cas3PremisesFactory.build({ status: 'online' })
      cy.task('stubSinglePremisesV2', premises)

      // And there is an online bedspace in the database
      const bedspace = cas3BedspaceFactory.build({ status: 'upcoming', startDate: '2024-03-04' })
      cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace })

      // When I visit the show bedspace page
      const page = BedspaceShowPage.visit(premises, bedspace)

      // Then I should see the bedspace details
      page.shouldShowStatus('Upcoming')
      page.shouldShowStartDate('4 March 2024')
      page.shouldShowDetails()
      page.shouldShowAdditionalDetails()
    })
  })
})
