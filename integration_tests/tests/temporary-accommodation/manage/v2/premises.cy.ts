import Page from '../../../../../cypress_shared/pages/page'
import DashboardPage from '../../../../../cypress_shared/pages/temporary-accommodation/dashboardPage'
import PremisesListPage from '../../../../../cypress_shared/pages/temporary-accommodation/manage/v2/premisesList'
import PremisesShowPage from '../../../../../cypress_shared/pages/temporary-accommodation/manage/v2/premisesShow'
import { setupTestUser } from '../../../../../cypress_shared/utils/setupTestUser'
import {
  cas3PremisesFactory,
  cas3PremisesSearchResultFactory,
  cas3PremisesSearchResultsFactory,
} from '../../../../../server/testutils/factories'

context('Premises', () => {
  beforeEach(() => {
    cy.task('reset')
    setupTestUser('assessor')
  })

  describe('search for property', () => {
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
        totalPremises: 2,
      })
      const searchResults = cas3PremisesSearchResultsFactory.build({
        results: [
          ...matchingSearchResults.results,
          cas3PremisesSearchResultFactory.build({ postcode: 'NE2 2BC' }),
          cas3PremisesSearchResultFactory.build({ postcode: 'NE3 3CD' }),
          cas3PremisesSearchResultFactory.build({ postcode: 'NE4 4DE', bedspaces: [] }),
        ],
        totalPremises: 5,
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
        totalPremises: 4,
      })
      const matchingSearchResults = cas3PremisesSearchResultsFactory.build({
        results: [],
        totalPremises: 0,
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
        totalPremises: 5,
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
      cy.contains('2 online properties matching ‘NE1’').should('exist')
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
      cy.contains('0 online properties').should('exist')

      // And the search form should not be visible
      cy.get('main form').should('not.exist')

      // And bedspace counts should not be shown when there are no properties
      cy.contains('Online bedspaces:').should('not.exist')
      cy.contains('Upcoming bedspaces:').should('not.exist')
    })

    it('should not display upcoming bedspaces when there are 0 upcoming bedspaces', () => {
      // Given I am signed in
      cy.signIn()

      // And there are premises with 0 upcoming bedspaces
      const searchResults = cas3PremisesSearchResultsFactory.build({
        results: cas3PremisesSearchResultFactory.buildList(3),
        totalPremises: 3,
        totalOnlineBedspaces: 8,
        totalUpcomingBedspaces: 0,
      })
      cy.task('stubPremisesSearchV2', { searchResults, postcodeOrAddress: '', premisesStatus: 'online' })

      // When I visit the premises page
      PremisesListPage.visitOnline()

      // Then I should see the property count and online bedspaces
      cy.contains('3 online properties').should('exist')
      cy.contains('Online bedspaces: 8').should('exist')

      // But upcoming bedspaces should not be displayed when count is 0
      cy.contains('Upcoming bedspaces:').should('not.exist')
    })

    it('should redirect from base v2 properties route to online tab', () => {
      // Given I am signed in
      cy.signIn()

      // And there are premises in the database
      const searchResults = cas3PremisesSearchResultsFactory.build({
        results: cas3PremisesSearchResultFactory.buildList(3),
        totalPremises: 3,
        totalOnlineBedspaces: 8,
        totalUpcomingBedspaces: 2,
      })
      cy.task('stubPremisesSearchV2', { searchResults, postcodeOrAddress: '', premisesStatus: 'online' })

      // When I visit the base v2 properties route
      cy.visit('/v2/properties')

      // Then I should be redirected to the online tab
      cy.url().should('include', '/v2/properties/online')

      // And I should see the online properties page
      cy.contains('Online properties').should('exist')
      cy.contains('3 online properties').should('exist')
    })

    it('should display archived properties in archived tab', () => {
      // Given I am signed in
      cy.signIn()

      // And there are archived premises in the database
      const searchResults = cas3PremisesSearchResultsFactory.build({
        results: cas3PremisesSearchResultFactory.buildList(4),
        totalPremises: 4,
        totalOnlineBedspaces: 0,
        totalUpcomingBedspaces: 0,
      })
      cy.task('stubPremisesSearchV2', { searchResults, postcodeOrAddress: '', premisesStatus: 'archived' })

      // When I visit the archived premises page
      const page = PremisesListPage.visitArchived()

      // Then I should see all the archived premises listed
      page.shouldShowPremises(searchResults.results)

      // And I should see the correct archived property count
      cy.contains('4 archived properties').should('exist')

      // And the page title should be correct
      cy.title().should('include', 'Archived properties')
    })

    it('should search archived properties by postcode', () => {
      // Given I am signed in
      cy.signIn()

      // And there are archived premises in the database
      const postcode = 'SW1 1AA'
      const matchingSearchResults = cas3PremisesSearchResultsFactory.build({
        results: [
          cas3PremisesSearchResultFactory.build({ postcode }),
          cas3PremisesSearchResultFactory.build({ postcode }),
        ],
        totalPremises: 2,
        totalOnlineBedspaces: 0,
        totalUpcomingBedspaces: 0,
      })
      const allSearchResults = cas3PremisesSearchResultsFactory.build({
        results: [
          ...matchingSearchResults.results,
          cas3PremisesSearchResultFactory.build({ postcode: 'SW2 2BB' }),
          cas3PremisesSearchResultFactory.build({ postcode: 'SW3 3CC' }),
        ],
        totalPremises: 4,
        totalOnlineBedspaces: 0,
        totalUpcomingBedspaces: 0,
      })
      cy.task('stubPremisesSearchV2', {
        searchResults: allSearchResults,
        postcodeOrAddress: '',
        premisesStatus: 'archived',
      })
      cy.task('stubPremisesSearchV2', {
        searchResults: matchingSearchResults,
        postcodeOrAddress: postcode,
        premisesStatus: 'archived',
      })

      // When I visit the archived premises page
      const page = PremisesListPage.visitArchived()

      // Then I should see all the archived premises listed
      page.shouldShowPremises(allSearchResults.results)

      // When I search for the postcode
      page.search(postcode)

      // Then only archived premises matching that postcode should be listed
      page.shouldShowOnlyPremises(matchingSearchResults.results)

      // And I should see the count with search term
      cy.contains(`2 archived properties matching ‘${postcode}’`).should('exist')

      // When I clear the search field and search again
      page.clearSearch()

      // Then all the archived premises should be listed again
      page.shouldShowPremises(allSearchResults.results)
    })

    it('should show no results when searching archived properties with no matches', () => {
      // Given I am signed in
      cy.signIn()

      // And there are archived premises in the database
      const searchResults = cas3PremisesSearchResultsFactory.build({
        results: [
          cas3PremisesSearchResultFactory.build({ postcode: 'SW1 1AA' }),
          cas3PremisesSearchResultFactory.build({ postcode: 'SW2 2BB' }),
        ],
        totalPremises: 2,
        totalOnlineBedspaces: 0,
        totalUpcomingBedspaces: 0,
      })
      const matchingSearchResults = cas3PremisesSearchResultsFactory.build({
        results: [],
        totalPremises: 0,
        totalOnlineBedspaces: 0,
        totalUpcomingBedspaces: 0,
      })
      cy.task('stubPremisesSearchV2', { searchResults, postcodeOrAddress: '', premisesStatus: 'archived' })
      cy.task('stubPremisesSearchV2', {
        searchResults: matchingSearchResults,
        postcodeOrAddress: 'NOTFOUND',
        premisesStatus: 'archived',
      })

      // When I visit the archived premises page
      const page = PremisesListPage.visitArchived()

      // Then I should see all the archived premises listed
      page.shouldShowPremises(searchResults.results)

      // When I search for a postcode with no results
      page.search('NOTFOUND')

      // Then a 'no results' message should be shown
      page.shouldShowOnlyPremises([])
      page.shouldShowMessages(['0 archived properties matching ‘NOTFOUND’'])

      // When I clear the search field and search again
      page.clearSearch()

      // Then all the archived premises should be listed again
      page.shouldShowPremises(searchResults.results)
    })

    it('should display archived property counts', () => {
      // Given I am signed in
      cy.signIn()

      // And there are archived premises in the database with specific counts
      const searchResults = cas3PremisesSearchResultsFactory.build({
        results: cas3PremisesSearchResultFactory.buildList(5),
        totalPremises: 5,
        totalOnlineBedspaces: 0,
        totalUpcomingBedspaces: 0,
      })
      cy.task('stubPremisesSearchV2', { searchResults, postcodeOrAddress: '', premisesStatus: 'archived' })

      // When I visit the archived premises page
      PremisesListPage.visitArchived()

      // Then I should see the correct archived property count
      cy.contains('5 archived properties').should('exist')

      // And bedspace counts should not be shown for archived properties
      cy.contains('Online bedspaces:').should('not.exist')
      cy.contains('Upcoming bedspaces:').should('not.exist')
    })

    it('should display zero archived properties message when database is empty', () => {
      // Given I am signed in
      cy.signIn()

      // And there are no archived premises in the database
      const searchResults = cas3PremisesSearchResultsFactory.build({
        results: [],
        totalPremises: 0,
        totalOnlineBedspaces: 0,
        totalUpcomingBedspaces: 0,
      })
      cy.task('stubPremisesSearchV2', { searchResults, postcodeOrAddress: '', premisesStatus: 'archived' })

      // When I visit the archived premises page
      PremisesListPage.visitArchived()

      // Then I should see the zero archived properties message
      cy.contains('0 archived properties').should('exist')

      // And the search form should not be visible
      cy.get('main form').should('not.exist')
    })

    it('should navigate between online and archived tabs', () => {
      // Given I am signed in
      cy.signIn()

      // And there are both online and archived premises in the database
      const onlineResults = cas3PremisesSearchResultsFactory.build({
        results: cas3PremisesSearchResultFactory.buildList(3),
        totalPremises: 3,
        totalOnlineBedspaces: 8,
        totalUpcomingBedspaces: 2,
      })
      const archivedResults = cas3PremisesSearchResultsFactory.build({
        results: cas3PremisesSearchResultFactory.buildList(2),
        totalPremises: 2,
        totalOnlineBedspaces: 0,
        totalUpcomingBedspaces: 0,
      })
      cy.task('stubPremisesSearchV2', { searchResults: onlineResults, postcodeOrAddress: '', premisesStatus: 'online' })
      cy.task('stubPremisesSearchV2', {
        searchResults: archivedResults,
        postcodeOrAddress: '',
        premisesStatus: 'archived',
      })

      // When I visit the online premises page
      PremisesListPage.visitOnline()

      // Then I should see the online tab is active
      cy.get('.moj-sub-navigation a[aria-current="page"]').should('contain', 'Online properties')
      cy.contains('3 online properties').should('exist')

      // When I click on the archived tab
      cy.get('.moj-sub-navigation a').contains('Archived properties').click()

      // Then I should be on the archived tab
      cy.url().should('include', '/v2/properties/archived')
      cy.get('.moj-sub-navigation a[aria-current="page"]').should('contain', 'Archived properties')
      cy.contains('2 archived properties').should('exist')

      // When I click on the online tab
      cy.get('.moj-sub-navigation a').contains('Online properties').click()

      // Then I should be back on the online tab
      cy.url().should('include', '/v2/properties/online')
      cy.get('.moj-sub-navigation a[aria-current="page"]').should('contain', 'Online properties')
      cy.contains('3 online properties').should('exist')
    })

    it('should preserve search terms when switching between tabs', () => {
      // Given I am signed in
      cy.signIn()

      // And there are premises in both tabs that match a search term
      const searchTerm = 'NE1'
      const onlineResults = cas3PremisesSearchResultsFactory.build({
        results: cas3PremisesSearchResultFactory.buildList(3),
        totalPremises: 3,
        totalOnlineBedspaces: 8,
        totalUpcomingBedspaces: 2,
      })
      const onlineSearchResults = cas3PremisesSearchResultsFactory.build({
        results: cas3PremisesSearchResultFactory.buildList(2),
        totalPremises: 2,
        totalOnlineBedspaces: 4,
        totalUpcomingBedspaces: 1,
      })
      const archivedResults = cas3PremisesSearchResultsFactory.build({
        results: cas3PremisesSearchResultFactory.buildList(2),
        totalPremises: 2,
        totalOnlineBedspaces: 0,
        totalUpcomingBedspaces: 0,
      })
      const archivedSearchResults = cas3PremisesSearchResultsFactory.build({
        results: cas3PremisesSearchResultFactory.buildList(1),
        totalPremises: 1,
        totalOnlineBedspaces: 0,
        totalUpcomingBedspaces: 0,
      })

      cy.task('stubPremisesSearchV2', { searchResults: onlineResults, postcodeOrAddress: '', premisesStatus: 'online' })
      cy.task('stubPremisesSearchV2', {
        searchResults: onlineSearchResults,
        postcodeOrAddress: searchTerm,
        premisesStatus: 'online',
      })
      cy.task('stubPremisesSearchV2', {
        searchResults: archivedResults,
        postcodeOrAddress: '',
        premisesStatus: 'archived',
      })
      cy.task('stubPremisesSearchV2', {
        searchResults: archivedSearchResults,
        postcodeOrAddress: searchTerm,
        premisesStatus: 'archived',
      })

      // When I visit the online premises page and search
      const page = PremisesListPage.visitOnline()
      page.search(searchTerm)

      // Then I should see the search results
      cy.contains(`2 online properties matching ‘${searchTerm}’`).should('exist')

      // When I switch to the archived tab
      cy.get('.moj-sub-navigation a').contains('Archived properties').click()

      // Then the search term should be preserved in the URL
      cy.url().should('include', `/v2/properties/archived?postcodeOrAddress=${searchTerm}`)

      // And I should see the archived search results
      cy.contains(`1 archived properties matching ‘${searchTerm}’`).should('exist')

      // And the search input should still contain the search term
      cy.get('main form input').should('have.value', searchTerm)

      // When I switch back to the online tab
      cy.get('.moj-sub-navigation a').contains('Online properties').click()

      // Then the search term should still be preserved
      cy.url().should('include', `/v2/properties/online?postcodeOrAddress=${searchTerm}`)
      cy.contains(`2 online properties matching ‘${searchTerm}’`).should('exist')
      cy.get('main form input').should('have.value', searchTerm)
    })

    it('should show correct active tab state', () => {
      // Given I am signed in
      cy.signIn()

      // And there are premises in the database
      const searchResults = cas3PremisesSearchResultsFactory.build({
        results: cas3PremisesSearchResultFactory.buildList(2),
        totalPremises: 2,
        totalOnlineBedspaces: 4,
        totalUpcomingBedspaces: 1,
      })
      cy.task('stubPremisesSearchV2', { searchResults, postcodeOrAddress: '', premisesStatus: 'online' })
      cy.task('stubPremisesSearchV2', { searchResults, postcodeOrAddress: '', premisesStatus: 'archived' })

      // When I visit the online premises page
      PremisesListPage.visitOnline()

      // Then the online tab should be active and archived tab should not be
      cy.get('.moj-sub-navigation a[aria-current="page"]').should('contain', 'Online properties')
      cy.get('.moj-sub-navigation a').contains('Archived properties').should('not.have.attr', 'aria-current')

      // When I visit the archived premises page
      PremisesListPage.visitArchived()

      // Then the archived tab should be active and online tab should not be
      cy.get('.moj-sub-navigation a[aria-current="page"]').should('contain', 'Archived properties')
      cy.get('.moj-sub-navigation a').contains('Online properties').should('not.have.attr', 'aria-current')
    })

    it('should display correct page title for online properties', () => {
      // Given I am signed in
      cy.signIn()

      // And there are online premises in the database
      const searchResults = cas3PremisesSearchResultsFactory.build({
        results: cas3PremisesSearchResultFactory.buildList(2),
      })
      cy.task('stubPremisesSearchV2', { searchResults, postcodeOrAddress: '', premisesStatus: 'online' })

      // When I visit the online premises page
      PremisesListPage.visitOnline()

      // Then the page title should be correct
      cy.title().should('include', 'Online properties')
      cy.get('h1').should('contain', 'Online properties')
    })

    it('should display correct page title for archived properties', () => {
      // Given I am signed in
      cy.signIn()

      // And there are archived premises in the database
      const searchResults = cas3PremisesSearchResultsFactory.build({
        results: cas3PremisesSearchResultFactory.buildList(2),
      })
      cy.task('stubPremisesSearchV2', { searchResults, postcodeOrAddress: '', premisesStatus: 'archived' })

      // When I visit the archived premises page
      PremisesListPage.visitArchived()

      // Then the page title should be correct
      cy.title().should('include', 'Archived properties')
      cy.get('h1').should('contain', 'Archived properties')
    })
  })

  describe('show a single property', () => {
    it('should show an online property without upcoming bedspaces', () => {
      // Given I am signed in
      cy.signIn()

      // And there is an online premises in the database
      const premises = cas3PremisesFactory.build({
        status: 'online',
        startDate: '2025-02-01',
        totalUpcomingBedspaces: 0,
      })
      const searchResult = cas3PremisesSearchResultFactory.build({ ...premises })
      const searchResults = cas3PremisesSearchResultsFactory.build({
        results: [searchResult],
        totalPremises: 1,
        totalOnlineBedspaces: 1,
      })
      cy.task('stubPremisesSearchV2', { searchResults, postcodeOrAddress: '', premisesStatus: 'online' })
      cy.task('stubSinglePremisesV2', premises)

      // When I visit the premises page
      const page = PremisesListPage.visitOnline()

      // Then I should see the online premises listed
      page.shouldShowPremises(searchResults.results)

      // When I click on the "Manage" link
      page.clickPremisesManageLink(premises)

      // Then I navigate to the show premises page
      const showPage = Page.verifyOnPage(PremisesShowPage, `${premises.addressLine1}, ${premises.postcode}`)

      // Then I should see the premises overview
      showPage.shouldShowPremisesOverview(premises, 'Online', '1 February 2025')

      // And I shouldn't see the archived bedspaces count
      showPage.shouldNotShowUpcomingBedspaces(premises)
    })

    it('should show an online property with upcoming bedspaces', () => {
      // Given I am signed in
      cy.signIn()

      // And there is an online premises in the database
      const premises = cas3PremisesFactory.build({
        status: 'online',
        startDate: '2025-02-01',
        totalUpcomingBedspaces: 5,
      })
      const searchResult = cas3PremisesSearchResultFactory.build({ ...premises })
      const searchResults = cas3PremisesSearchResultsFactory.build({
        results: [searchResult],
        totalPremises: 1,
        totalOnlineBedspaces: 1,
      })
      cy.task('stubPremisesSearchV2', { searchResults, postcodeOrAddress: '', premisesStatus: 'online' })
      cy.task('stubSinglePremisesV2', premises)

      // When I visit the premises page
      const page = PremisesListPage.visitOnline()

      // Then I should see the online premises listed
      page.shouldShowPremises(searchResults.results)

      // When I click on the "Manage" link
      page.clickPremisesManageLink(premises)

      // Then I navigate to the show premises page
      const showPage = Page.verifyOnPage(PremisesShowPage, `${premises.addressLine1}, ${premises.postcode}`)

      // Then I should see the premises overview
      showPage.shouldShowPremisesOverview(premises, 'Online', '1 February 2025')

      // And I shouldn't see the archived bedspaces count
      showPage.shouldShowUpcomingBedspaces(premises)
    })

    it('should show an archived property', () => {
      // Given I am signed in
      cy.signIn()

      // And there is an online premises in the database
      const premises = cas3PremisesFactory.build({
        status: 'archived',
        startDate: '2025-02-01',
        totalOnlineBedspaces: 0,
        totalUpcomingBedspaces: 0,
      })
      const searchResult = cas3PremisesSearchResultFactory.build({ ...premises })
      const searchResults = cas3PremisesSearchResultsFactory.build({
        results: [searchResult],
        totalPremises: 1,
        totalUpcomingBedspaces: 0,
        totalOnlineBedspaces: 0,
      })
      cy.task('stubPremisesSearchV2', { searchResults, postcodeOrAddress: '', premisesStatus: 'online' })
      cy.task('stubSinglePremisesV2', premises)

      // When I visit the premises page
      const page = PremisesListPage.visitOnline()

      // Then I should see the online premises listed
      page.shouldShowPremises(searchResults.results)

      // When I click on the "Manage" link
      page.clickPremisesManageLink(premises)

      // Then I navigate to the show premises page
      const showPage = Page.verifyOnPage(PremisesShowPage, `${premises.addressLine1}, ${premises.postcode}`)

      // Then I should see the premises overview
      showPage.shouldShowPremisesOverview(premises, 'Archived', '1 February 2025')
    })
  })
})
