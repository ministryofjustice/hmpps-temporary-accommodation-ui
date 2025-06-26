import Page from '../../../../../cypress_shared/pages/page'
import DashboardPage from '../../../../../cypress_shared/pages/temporary-accommodation/dashboardPage'
import PremisesListPage from '../../../../../cypress_shared/pages/temporary-accommodation/manage/v2/premisesList'
import { setupTestUser } from '../../../../../cypress_shared/utils/setupTestUser'
import {
  cas3PremisesSearchResultFactory,
  cas3PremisesSearchResultsFactory,
} from '../../../../../server/testutils/factories'

context('Premises', () => {
  beforeEach(() => {
    cy.task('reset')
    setupTestUser('assessor')
  })

  it('should list all premises and sort by PDU or status', () => {
    // Given I am signed in
    cy.signIn()

    // And there are premises in the database
    const searchResults = cas3PremisesSearchResultsFactory.build({
      results: cas3PremisesSearchResultFactory.buildList(5),
    })
    cy.task('stubPremisesSearchV2', { searchResults, postcodeOrAddress: '', premisesStatus: 'online' })

    // When I visit the premises page
    const page = PremisesListPage.visitOnline()

    // Then I should see all the premises listed
    page.shouldShowPremises(searchResults.results)

    // And they should be sorted by PDU ascending
    page.checkColumnOrder('PDU', 'ascending')

    // When I sort by PDU
    page.sortColumn('PDU')

    // Then they should be sorted by PDU descending
    page.checkColumnOrder('PDU', 'descending')
  })

  it('should search premises by postcode and list them', () => {
    // Given I am signed in
    cy.signIn()

    // And there are premises in the database
    const postcode = 'NE1 1AB'
    const matchingSearchResults = cas3PremisesSearchResultsFactory.build({
      results: [
        cas3PremisesSearchResultFactory.build({ postcode }),
        cas3PremisesSearchResultFactory.build({ postcode }),
      ],
    })
    const searchResults = cas3PremisesSearchResultsFactory.build({
      results: [
        ...matchingSearchResults.results,
        cas3PremisesSearchResultFactory.build({ postcode: 'NE2 2BC' }),
        cas3PremisesSearchResultFactory.build({ postcode: 'NE3 3CD' }),
        cas3PremisesSearchResultFactory.build({ postcode: 'NE4 4DE', bedspaces: [] }),
      ],
    })
    cy.task('stubPremisesSearchV2', { searchResults, postcodeOrAddress: '', premisesStatus: 'online' })
    cy.task('stubPremisesSearchV2', {
      searchResults: matchingSearchResults,
      postcodeOrAddress: postcode,
      premisesStatus: 'online',
    })

    // When I visit the premises page
    const page = PremisesListPage.visitOnline()

    // Then I should see all the premises listed
    page.shouldShowPremises(searchResults.results)

    // When I search for the first postcode
    page.search(postcode)

    // Then only premises matching that postcode should be listed
    page.shouldShowOnlyPremises(matchingSearchResults.results)

    // When I clear the search field and search again
    page.clearSearch()

    // Then all the premises should be listed again
    page.shouldShowPremises(searchResults.results)
  })

  it('should show no results when searching for a postcode with no results', () => {
    // Given I am signed in
    cy.signIn()

    // And there are premises in the database
    const searchResults = cas3PremisesSearchResultsFactory.build({
      results: [
        cas3PremisesSearchResultFactory.build({ postcode: 'NE1 1AB' }),
        cas3PremisesSearchResultFactory.build({ postcode: 'NE2 2BC' }),
        cas3PremisesSearchResultFactory.build({ postcode: 'NE3 3CD' }),
        cas3PremisesSearchResultFactory.build({ postcode: 'NE4 4DE' }),
      ],
    })
    const matchingSearchResults = cas3PremisesSearchResultsFactory.build({
      results: [],
    })
    cy.task('stubPremisesSearchV2', { searchResults, postcodeOrAddress: '', premisesStatus: 'online' })
    cy.task('stubPremisesSearchV2', {
      searchResults: matchingSearchResults,
      postcodeOrAddress: 'SR6',
      premisesStatus: 'online',
    })

    // When I visit the premises page
    const page = PremisesListPage.visitOnline()

    // Then I should see all the premises listed
    page.shouldShowPremises(searchResults.results)

    // When I search for a postcode with no results
    page.search('SR6')

    // Then a 'no results' message should be shown
    page.shouldShowOnlyPremises([])
    page.shouldShowMessages(['0 online properties matching ‘SR6’'])

    // When I clear the search field and search again
    page.clearSearch()

    // Then all the premises should be listed again
    page.shouldShowPremises(searchResults.results)
  })

  it('should navigate back from the premises list page to the dashboard', () => {
    // Given I am signed in
    cy.signIn()

    // And there are premises in the database
    const searchResults = cas3PremisesSearchResultsFactory.build({
      results: cas3PremisesSearchResultFactory.buildList(5),
    })
    cy.task('stubPremisesSearchV2', { searchResults, postcodeOrAddress: '', premisesStatus: 'online' })

    // When I visit the premises list page
    const page = PremisesListPage.visitOnline()

    // And I click the previous bread crumb
    page.clickHome()

    // Then I navigate to the dashboard page
    Page.verifyOnPage(DashboardPage)
  })

  it('should display property and bedspace counts', () => {
    // Given I am signed in
    cy.signIn()

    // And there are premises in the database with specific counts
    const searchResults = cas3PremisesSearchResultsFactory.build({
      results: cas3PremisesSearchResultFactory.buildList(3),
      totalPremises: 3,
      totalOnlineBedspaces: 8,
      totalUpcomingBedspaces: 2,
    })
    cy.task('stubPremisesSearchV2', { searchResults, postcodeOrAddress: '', premisesStatus: 'online' })

    // When I visit the premises page
    PremisesListPage.visitOnline()

    // Then I should see the correct property count
    cy.contains('3 online properties').should('exist')

    // And I should see the correct bedspace counts
    cy.contains('Online bedspaces: 8').should('exist')
    cy.contains('Upcoming bedspaces: 2').should('exist')
  })

  it('should display property count with search term when searching', () => {
    // Given I am signed in
    cy.signIn()

    // And there are premises in the database
    const allResults = cas3PremisesSearchResultsFactory.build({
      results: cas3PremisesSearchResultFactory.buildList(5),
      totalPremises: 5,
      totalOnlineBedspaces: 12,
      totalUpcomingBedspaces: 0,
    })
    const searchResults = cas3PremisesSearchResultsFactory.build({
      results: cas3PremisesSearchResultFactory.buildList(2),
      totalPremises: 2,
      totalOnlineBedspaces: 4,
      totalUpcomingBedspaces: 0,
    })
    cy.task('stubPremisesSearchV2', { searchResults: allResults, postcodeOrAddress: '', premisesStatus: 'online' })
    cy.task('stubPremisesSearchV2', { searchResults, postcodeOrAddress: 'NE1', premisesStatus: 'online' })

    // When I visit the premises page
    const page = PremisesListPage.visitOnline()

    // Then I should see the total count without search term
    cy.contains('5 online properties').should('exist')

    // When I search for a postcode
    page.search('NE1')

    // Then I should see the count with search term
    cy.contains("2 online properties matching 'NE1'").should('exist')
    cy.contains('Online bedspaces: 4').should('exist')
  })

  it('should display zero properties message when database is empty', () => {
    // Given I am signed in
    cy.signIn()

    // And there are no premises in the database
    const searchResults = cas3PremisesSearchResultsFactory.build({
      results: [],
      totalPremises: 0,
      totalOnlineBedspaces: 0,
      totalUpcomingBedspaces: 0,
    })
    cy.task('stubPremisesSearchV2', { searchResults, postcodeOrAddress: '', premisesStatus: 'online' })

    // When I visit the premises page
    PremisesListPage.visitOnline()

    // Then I should see the zero properties message
    cy.contains('There are no online properties.').should('exist')

    // And the search form should not be visible
    cy.get('main form').should('not.exist')
  })
})
