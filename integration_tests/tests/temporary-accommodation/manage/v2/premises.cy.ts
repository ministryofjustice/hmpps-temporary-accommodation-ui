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
    const page = PremisesListPage.visit()

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
    const page = PremisesListPage.visit()

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
    const page = PremisesListPage.visit()

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
    const page = PremisesListPage.visit()

    // And I click the previous bread crumb
    page.clickHome()

    // Then I navigate to the dashboard page
    Page.verifyOnPage(DashboardPage)
  })
})
