import {
  cas3BedspaceFactory,
  cas3PremisesFactory,
  cas3PremisesSearchResultFactory,
  cas3PremisesSearchResultsFactory,
  characteristicFactory,
} from '../../../../../server/testutils/factories'
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
    cy.task('stubPremisesShowV2', premises)
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

  describe('viewing a bedspace', () => {
    it('shows the property summary with property details', () => {
      // And there is an active premises in the database
      const premises = cas3PremisesFactory.build({
        status: 'online',
        characteristics: characteristicFactory.buildList(5),
      })
      cy.task('stubPremisesShowV2', premises)

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
      cy.task('stubPremisesShowV2', premises)

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
      cy.task('stubPremisesShowV2', premises)

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
      cy.task('stubPremisesShowV2', premises)

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
      cy.task('stubPremisesShowV2', premises)

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
