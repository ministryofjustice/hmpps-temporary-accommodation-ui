import {
  Cas3Premises,
  Cas3ValidationResults,
  Characteristic,
  LocalAuthorityArea,
  ProbationDeliveryUnit,
} from '@approved-premises/api'
import Page from '../../../../../cypress_shared/pages/page'
import DashboardPage from '../../../../../cypress_shared/pages/temporary-accommodation/dashboardPage'
import PremisesListPage from '../../../../../cypress_shared/pages/temporary-accommodation/manage/v2/premisesList'
import PremisesShowPage from '../../../../../cypress_shared/pages/temporary-accommodation/manage/v2/premisesShow'
import { setupTestUser } from '../../../../../cypress_shared/utils/setupTestUser'
import {
  bedFactory,
  bookingFactory,
  cas3BedspaceFactory,
  cas3BedspacesFactory,
  cas3NewPremisesFactory,
  cas3PremisesFactory,
  cas3PremisesSearchResultFactory,
  cas3PremisesSearchResultsFactory,
  cas3UpdatePremisesFactory,
  lostBedFactory,
} from '../../../../../server/testutils/factories'
import PremisesNewPage from '../../../../../cypress_shared/pages/temporary-accommodation/manage/v2/premisesNew'
import PremisesEditPage from '../../../../../cypress_shared/pages/temporary-accommodation/manage/v2/premisesEdit'
import PremisesArchivePage from '../../../../../cypress_shared/pages/temporary-accommodation/manage/v2/premisesArchive'
import PremisesUnarchivePage from '../../../../../cypress_shared/pages/temporary-accommodation/manage/v2/premisesUnarchive'
import { DateFormats } from '../../../../../server/utils/dateUtils'
import PremisesCannotArchivePage from '../../../../../cypress_shared/pages/temporary-accommodation/manage/v2/premisesCannotArchive'
import PremisesCancelArchivePage from '../../../../../cypress_shared/pages/temporary-accommodation/manage/v2/premisesCancelArchive'
import BedspaceShowPage from '../../../../../cypress_shared/pages/temporary-accommodation/manage/v2/bedspaceShow'
import PremisesCancelUnarchivePage from '../../../../../cypress_shared/pages/temporary-accommodation/manage/v2/premisesCancelUnarchive'

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
      cy.task('stubPremisesSearch', { searchResults, postcodeOrAddress: '', premisesStatus: 'online' })

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
      cy.task('stubPremisesSearch', { searchResults, postcodeOrAddress: '', premisesStatus: 'online' })
      cy.task('stubPremisesSearch', {
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
      cy.task('stubPremisesSearch', { searchResults, postcodeOrAddress: '', premisesStatus: 'online' })
      cy.task('stubPremisesSearch', {
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
      cy.task('stubPremisesSearch', { searchResults, postcodeOrAddress: '', premisesStatus: 'online' })

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
      cy.task('stubPremisesSearch', { searchResults, postcodeOrAddress: '', premisesStatus: 'online' })

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
      cy.task('stubPremisesSearch', { searchResults: allResults, postcodeOrAddress: '', premisesStatus: 'online' })
      cy.task('stubPremisesSearch', { searchResults, postcodeOrAddress: 'NE1', premisesStatus: 'online' })

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
      cy.task('stubPremisesSearch', { searchResults, postcodeOrAddress: '', premisesStatus: 'online' })

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
      cy.task('stubPremisesSearch', { searchResults, postcodeOrAddress: '', premisesStatus: 'online' })

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
      cy.task('stubPremisesSearch', { searchResults, postcodeOrAddress: '', premisesStatus: 'online' })

      // When I visit the base v2 properties route
      cy.visit('/properties')

      // Then I should be redirected to the online tab
      cy.url().should('include', '/properties/online')

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
      cy.task('stubPremisesSearch', { searchResults, postcodeOrAddress: '', premisesStatus: 'archived' })

      // When I visit the archived premises page
      const page = PremisesListPage.visitArchived()

      // Then I should see all the archived premises listed
      page.shouldShowArchivedPremises(searchResults.results)

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
      cy.task('stubPremisesSearch', {
        searchResults: allSearchResults,
        postcodeOrAddress: '',
        premisesStatus: 'archived',
      })
      cy.task('stubPremisesSearch', {
        searchResults: matchingSearchResults,
        postcodeOrAddress: postcode,
        premisesStatus: 'archived',
      })

      // When I visit the archived premises page
      const page = PremisesListPage.visitArchived()

      // Then I should see all the archived premises listed
      page.shouldShowArchivedPremises(allSearchResults.results)

      // When I search for the postcode
      page.search(postcode)

      // Then only archived premises matching that postcode should be listed
      page.shouldShowOnlyArchivedPremises(matchingSearchResults.results)

      // And I should see the count with search term
      cy.contains(`2 archived properties matching ‘${postcode}’`).should('exist')

      // When I clear the search field and search again
      page.clearSearch()

      // Then all the archived premises should be listed again
      page.shouldShowArchivedPremises(allSearchResults.results)
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
      cy.task('stubPremisesSearch', { searchResults, postcodeOrAddress: '', premisesStatus: 'archived' })
      cy.task('stubPremisesSearch', {
        searchResults: matchingSearchResults,
        postcodeOrAddress: 'NOTFOUND',
        premisesStatus: 'archived',
      })

      // When I visit the archived premises page
      const page = PremisesListPage.visitArchived()

      // Then I should see all the archived premises listed
      page.shouldShowArchivedPremises(searchResults.results)

      // When I search for a postcode with no results
      page.search('NOTFOUND')

      // Then a 'no results' message should be shown
      page.shouldShowOnlyArchivedPremises([])
      page.shouldShowMessages(['0 archived properties matching ‘NOTFOUND’'])

      // When I clear the search field and search again
      page.clearSearch()

      // Then all the archived premises should be listed again
      page.shouldShowArchivedPremises(searchResults.results)
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
      cy.task('stubPremisesSearch', { searchResults, postcodeOrAddress: '', premisesStatus: 'archived' })

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
      cy.task('stubPremisesSearch', { searchResults, postcodeOrAddress: '', premisesStatus: 'archived' })

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
      cy.task('stubPremisesSearch', { searchResults: onlineResults, postcodeOrAddress: '', premisesStatus: 'online' })
      cy.task('stubPremisesSearch', {
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
      cy.url().should('include', '/properties/archived')
      cy.get('.moj-sub-navigation a[aria-current="page"]').should('contain', 'Archived properties')
      cy.contains('2 archived properties').should('exist')

      // When I click on the online tab
      cy.get('.moj-sub-navigation a').contains('Online properties').click()

      // Then I should be back on the online tab
      cy.url().should('include', '/properties/online')
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

      cy.task('stubPremisesSearch', { searchResults: onlineResults, postcodeOrAddress: '', premisesStatus: 'online' })
      cy.task('stubPremisesSearch', {
        searchResults: onlineSearchResults,
        postcodeOrAddress: searchTerm,
        premisesStatus: 'online',
      })
      cy.task('stubPremisesSearch', {
        searchResults: archivedResults,
        postcodeOrAddress: '',
        premisesStatus: 'archived',
      })
      cy.task('stubPremisesSearch', {
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
      cy.url().should('include', `/properties/archived?postcodeOrAddress=${searchTerm}`)

      // And I should see the archived search results
      cy.contains(`1 archived properties matching ‘${searchTerm}’`).should('exist')

      // And the search input should still contain the search term
      cy.get('main form input').should('have.value', searchTerm)

      // When I switch back to the online tab
      cy.get('.moj-sub-navigation a').contains('Online properties').click()

      // Then the search term should still be preserved
      cy.url().should('include', `/properties/online?postcodeOrAddress=${searchTerm}`)
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
      cy.task('stubPremisesSearch', { searchResults, postcodeOrAddress: '', premisesStatus: 'online' })
      cy.task('stubPremisesSearch', { searchResults, postcodeOrAddress: '', premisesStatus: 'archived' })

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
      cy.task('stubPremisesSearch', { searchResults, postcodeOrAddress: '', premisesStatus: 'online' })

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
      cy.task('stubPremisesSearch', { searchResults, postcodeOrAddress: '', premisesStatus: 'archived' })

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

      // And there is an online premises with an online bedspace in the database
      const premises = cas3PremisesFactory.build({
        status: 'online',
        startDate: '2025-02-01',
        totalUpcomingBedspaces: 0,
      })
      const bedspaces = cas3BedspacesFactory.build({
        bedspaces: [cas3BedspaceFactory.build({ status: 'online' })],
        totalOnlineBedspaces: 1,
        totalUpcomingBedspaces: 0,
        totalArchivedBedspaces: 0,
      })
      const searchResult = cas3PremisesSearchResultFactory.build({ ...premises })
      const searchResults = cas3PremisesSearchResultsFactory.build({
        results: [searchResult],
        totalPremises: 1,
        totalOnlineBedspaces: 1,
      })
      cy.task('stubPremisesSearch', { searchResults, postcodeOrAddress: '', premisesStatus: 'online' })
      cy.task('stubSinglePremises', premises)
      cy.task('stubPremisesBedspaces', { premisesId: premises.id, bedspaces })

      // When I visit the premises page
      const page = PremisesListPage.visitOnline()

      // Then I should see the online premises listed
      page.shouldShowPremises(searchResults.results)

      // When I click on the "Manage" link
      page.clickPremisesManageLink(premises)

      // Then I navigate to the show premises page
      const showPage = Page.verifyOnPage(PremisesShowPage, premises)

      // Then I should see the premises overview
      showPage.shouldShowPremisesOverview(premises, 'Online', '1 February 2025')

      // And I shouldn't see the archived bedspaces count
      showPage.shouldNotShowUpcomingBedspaces(premises)

      // When I click on the "Bedspaces overview" link
      showPage.clickBedspacesOverviewTab()

      // Then I should see the bedspace summaries
      showPage.shouldShowBedspaceSummaries(bedspaces.bedspaces)
    })

    it('should show an online property with upcoming bedspaces', () => {
      // Given I am signed in
      cy.signIn()

      // And there is an online premises with bedspaces in the database
      const premises = cas3PremisesFactory.build({
        status: 'online',
        startDate: '2025-02-01',
        totalUpcomingBedspaces: 3,
        totalOnlineBedspaces: 1,
      })
      const bedspaces = cas3BedspacesFactory.build({
        bedspaces: [
          cas3BedspaceFactory.build({ status: 'upcoming' }),
          cas3BedspaceFactory.build({ status: 'upcoming' }),
          cas3BedspaceFactory.build({ status: 'upcoming' }),
          cas3BedspaceFactory.build({ status: 'online' }),
        ],
        totalOnlineBedspaces: 1,
        totalUpcomingBedspaces: 3,
        totalArchivedBedspaces: 0,
      })
      const searchResult = cas3PremisesSearchResultFactory.build({ ...premises })
      const searchResults = cas3PremisesSearchResultsFactory.build({
        results: [searchResult],
        totalPremises: 1,
        totalOnlineBedspaces: 1,
        totalUpcomingBedspaces: 3,
      })
      cy.task('stubPremisesSearch', { searchResults, postcodeOrAddress: '', premisesStatus: 'online' })
      cy.task('stubSinglePremises', premises)
      cy.task('stubPremisesBedspaces', { premisesId: premises.id, bedspaces })

      // When I visit the premises page
      const page = PremisesListPage.visitOnline()

      // Then I should see the online premises listed
      page.shouldShowPremises(searchResults.results)

      // When I click on the "Manage" link
      page.clickPremisesManageLink(premises)

      // Then I navigate to the show premises page
      const showPage = Page.verifyOnPage(PremisesShowPage, premises)

      // Then I should see the premises overview
      showPage.shouldShowPremisesOverview(premises, 'Online', '1 February 2025')

      // And I shouldn't see the archived bedspaces count
      showPage.shouldShowUpcomingBedspaces(premises)

      // When I click on the "Bedspaces overview" link
      showPage.clickBedspacesOverviewTab()

      // Then I should see the bedspace summaries
      showPage.shouldShowBedspaceSummaries(bedspaces.bedspaces)
    })

    it('should show an archived property', () => {
      // Given I am signed in
      cy.signIn()

      // And there is an archived premises in the database
      const premises = cas3PremisesFactory.withArchiveHistory(3).build({
        status: 'archived',
        startDate: '2025-02-01',
        totalOnlineBedspaces: 0,
        totalUpcomingBedspaces: 0,
      })
      const bedspaces = cas3BedspacesFactory.build({
        bedspaces: [
          cas3BedspaceFactory.build({ status: 'archived' }),
          cas3BedspaceFactory.build({ status: 'archived' }),
          cas3BedspaceFactory.build({ status: 'archived' }),
        ],
        totalOnlineBedspaces: 0,
        totalUpcomingBedspaces: 0,
        totalArchivedBedspaces: 3,
      })
      const searchResult = cas3PremisesSearchResultFactory.build({ ...premises })
      const searchResults = cas3PremisesSearchResultsFactory.build({
        results: [searchResult],
        totalPremises: 1,
        totalUpcomingBedspaces: 0,
        totalOnlineBedspaces: 0,
      })
      cy.task('stubPremisesSearch', { searchResults, postcodeOrAddress: '', premisesStatus: 'online' })
      cy.task('stubSinglePremises', premises)
      cy.task('stubPremisesBedspaces', { premisesId: premises.id, bedspaces })

      // When I visit the premises page
      const page = PremisesListPage.visitOnline()

      // Then I should see the online premises listed
      page.shouldShowPremises(searchResults.results)

      // When I click on the "Manage" link
      page.clickPremisesManageLink(premises)

      // Then I navigate to the show premises page
      const showPage = Page.verifyOnPage(PremisesShowPage, premises)

      // Then I should see a notification that this is an archived property
      showPage.shouldShowArchivedBanner()

      // Then I should see the premises overview
      showPage.shouldShowPremisesOverview(premises, 'Archived', '1 February 2025')

      // When I click on the "Bedspaces overview" link
      showPage.clickBedspacesOverviewTab()

      // Then I should see the bedspace summaries
      showPage.shouldShowBedspaceSummaries(bedspaces.bedspaces)
    })

    it('should show an online property with no bedspaces', () => {
      // Given I am signed in
      cy.signIn()

      // And there is an online premises with no bedspaces in the database
      const premises = cas3PremisesFactory.build({
        status: 'online',
        startDate: '2025-02-01',
        totalUpcomingBedspaces: 0,
        totalOnlineBedspaces: 0,
        totalArchivedBedspaces: 0,
      })
      const bedspaces = cas3BedspacesFactory.build({
        bedspaces: [],
        totalOnlineBedspaces: 0,
        totalUpcomingBedspaces: 0,
        totalArchivedBedspaces: 0,
      })
      cy.task('stubSinglePremises', premises)
      cy.task('stubPremisesBedspaces', { premisesId: premises.id, bedspaces })

      // When I visit the show premises page
      const page = PremisesShowPage.visit(premises)

      // When I click on the "Bedspaces overview" link
      page.clickBedspacesOverviewTab()

      // Then I should see the "No bedspaces" message
      page.shouldShowNoBedspaces()

      // And I should see the "Add a bedspace" link
      page.shouldShowAddBedspaceLink()
    })
  })

  it('should toggle the sort between PDU and LA', () => {
    cy.signIn()

    // Stub for PDU sort
    const pduResults = cas3PremisesSearchResultsFactory.build({
      results: [
        cas3PremisesSearchResultFactory.build({ pdu: 'PDU A', localAuthorityAreaName: 'LA X' }),
        cas3PremisesSearchResultFactory.build({ pdu: 'PDU B', localAuthorityAreaName: 'LA Y' }),
      ],
    })
    cy.task('stubPremisesSearch', {
      searchResults: pduResults,
      postcodeOrAddress: '',
      premisesStatus: 'online',
      sortBy: 'pdu',
    })

    // Stub for LA sort
    const laResults = cas3PremisesSearchResultsFactory.build({
      results: [
        cas3PremisesSearchResultFactory.build({ pdu: 'PDU C', localAuthorityAreaName: 'LA Z' }),
        cas3PremisesSearchResultFactory.build({ pdu: 'PDU D', localAuthorityAreaName: 'LA W' }),
      ],
    })
    cy.task('stubPremisesSearch', {
      searchResults: laResults,
      postcodeOrAddress: '',
      premisesStatus: 'online',
      sortBy: 'la',
    })

    // When I visit the premises page
    const page = PremisesListPage.visitOnline()

    // Then the default sort by header should be PDU
    page.shouldShowSortByHeader('probation delivery unit')
    cy.get('table thead th').should('contain', 'PDU')
    page.shouldShowPremises(pduResults.results)

    // When I click the sort toggle button or link
    page.toggleSortBy()

    // Then the sort by header should now be LA
    page.shouldShowSortByHeader('local authority')
    cy.get('table thead th').should('contain', 'LA')
    page.shouldShowPremises(laResults.results, 'la')

    // When I toggle again
    page.toggleSortBy()

    // Then the sort by header should be PDU again
    page.shouldShowSortByHeader('probation delivery unit')
    cy.get('table thead th').should('contain', 'PDU')
    page.shouldShowPremises(pduResults.results)
  })

  it('should preserve search term when toggling sort', () => {
    cy.signIn()

    const postcode = 'NE1 1AB'
    const searchResults = cas3PremisesSearchResultsFactory.build({
      results: cas3PremisesSearchResultFactory.buildList(5),
    })
    cy.task('stubPremisesSearch', { searchResults, postcodeOrAddress: '', premisesStatus: 'online' })
    cy.task('stubPremisesSearch', { searchResults, postcodeOrAddress: postcode, premisesStatus: 'online' })
    cy.task('stubPremisesSearch', {
      searchResults,
      postcodeOrAddress: postcode,
      premisesStatus: 'online',
      sortBy: 'la',
    })

    // Visit and search
    const page = PremisesListPage.visitOnline()
    page.search(postcode)
    cy.url().should('include', `postcodeOrAddress=${postcode.replace(' ', '+')}`)

    // Toggle sort
    page.toggleSortBy()

    // Should still have the search term in the URL and input
    cy.url().should('include', `postcodeOrAddress=${postcode.replace(' ', '+')}`)
    cy.get('main form input').should('have.value', postcode)
  })

  describe('create a new property', () => {
    it('should navigate to the new property page from the property search', () => {
      // Given I am signed in
      cy.signIn()

      // And there are no premises in the database
      const searchResults = cas3PremisesSearchResultsFactory.build({
        results: [],
        totalPremises: 0,
        totalOnlineBedspaces: 0,
        totalUpcomingBedspaces: 0,
      })
      cy.task('stubPremisesSearch', { searchResults, postcodeOrAddress: '', premisesStatus: 'online' })

      // And there is reference data in the database
      cy.task('stubPremisesReferenceData')

      // When I visit the premises page
      const page = PremisesListPage.visit()

      // And click the 'Add a property' button
      page.clickAddPropertyButton()

      // Then I should see the new property page
      Page.verifyOnPage(PremisesNewPage)
    })

    it('should redirect to the new property when the property is created successfully', () => {
      // Given I am signed in
      cy.signIn()

      // And there is reference data in the database
      cy.task('stubPremisesReferenceData')

      // When I visit the new premises page
      const page = PremisesNewPage.visit()

      // When I complete the form
      const localAuthority: LocalAuthorityArea = {
        name: 'Northumberland',
        id: 'a0eaa96e-f652-4b11-be05-b72a8229b1bb',
        identifier: 'E06000057',
      }
      const pdu: ProbationDeliveryUnit = {
        name: 'North Tyneside and Northumberland',
        id: 'ec5e98a5-bcaf-46a3-a0af-2c5f1decba01',
      }
      const characteristics: Array<Characteristic> = [
        {
          name: 'Pub nearby',
          id: '684f919a-4c4a-4e80-9b3a-1dcd35873b3f',
          serviceScope: 'temporary-accommodation',
          modelScope: 'premises',
        },
        {
          name: 'Floor level access',
          id: '99bb0f33-ff92-4606-9d1c-43bcf0c42ef4',
          serviceScope: 'temporary-accommodation',
          modelScope: 'premises',
        },
      ]
      const newPremises = cas3NewPremisesFactory.build({
        localAuthorityAreaId: localAuthority.id,
        probationDeliveryUnitId: pdu.id,
        characteristicIds: characteristics.map(char => char.id),
      })
      page.enterReference(newPremises.reference)
      page.enterAddress(newPremises.addressLine1, newPremises.addressLine2, newPremises.town, newPremises.postcode)
      page.enterLocalAuthority(localAuthority.name)
      page.enterProbationRegion()
      page.enterPdu(pdu.name)
      page.enterCharacteristics(characteristics.map(char => char.name))
      page.enterAdditionalDetails(newPremises.notes)
      page.enterWorkingDays(newPremises.turnaroundWorkingDays)

      // And the backend responds with 201 created
      const premises = cas3PremisesFactory.build({
        ...newPremises,
        characteristics,
        probationDeliveryUnit: pdu,
        localAuthorityArea: localAuthority,
        startDate: '2025-02-01',
        status: 'online',
      })
      cy.task('stubPremisesCreate', premises)
      cy.task('stubSinglePremises', premises)

      // When I submit the form
      page.clickSubmit()

      // Then a premises should have been created in the API
      cy.task('verifyPremisesCreate').then(requests => {
        expect(requests).to.have.length(1)
        const requestBody = JSON.parse(requests[0].body)

        expect(requestBody.reference).equal(newPremises.reference)
        expect(requestBody.addressLine1).equal(newPremises.addressLine1)
        expect(requestBody.addressLine2).equal(newPremises.addressLine2)
        expect(requestBody.town).equal(newPremises.town)
        expect(requestBody.postcode).equal(newPremises.postcode)
        expect(requestBody.localAuthorityAreaId).equal(newPremises.localAuthorityAreaId)
        expect(requestBody.probationDeliveryUnitId).equal(newPremises.probationDeliveryUnitId)
        expect(requestBody.characteristicIds).members(newPremises.characteristicIds)
        expect(requestBody.notes.replaceAll('\r\n', '\n')).equal(newPremises.notes)
        expect(requestBody.turnaroundWorkingDays).equal(newPremises.turnaroundWorkingDays)
      })

      // And I should be taken to the new property
      const showPage = Page.verifyOnPage(PremisesShowPage, premises)

      // And I should see the 'Property added' banner
      showPage.shouldShowPropertyAddedBanner()

      // And I should see the premises overview
      showPage.shouldShowPremisesOverview(premises, 'Online', '1 February 2025')
    })

    it('should show errors when creating a property fails', () => {
      // Given I am signed in
      cy.signIn()

      // And there is reference data in the database
      cy.task('stubPremisesReferenceData')

      // When I visit the new premises page
      const page = PremisesNewPage.visit()

      // When I don't enter the required fields
      page.enterAddress('', 'Some address line 2', 'Some town', '')
      page.enterLocalAuthority('Northumberland')
      page.enterCharacteristics(['Pub nearby', 'Wheelchair accessible'])
      page.enterAdditionalDetails('Lorem ipsum dolor sit amet.')
      page.enterWorkingDays(5)

      // And the backend responds with 400 bad request
      cy.task('stubPremisesCreateErrors', [
        'reference',
        'addressLine1',
        'postcode',
        'probationDeliveryUnitId',
        'probationRegionId',
      ])

      // When I submit the form
      page.clickSubmit()

      // Then I should be returned to the create page
      Page.verifyOnPage(PremisesNewPage)

      // And I should see error messages
      page.shouldShowErrorMessagesForFields(
        ['reference', 'addressLine1', 'postcode', 'probationDeliveryUnitId', 'probationRegionId'],
        'empty',
      )

      // And I should see the optional data I'd previously entered
      page.validateEnteredAddressLine2('Some address line 2')
      page.validateEnteredTown('Some town')
      page.validateEnteredLocalAuthority('Northumberland')
      page.validateEnteredCharacteristics(['Pub nearby', 'Wheelchair accessible'])
      page.validateEnteredAdditionalDetails('Lorem ipsum dolor sit amet.')
      page.validateEnteredWorkingDays(5)
    })
  })

  describe('edit an existing property', () => {
    beforeEach(() => {
      // And there is reference data in the database
      cy.task('stubPremisesReferenceData')
    })

    it('should navigate to the edit property page from the show property page', () => {
      // Given I am signed in
      cy.signIn()

      // And there is an online premises in the database
      const premises = cas3PremisesFactory.build({ status: 'online' })
      cy.task('stubSinglePremises', premises)
      cy.task('stubPremisesBedspaces', { premisesId: premises.id, bedspaces: cas3BedspacesFactory.build() })

      // When I visit the show premises page
      const showPage = PremisesShowPage.visit(premises)

      // And click on the "Edit property details" action
      showPage.clickEditPropertyDetailsButton()

      // Then I should see the edit premises page
      Page.verifyOnPage(PremisesEditPage)
    })

    it('should show the existing premises information on the edit page', () => {
      // Given I am signed in
      cy.signIn()

      // And there is an online premises in the database
      const localAuthorityArea: LocalAuthorityArea = {
        name: 'Northumberland',
        id: 'a0eaa96e-f652-4b11-be05-b72a8229b1bb',
        identifier: 'E06000057',
      }
      const probationDeliveryUnit: ProbationDeliveryUnit = {
        name: 'North Tyneside and Northumberland',
        id: 'ec5e98a5-bcaf-46a3-a0af-2c5f1decba01',
      }
      const characteristics: Array<Characteristic> = [
        {
          name: 'Pub nearby',
          id: '684f919a-4c4a-4e80-9b3a-1dcd35873b3f',
          serviceScope: 'temporary-accommodation',
          modelScope: 'premises',
        },
        {
          name: 'Floor level access',
          id: '99bb0f33-ff92-4606-9d1c-43bcf0c42ef4',
          serviceScope: 'temporary-accommodation',
          modelScope: 'premises',
        },
      ]
      const premises = cas3PremisesFactory.build({
        status: 'online',
        localAuthorityArea,
        probationDeliveryUnit,
        characteristics,
      })
      cy.task('stubSinglePremises', premises)
      cy.task('stubPremisesBedspaces', { premisesId: premises.id, bedspaces: cas3BedspacesFactory.build() })

      // When I visit the edit premises page
      const page = PremisesEditPage.visit(premises)

      // Then I should see the existing premises information
      page.shouldShowPropertySummary(premises)
      page.validateEnteredInformation(premises)
    })

    it('should redirect to the existing property when the property is updated successfully', () => {
      // Given I am signed in
      cy.signIn()

      // And there is an online premises in the database
      const localAuthorityArea: LocalAuthorityArea = {
        name: 'Northumberland',
        id: 'a0eaa96e-f652-4b11-be05-b72a8229b1bb',
        identifier: 'E06000057',
      }
      const probationDeliveryUnit: ProbationDeliveryUnit = {
        name: 'North Tyneside and Northumberland',
        id: 'ec5e98a5-bcaf-46a3-a0af-2c5f1decba01',
      }
      const characteristics: Array<Characteristic> = [
        {
          name: 'Pub nearby',
          id: '684f919a-4c4a-4e80-9b3a-1dcd35873b3f',
          serviceScope: 'temporary-accommodation',
          modelScope: 'premises',
        },
        {
          name: 'Floor level access',
          id: '99bb0f33-ff92-4606-9d1c-43bcf0c42ef4',
          serviceScope: 'temporary-accommodation',
          modelScope: 'premises',
        },
      ]
      const premises = cas3PremisesFactory.build({
        status: 'online',
        startDate: '2025-06-07',
        localAuthorityArea,
        probationDeliveryUnit,
        characteristics,
      })
      cy.task('stubSinglePremises', premises)
      cy.task('stubPremisesBedspaces', { premisesId: premises.id, bedspaces: cas3BedspacesFactory.build() })

      // When I visit the edit property page
      const page = PremisesEditPage.visit(premises)

      // And update the premises details
      const updatedLocalAuthorityArea: LocalAuthorityArea = {
        id: '300e2a6a-019f-4f96-9454-0c071c1bfbf0',
        name: 'North East',
        identifier: 'E47000010',
      }
      const updatedPdu: ProbationDeliveryUnit = {
        id: '1b74c3ef-6533-4780-9faf-1dfdfef75cfe',
        name: 'Newcastle Upon Tyne',
      }
      const updatedCharacteristics: Array<Characteristic> = [
        {
          id: '62c4d8cf-b612-4110-9e27-5c29982f9fcf',
          name: 'Not suitable for arson offenders',
          serviceScope: 'temporary-accommodation',
          modelScope: '*',
        },
        {
          id: '684f919a-4c4a-4e80-9b3a-1dcd35873b3f',
          name: 'Pub nearby',
          serviceScope: 'temporary-accommodation',
          modelScope: 'premises',
        },
      ]
      const updatedPremises = cas3UpdatePremisesFactory.build({
        localAuthorityAreaId: updatedLocalAuthorityArea.id,
        probationDeliveryUnitId: updatedPdu.id,
        characteristicIds: updatedCharacteristics.map(ch => ch.id),
      })
      page.clearForm()
      page.enterReference(updatedPremises.reference)
      page.enterAddress(
        updatedPremises.addressLine1,
        updatedPremises.addressLine2,
        updatedPremises.town,
        updatedPremises.postcode,
      )
      page.enterLocalAuthority(updatedLocalAuthorityArea.name)
      page.enterPdu(updatedPdu.name)
      page.enterCharacteristics(updatedCharacteristics.map(char => char.name))
      page.enterAdditionalDetails(updatedPremises.notes)
      page.enterWorkingDays(updatedPremises.turnaroundWorkingDayCount)

      // And the backend responds with 200 ok
      const expectedPremises = cas3PremisesFactory.build({
        ...updatedPremises,
        characteristics: updatedCharacteristics,
        probationDeliveryUnit: updatedPdu,
        localAuthorityArea: updatedLocalAuthorityArea,
        startDate: premises.startDate,
        id: premises.id,
        status: premises.status,
      })
      cy.task('stubPremisesUpdate', expectedPremises)
      cy.task('stubSinglePremises', expectedPremises)

      // When I submit the form
      page.clickSubmit()

      // Then the premises should have been updated in the backend
      cy.task('verifyPremisesUpdate', premises.id).then(requests => {
        expect(requests).to.have.length(1)
        const requestBody = JSON.parse(requests[0].body)

        expect(requestBody.reference).equal(updatedPremises.reference)
        expect(requestBody.addressLine1).equal(updatedPremises.addressLine1)
        expect(requestBody.addressLine2).equal(updatedPremises.addressLine2)
        expect(requestBody.town).equal(updatedPremises.town)
        expect(requestBody.postcode).equal(updatedPremises.postcode)
        expect(requestBody.localAuthorityAreaId).equal(updatedPremises.localAuthorityAreaId)
        expect(requestBody.probationDeliveryUnitId).equal(updatedPremises.probationDeliveryUnitId)
        expect(requestBody.characteristicIds).members(updatedPremises.characteristicIds)
        expect(requestBody.notes.replaceAll('\r\n', '\n')).equal(updatedPremises.notes)
        expect(requestBody.turnaroundWorkingDayCount).equal(updatedPremises.turnaroundWorkingDayCount)
      })

      // And I should be taken to the existing updated property
      const showPage = Page.verifyOnPage(PremisesShowPage, expectedPremises)

      // And I should see the 'Property updated' banner
      showPage.shouldShowPropertyUpdatedBanner()

      // And I should see the property overview
      showPage.shouldShowPremisesOverview(expectedPremises, 'Online', '7 June 2025')
    })

    it('should show errors when updating a property fails', () => {
      // Given I am signed in
      cy.signIn()

      // And there is an online premises in the database
      const localAuthorityArea: LocalAuthorityArea = {
        name: 'Northumberland',
        id: 'a0eaa96e-f652-4b11-be05-b72a8229b1bb',
        identifier: 'E06000057',
      }
      const probationDeliveryUnit: ProbationDeliveryUnit = {
        name: 'North Tyneside and Northumberland',
        id: 'ec5e98a5-bcaf-46a3-a0af-2c5f1decba01',
      }
      const characteristics: Array<Characteristic> = [
        {
          name: 'Pub nearby',
          id: '684f919a-4c4a-4e80-9b3a-1dcd35873b3f',
          serviceScope: 'temporary-accommodation',
          modelScope: 'premises',
        },
        {
          name: 'Floor level access',
          id: '99bb0f33-ff92-4606-9d1c-43bcf0c42ef4',
          serviceScope: 'temporary-accommodation',
          modelScope: 'premises',
        },
      ]
      const premises = cas3PremisesFactory.build({
        status: 'online',
        localAuthorityArea,
        probationDeliveryUnit,
        characteristics,
      })
      cy.task('stubSinglePremises', premises)
      cy.task('stubPremisesBedspaces', { premisesId: premises.id, bedspaces: cas3BedspacesFactory.build() })

      // When I visit the edit premises page
      const page = PremisesEditPage.visit(premises)

      // And clear some required fields
      page.enterReference('')
      page.enterAddress('', premises.addressLine2, premises.town, '')

      // And the backend responds with 400 bad request
      cy.task('stubPremisesUpdateErrors', {
        premisesId: premises.id,
        fields: ['reference', 'addressLine1', 'postcode'],
      })

      // When I submit the form
      page.clickSubmit()

      // Then I should be returned to the edit page
      Page.verifyOnPage(PremisesEditPage)

      // And I should see error messages
      page.shouldShowErrorMessagesForFields(['reference', 'addressLine1', 'postcode'], 'empty')

      // And I should see the previous property information
      page.validateEnteredAddressLine2(premises.addressLine2)
      page.validateEnteredTown(premises.town)
      page.validateEnteredLocalAuthority(premises.localAuthorityArea.name)
      page.validateEnteredCharacteristics(premises.characteristics.map(ch => ch.name))
      page.validateEnteredAdditionalDetails(premises.notes)
      page.validateEnteredWorkingDays(premises.turnaroundWorkingDays)
    })
  })

  describe('archive a premises', () => {
    beforeEach(() => {
      // Given I am signed in
      cy.signIn()
    })

    it('should be able to archive a property today', () => {
      // And there is an online premises in the database
      const premises = cas3PremisesFactory.build({ status: 'online' })
      cy.task('stubSinglePremises', premises)
      cy.task('stubPremisesBedspaces', { premisesId: premises.id, bedspaces: cas3BedspacesFactory.build() })
      cy.task('stubPremisesCanArchive', { premisesId: premises.id, undefined })

      // When I visit the show premises page
      let showPage = PremisesShowPage.visit(premises)

      // And click on the "Archive property" action
      showPage.clickArchivePropertyButton()

      // Then I should see the archive premises page
      const archivePage = Page.verifyOnPage(PremisesArchivePage, premises)

      // When the backend responds with 200 ok
      const expectedPremises: Cas3Premises = {
        ...premises,
        status: 'archived',
        archiveHistory: [{ date: DateFormats.dateObjToIsoDate(new Date()), status: 'archived' }],
      }
      cy.task('stubPremisesArchive', expectedPremises)
      cy.task('stubSinglePremises', expectedPremises)

      // And I click the option for "today"
      archivePage.selectToday()

      // And I submit the form
      archivePage.clickSubmit()

      // Then the premises should have been archived in the backend
      const today = DateFormats.dateObjToIsoDate(new Date())
      cy.task('verifyPremisesArchive', premises.id).then(requests => {
        expect(requests).to.have.length(1)
        const requestBody = JSON.parse(requests[0].body)
        expect(requestBody.endDate).equal(today)
      })

      // And I should be taken to the existing archived premises
      showPage = Page.verifyOnPage(PremisesShowPage, expectedPremises)

      // And I should see the 'Property and bedspaces archived' banner
      showPage.shouldShowPropertyAndBedspacesArchivedBanner()

      // And the property should be archived
      showPage.shouldShowPropertyStatus('Archived')
      showPage.shouldShowPropertyArchiveHistory(expectedPremises.archiveHistory)
    })

    it('should be able to archive a property tomorrow', () => {
      // And there is an online premises in the database
      const premises = cas3PremisesFactory.build({ status: 'online' })
      cy.task('stubSinglePremises', premises)
      cy.task('stubPremisesBedspaces', { premisesId: premises.id, bedspaces: cas3BedspacesFactory.build() })
      cy.task('stubPremisesCanArchive', { premisesId: premises.id, undefined })

      // When I visit the show premises page
      let showPage = PremisesShowPage.visit(premises)

      // And click on the "Archive property" action
      showPage.clickArchivePropertyButton()

      // Then I should see the archive premises page
      const archivePage = Page.verifyOnPage(PremisesArchivePage, premises)

      // When I enter tomorrow's date
      const tomorrowDate = new Date()
      tomorrowDate.setDate(tomorrowDate.getDate() + 1)
      const tomorrow = DateFormats.dateObjToIsoDate(tomorrowDate)
      archivePage.enterDate(tomorrow)

      // When the backend responds with 200 ok
      const expectedPremises: Cas3Premises = { ...premises, endDate: tomorrow }
      cy.task('stubPremisesArchive', expectedPremises)
      cy.task('stubSinglePremises', expectedPremises)

      // And I submit the form
      archivePage.clickSubmit()

      // Then the premises should have been archived in the backend
      cy.task('verifyPremisesArchive', premises.id).then(requests => {
        expect(requests).to.have.length(1)
        const requestBody = JSON.parse(requests[0].body)
        expect(requestBody.endDate).equal(tomorrow)
      })

      // And I should be taken to the existing archived premises
      showPage = Page.verifyOnPage(PremisesShowPage, expectedPremises)

      // And I should see the 'Property and bedspaces archived' banner
      showPage.shouldShowPropertyAndBedspacesUpdatedBanner()

      // And the property should be online, with a scheduled archive
      showPage.shouldShowPropertyStatus('Online')
      showPage.shouldShowScheduledDate(DateFormats.dateObjtoUIDate(tomorrowDate))
      // TODO: uncomment when upcoming statuses have been implemented
      // showPage.shouldShowUpcomingArchiveStatus()
    })

    it('should show a dynamic error when archiving a property fails', () => {
      // And there is an online premises with an upcoming bedspace in the database
      const premises = cas3PremisesFactory.build({ status: 'online' })
      const bedspaces = cas3BedspacesFactory.build({
        bedspaces: [cas3BedspaceFactory.build({ status: 'upcoming' })],
        totalUpcomingBedspaces: 1,
        totalOnlineBedspaces: 0,
        totalArchivedBedspaces: 0,
      })
      cy.task('stubSinglePremises', premises)
      cy.task('stubPremisesBedspaces', { premisesId: premises.id, bedspaces })
      cy.task('stubPremisesCanArchive', { premisesId: premises.id, undefined })

      // When I visit the show premises page
      const showPage = PremisesShowPage.visit(premises)

      // And click on the "Archive property" action
      showPage.clickArchivePropertyButton()

      // Then I should see the archive premises page
      let archivePage = Page.verifyOnPage(PremisesArchivePage, premises)

      const oneWeek = new Date()
      oneWeek.setDate(oneWeek.getDate() + 7)

      // When the backend responds with 400 bad request
      cy.task('stubPremisesArchiveErrors', {
        premisesId: premises.id,
        endDate: DateFormats.dateObjToIsoDate(oneWeek),
      })

      // And I select the "today" option
      archivePage.selectToday()

      // And I submit the form
      archivePage.clickSubmit()

      // Then I should be returned to the archive page
      archivePage = Page.verifyOnPage(PremisesArchivePage, premises)

      // And I should see error messages with dynamic date content
      archivePage.shouldShowGivenErrorMessagesForField(
        'endDate',
        `Earliest archive date is ${DateFormats.dateObjtoUIDate(oneWeek)} because of an upcoming bedspace`,
      )
    })

    it('should show a "Cannot archive" page when the property has bedspaces with bookings beyond when the property can be archived', () => {
      // And there is an online premises in the database with some upcoming bedspace bookings
      const premises = cas3PremisesFactory.build({ status: 'online' })
      const bedspaces = cas3BedspaceFactory.buildList(4)
      const bedspacesReference: Cas3ValidationResults = {
        items: [
          { entityId: bedspaces[0].id, entityReference: bedspaces[0].reference },
          { entityId: bedspaces[1].id, entityReference: bedspaces[1].reference },
        ],
      }
      cy.task('stubSinglePremises', premises)
      cy.task('stubPremisesBedspaces', {
        premisesId: premises.id,
        bedspaces: cas3BedspacesFactory.build({ bedspaces }),
      })
      cy.task('stubPremisesCanArchive', { premisesId: premises.id, bedspacesReference })

      // When I visit the show premises page
      const showPage = PremisesShowPage.visit(premises)

      // And click on the "Archive property" action
      showPage.clickArchivePropertyButton()

      // Then I should see the cannot archive premises page
      const cannotArchivePage = Page.verifyOnPage(PremisesCannotArchivePage, premises)

      // And I should see the affected bedspaces
      cannotArchivePage.shouldShowAffectedBedspaces(bedspacesReference.items)
    })

    it('should navigate to a bedspace from the "Cannot archive" page', () => {
      // And there is an online premises in the database with some upcoming bedspace bookings
      const premises = cas3PremisesFactory.build({ status: 'online' })
      const bedspaces = cas3BedspaceFactory.buildList(4)
      const bookings = bookingFactory
        .params({
          bed: bedFactory.build({ id: bedspaces[0].id }),
        })
        .buildList(5)
      const lostBeds = lostBedFactory
        .active()
        .params({
          bedId: bedspaces[0].id,
        })
        .buildList(5)
      const bedspacesReference: Cas3ValidationResults = {
        items: [
          { entityId: bedspaces[0].id, entityReference: bedspaces[0].reference },
          { entityId: bedspaces[1].id, entityReference: bedspaces[1].reference },
        ],
      }
      cy.task('stubSinglePremises', premises)
      cy.task('stubPremisesBedspaces', {
        premisesId: premises.id,
        bedspaces: cas3BedspacesFactory.build({ bedspaces }),
      })
      cy.task('stubBookingsForPremisesId', { premisesId: premises.id, bookings })
      cy.task('stubLostBedsForPremisesId', { premisesId: premises.id, lostBeds })
      cy.task('stubPremisesCanArchive', { premisesId: premises.id, bedspacesReference })

      // When I visit the show premises page
      const showPage = PremisesShowPage.visit(premises)

      // And click on the "Archive property" action
      showPage.clickArchivePropertyButton()

      // Then I should see the cannot archive premises page
      const cannotArchivePage = Page.verifyOnPage(PremisesCannotArchivePage, premises)

      // And I should see the affected bedspaces
      cannotArchivePage.shouldShowAffectedBedspaces(bedspacesReference.items)

      // When I click on one of the affected bedspaces
      cy.task('stubBedspace', { premisesId: premises.id, bedspace: bedspaces[1] })
      cannotArchivePage.clickAffectedBedspace(bedspaces[1].reference)

      // Then I should see the show bedspace page
      Page.verifyOnPage(BedspaceShowPage, premises, bedspaces[1])
    })

    it('should navigate back to the bedspaces overview page from the "Cannot archive" page', () => {
      // And there is an online premises in the database with some upcoming bedspace bookings
      const premises = cas3PremisesFactory.build({ status: 'online' })
      const bedspaces = cas3BedspaceFactory.buildList(4)
      const bedspacesReference: Cas3ValidationResults = {
        items: [
          { entityId: bedspaces[0].id, entityReference: bedspaces[0].reference },
          { entityId: bedspaces[1].id, entityReference: bedspaces[1].reference },
        ],
      }
      cy.task('stubSinglePremises', premises)
      cy.task('stubPremisesBedspaces', {
        premisesId: premises.id,
        bedspaces: cas3BedspacesFactory.build({ bedspaces }),
      })
      cy.task('stubPremisesCanArchive', { premisesId: premises.id, bedspacesReference })

      // When I visit the show premises page
      let showPage = PremisesShowPage.visit(premises)

      // And click on the "Archive property" action
      showPage.clickArchivePropertyButton()

      // Then I should see the cannot archive premises page
      const cannotArchivePage = Page.verifyOnPage(PremisesCannotArchivePage, premises)

      // And I should see the affected bedspaces
      cannotArchivePage.shouldShowAffectedBedspaces(bedspacesReference.items)

      // When I click on the "View bedspaces overview" button
      cannotArchivePage.clickViewBedspacesOverview()

      // Then I should see the bedspace overview page
      showPage = Page.verifyOnPage(PremisesShowPage, premises)
      showPage.shouldShowBedspaceSummaries(bedspaces)
    })
  })

  describe('unarchive a premises', () => {
    beforeEach(() => {
      // Given I am signed in
      cy.signIn()
    })

    it('should be able to unarchive a property today', () => {
      // And there is an archived premises in the database
      const premises = cas3PremisesFactory.build({ status: 'archived' })
      // and these premises do not have a future unarchive date
      const { scheduleUnarchiveDate, ...premisesWithoutScheduleUnarchiveDate } = premises
      cy.task('stubSinglePremises', premisesWithoutScheduleUnarchiveDate)
      cy.task('stubPremisesBedspaces', { premisesId: premises.id, bedspaces: cas3BedspacesFactory.build() })

      // When I visit the show premises page
      let showPage = PremisesShowPage.visit(premises)

      // And click on the "Make property online" action
      showPage.clickMakePropertyOnlineButton()

      // Then I should see the unarchive premises page
      const unarchivePage = Page.verifyOnPage(PremisesUnarchivePage, premises)

      // When the backend responds with 200 ok
      const expectedPremises: Cas3Premises = {
        ...premises,
        status: 'online',
      }
      cy.task('stubPremisesUnarchive', expectedPremises)
      cy.task('stubSinglePremises', expectedPremises)

      // And I select the "today" option
      unarchivePage.selectToday()

      // And I submit the form
      unarchivePage.clickSubmit()

      // Then the premises should have been unarchived in the backend
      const today = DateFormats.dateObjToIsoDate(new Date())
      cy.task('verifyPremisesUnarchive', premises.id).then(requests => {
        expect(requests).to.have.length(1)
        const requestBody = JSON.parse(requests[0].body)
        expect(requestBody.restartDate).equal(today)
      })

      // And I should be taken to the existing unarchived premises
      showPage = Page.verifyOnPage(PremisesShowPage, expectedPremises)

      // And I should see the 'Property and bedspaces online' banner
      showPage.shouldShowPropertyAndBedspacesOnlineBanner()

      // And the property should be online
      showPage.shouldShowPropertyStatus('Online')
    })

    it('should be able to unarchive a property tomorrow', () => {
      // And there is an archived premises in the database
      const premises = cas3PremisesFactory.build({ status: 'archived' })
      // and these premises do not have a future unarchive date
      const { scheduleUnarchiveDate, ...premisesWithoutScheduleUnarchiveDate } = premises
      cy.task('stubSinglePremises', premisesWithoutScheduleUnarchiveDate)
      cy.task('stubPremisesBedspaces', { premisesId: premises.id, bedspaces: cas3BedspacesFactory.build() })

      // When I visit the show premises page
      let showPage = PremisesShowPage.visit(premises)

      // And click on the "Make property online" action
      showPage.clickMakePropertyOnlineButton()

      // Then I should see the unarchive premises page
      const unarchivePage = Page.verifyOnPage(PremisesUnarchivePage, premises)

      // When I enter tomorrow's date
      const tomorrowDate = new Date()
      tomorrowDate.setDate(tomorrowDate.getDate() + 1)
      const tomorrow = DateFormats.dateObjToIsoDate(tomorrowDate)
      unarchivePage.enterDate(tomorrow)

      // When the backend responds with 200 ok
      const expectedPremises: Cas3Premises = premises
      cy.task('stubPremisesUnarchive', expectedPremises)
      cy.task('stubSinglePremises', expectedPremises)

      // And I submit the form
      unarchivePage.clickSubmit()

      // Then the premises should have been scheduled to come online in the backend
      cy.task('verifyPremisesUnarchive', premises.id).then(requests => {
        expect(requests).to.have.length(1)
        const requestBody = JSON.parse(requests[0].body)
        expect(requestBody.restartDate).equal(tomorrow)
      })

      // And I should be taken to the existing unarchived premises
      showPage = Page.verifyOnPage(PremisesShowPage, expectedPremises)

      // And I should see the 'Property and bedspaces updated' banner
      showPage.shouldShowPropertyAndBedspacesUpdatedBanner()

      // And the property should be archived, with a scheduled unarchive
      showPage.shouldShowPropertyStatus('Archived')
      // TODO: uncomment when upcoming statuses have been implemented
      // showPage.shouldShowUpcomingUnarchiveStatus()
    })

    it('should show a dynamic error when unarchiving a property fails', () => {
      // And there is an archived premises
      const premises = cas3PremisesFactory.build({ status: 'archived' })
      // and these premises do not have a future unarchive date
      const { scheduleUnarchiveDate, ...premisesWithoutScheduleUnarchiveDate } = premises
      cy.task('stubSinglePremises', premisesWithoutScheduleUnarchiveDate)
      cy.task('stubPremisesBedspaces', { premisesId: premises.id, bedspaces: cas3BedspacesFactory.build() })

      // When I visit the show premises page
      const showPage = PremisesShowPage.visit(premises)

      // And click on the "Make property online" action
      showPage.clickMakePropertyOnlineButton()

      // Then I should see the unarchive premises page
      let unarchivePage = Page.verifyOnPage(PremisesUnarchivePage, premises)

      const twoWeeks = new Date()
      twoWeeks.setDate(twoWeeks.getDate() + 14)

      // When the backend responds with 400 bad request
      cy.task('stubPremisesUnarchiveErrors', premises.id)

      // And I select the "today" option
      unarchivePage.selectToday()

      // And I submit the form
      unarchivePage.clickSubmit()

      // Then I should be returned to the unarchive page
      unarchivePage = Page.verifyOnPage(PremisesUnarchivePage, premises)

      // And I should see error messages with dynamic date content
      unarchivePage.shouldShowGivenErrorMessageForField(
        'restartDate',
        'The date cannot be more than 7 days in the future',
      )
    })
  })

  describe('cancel scheduled archive', () => {
    beforeEach(() => {
      cy.signIn()
    })

    it('should be able to cancel a scheduled archive', () => {
      // Given there is a premises with a scheduled archive
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowIso = DateFormats.dateObjToIsoDate(tomorrow)

      const premises = cas3PremisesFactory.build({
        status: 'online',
        endDate: tomorrowIso,
      })
      cy.task('stubSinglePremises', premises)
      cy.task('stubPremisesBedspaces', { premisesId: premises.id, bedspaces: cas3BedspacesFactory.build() })

      // When I visit the show premises page
      let showPage = PremisesShowPage.visit(premises)

      // And click on the "Cancel archive" action
      showPage.clickCancelArchiveButton()

      // Then I should see the cancel archive premises page
      const cancelArchivePage = Page.verifyOnPage(PremisesCancelArchivePage, premises)

      // When I select "Yes" to confirm cancellation
      cancelArchivePage.selectYes()

      // When the backend responds with 200 ok
      const expectedPremises: Cas3Premises = {
        ...premises,
        endDate: undefined,
      }
      cy.task('stubPremisesCancelArchive', expectedPremises)
      cy.task('stubSinglePremises', expectedPremises)

      // And I submit the form
      cancelArchivePage.clickSubmit()

      // Then the premises should have had its archive cancelled in the backend
      cy.task('verifyPremisesCancelArchive', premises.id).then(requests => {
        expect(requests).to.have.length(1)
      })

      // And I should be redirected to the show premises page
      showPage = Page.verifyOnPage(PremisesShowPage, expectedPremises)

      // And I should see the 'Scheduled archive cancelled' banner
      showPage.shouldShowScheduledArchiveCancelledBanner()
    })

    it('should redirect to show premises page when user selects no', () => {
      // Given there is a premises with a scheduled archive
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowIso = DateFormats.dateObjToIsoDate(tomorrow)

      const premises = cas3PremisesFactory.build({
        status: 'online',
        endDate: tomorrowIso,
      })
      cy.task('stubSinglePremises', premises)
      cy.task('stubPremisesBedspaces', { premisesId: premises.id, bedspaces: cas3BedspacesFactory.build() })

      // When I visit the show premises page
      const showPage = PremisesShowPage.visit(premises)

      // And click on the "Cancel archive" action
      showPage.clickCancelArchiveButton()

      // Then I should see the cancel archive premises page
      const cancelArchivePage = Page.verifyOnPage(PremisesCancelArchivePage, premises)

      // When I select "No"
      cancelArchivePage.selectNo()

      // And I submit the form
      cancelArchivePage.clickSubmit()

      // Then I should be redirected to the show premises page without any API call
      Page.verifyOnPage(PremisesShowPage, premises)
    })

    it('should handle API errors when cancelling archive', () => {
      // Given there is a premises with a scheduled archive
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowIso = DateFormats.dateObjToIsoDate(tomorrow)

      const premises = cas3PremisesFactory.build({
        status: 'online',
        endDate: tomorrowIso,
      })
      cy.task('stubSinglePremises', premises)
      cy.task('stubPremisesBedspaces', { premisesId: premises.id, bedspaces: cas3BedspacesFactory.build() })

      // When I visit the show premises page
      const showPage = PremisesShowPage.visit(premises)

      // And click on the "Cancel archive" action
      showPage.clickCancelArchiveButton()

      // Then I should see the cancel archive premises page
      let cancelArchivePage = Page.verifyOnPage(PremisesCancelArchivePage, premises)

      // When I select "Yes" to confirm cancellation
      cancelArchivePage.selectYes()

      // When the backend responds with an error
      cy.task('stubPremisesCancelArchiveErrors', {
        premisesId: premises.id,
        params: ['premisesNotScheduledToArchive'],
      })

      // And I submit the form
      cancelArchivePage.clickSubmit()

      // Then I should see an error message
      cancelArchivePage = Page.verifyOnPage(PremisesCancelArchivePage, premises)
      cancelArchivePage.shouldShowGivenErrorMessagesForField('premisesId', 'Property is not scheduled to be archived')
    })
  })

  describe('cancel scheduled unarchive', () => {
    beforeEach(() => {
      cy.signIn()
    })

    it('should be able to cancel a scheduled unarchive', () => {
      // Given there is a premises with a scheduled unarchive
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowIso = DateFormats.dateObjToIsoDate(tomorrow)

      const premises = cas3PremisesFactory.build({
        status: 'archived',
        scheduleUnarchiveDate: tomorrowIso,
      })
      cy.task('stubSinglePremises', premises)
      cy.task('stubPremisesBedspaces', { premisesId: premises.id, bedspaces: cas3BedspacesFactory.build() })

      // When I visit the show premises page
      let showPage = PremisesShowPage.visit(premises)

      // And click on the "Cancel scheduled property online date" action
      showPage.clickCancelUnarchiveButton()

      // Then I should see the cancel unarchive premises page
      const cancelUnarchivePage = Page.verifyOnPage(PremisesCancelUnarchivePage, premises)

      // When I select "Yes" to confirm cancellation
      cancelUnarchivePage.selectYes()

      // When the backend responds with 200 ok
      const expectedPremises: Cas3Premises = {
        ...premises,
        scheduleUnarchiveDate: undefined,
      }
      cy.task('stubPremisesCancelUnarchive', expectedPremises)
      cy.task('stubSinglePremises', expectedPremises)

      // And I submit the form
      cancelUnarchivePage.clickSubmit()

      // Then the premises should have had its unarchive cancelled in the backend
      cy.task('verifyPremisesCancelUnarchive', premises.id).then(requests => {
        expect(requests).to.have.length(1)
      })

      // And I should be redirected to the show premises page
      showPage = Page.verifyOnPage(PremisesShowPage, expectedPremises)

      // And I should see a success message
      showPage.shouldShowScheduledUnarchiveCancelledBanner()
    })

    it('should redirect to show premises page when user selects no', () => {
      // Given there is a premises with a scheduled unarchive
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowIso = DateFormats.dateObjToIsoDate(tomorrow)

      const premises = cas3PremisesFactory.build({
        status: 'archived',
        scheduleUnarchiveDate: tomorrowIso,
      })
      cy.task('stubSinglePremises', premises)
      cy.task('stubPremisesBedspaces', { premisesId: premises.id, bedspaces: cas3BedspacesFactory.build() })

      // When I visit the show premises page
      const showPage = PremisesShowPage.visit(premises)

      // And click on the "Cancel scheduled property online date" action
      showPage.clickCancelUnarchiveButton()

      // Then I should see the cancel unarchive premises page
      const cancelUnarchivePage = Page.verifyOnPage(PremisesCancelUnarchivePage, premises)

      // When I select "No"
      cancelUnarchivePage.selectNo()

      // And I submit the form
      cancelUnarchivePage.clickSubmit()

      // Then I should be redirected to the show premises page without any API call
      Page.verifyOnPage(PremisesShowPage, premises)
    })

    it('should handle API errors when cancelling unarchive', () => {
      // Given there is a premises with a scheduled unarchive
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowIso = DateFormats.dateObjToIsoDate(tomorrow)

      const premises = cas3PremisesFactory.build({
        status: 'archived',
        scheduleUnarchiveDate: tomorrowIso,
      })
      cy.task('stubSinglePremises', premises)
      cy.task('stubPremisesBedspaces', { premisesId: premises.id, bedspaces: cas3BedspacesFactory.build() })

      // When I visit the show premises page
      const showPage = PremisesShowPage.visit(premises)

      // And click on the "Cancel scheduled property online date" action
      showPage.clickCancelUnarchiveButton()

      // Then I should see the cancel unarchive premises page
      let cancelUnarchivePage = Page.verifyOnPage(PremisesCancelUnarchivePage, premises)

      // When I select "Yes" to confirm cancellation
      cancelUnarchivePage.selectYes()

      // When the backend responds with an error
      cy.task('stubPremisesCancelUnarchiveErrors', {
        premisesId: premises.id,
        params: ['premisesNotScheduledToUnarchive'],
      })

      // And I submit the form
      cancelUnarchivePage.clickSubmit()

      // Then I should see an error message
      cancelUnarchivePage = Page.verifyOnPage(PremisesCancelUnarchivePage, premises)
      cancelUnarchivePage.shouldShowGivenErrorMessagesForField('premisesId', 'Property is not scheduled to go online')
    })
  })
})
