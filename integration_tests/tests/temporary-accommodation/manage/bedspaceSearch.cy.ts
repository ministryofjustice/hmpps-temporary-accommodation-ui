import Page from '../../../../cypress_shared/pages/page'
import DashboardPage from '../../../../cypress_shared/pages/temporary-accommodation/dashboardPage'
import BedspaceSearchPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceSearch'
import BedspaceShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceShow'
import setupTestUser from '../../../../cypress_shared/utils/setupTestUser'
import {
  bedSearchParametersFactory,
  bedSearchResultFactory,
  bedSearchResultsFactory,
  premisesFactory,
  roomFactory,
} from '../../../../server/testutils/factories'

context('Bedspace Search', () => {
  beforeEach(() => {
    cy.task('reset')
    setupTestUser()
  })

  it('navigates to the bedspace search page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is reference data in the database
    cy.task('stubBedspaceSearchReferenceData')

    // When I visit the dashboard page
    const page = DashboardPage.visit()

    // Add I click the search bedspaces link
    page.clickSearchBedspacesLink()

    // Then I navigate to the bedspace search page
    Page.verifyOnPage(BedspaceSearchPage)
  })

  it('shows search results', () => {
    // Given I am signed in
    cy.signIn()

    // And there is reference data in the database
    cy.task('stubBedspaceSearchReferenceData')

    // When I visit the search bedspaces page
    const preSearchPage = BedspaceSearchPage.visit()

    // And when I fill out the form
    const results = bedSearchResultsFactory.build()
    cy.task('stubBedSearch', results)

    const searchParameters = bedSearchParametersFactory.build()
    preSearchPage.completeForm(searchParameters)
    preSearchPage.clickSubmit()

    // Then a search should have been recieved by the API
    cy.task('verifyBedSearch').then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.startDate).equal(searchParameters.startDate)
      expect(requestBody.durationDays).equal(searchParameters.durationDays)
      expect(requestBody.probationDeliveryUnit).equal(searchParameters.probationDeliveryUnit)
    })

    // And I should see the search results
    const postSearchPage = Page.verifyOnPage(BedspaceSearchPage, results)
    postSearchPage.shouldShowPrefilledSearchParameters(searchParameters)
    postSearchPage.shouldShowSearchResults()
  })

  it('shows empty search results', () => {
    // Given I am signed in
    cy.signIn()

    // And there is reference data in the database
    cy.task('stubBedspaceSearchReferenceData')

    // When I visit the search bedspaces page
    const preSearchPage = BedspaceSearchPage.visit()

    // And when I fill out the form
    const results = bedSearchResultsFactory.build({
      results: [],
      resultsPremisesCount: 0,
      resultsRoomCount: 0,
      resultsBedCount: 0,
    })
    cy.task('stubBedSearch', results)

    const searchParameters = bedSearchParametersFactory.build()
    preSearchPage.completeForm(searchParameters)
    preSearchPage.clickSubmit()

    // Then a search should have been recieved by the API
    cy.task('verifyBedSearch').then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.startDate).equal(searchParameters.startDate)
      expect(requestBody.durationDays).equal(searchParameters.durationDays)
      expect(requestBody.probationDeliveryUnit).equal(searchParameters.probationDeliveryUnit)
    })

    // And I should see empty search results
    const postSearchPage = Page.verifyOnPage(BedspaceSearchPage)
    postSearchPage.shouldShowPrefilledSearchParameters(searchParameters)
    postSearchPage.shouldShowEmptySearchResults()
  })

  it('allows me to navigate to the show bedspace page', () => {
    // Given I am signed in
    cy.signIn()

    // And there is reference data in the database
    cy.task('stubBedspaceSearchReferenceData')

    // When I visit the search bedspaces page
    const preSearchPage = BedspaceSearchPage.visit()

    // And when I fill out the form
    const premises = premisesFactory.build()
    const room = roomFactory.build()
    const results = bedSearchResultsFactory.build({
      results: [bedSearchResultFactory.forBedspace(premises, room).build()],
    })

    cy.task('stubBedSearch', results)
    cy.task('stubSinglePremises', premises)
    cy.task('stubSingleRoom', { premisesId: premises.id, room })

    const searchParameters = bedSearchParametersFactory.build()
    preSearchPage.completeForm(searchParameters)
    preSearchPage.clickSubmit()

    // I should be able to navigate to a bedspace
    const postSearchPage = Page.verifyOnPage(BedspaceSearchPage, results)
    postSearchPage.clickBedspaceLink(room)

    Page.verifyOnPage(BedspaceShowPage, premises, room)
  })

  it('shows errors when the API returns an error', () => {
    // Given I am signed in
    cy.signIn()

    // And there is reference data in the database
    cy.task('stubBedspaceSearchReferenceData')

    // When I visit the search bedspaces page
    const page = BedspaceSearchPage.visit()

    // And I miss required fields
    cy.task('stubBedSearchErrors', ['startDate', 'durationDays', 'probationDeliveryUnit'])
    page.clickSubmit()

    // Then I should see error messages relating to those fields
    page.shouldShowErrorMessagesForFields(
      ['startDate', 'durationDays', 'probationDeliveryUnit'],
      'empty',
      'bedspaceSearch',
    )
  })

  it('navigates back from the bedspace search page to the dashboard', () => {
    // Given I am signed in
    cy.signIn()

    // And there is reference data in the database
    cy.task('stubBedspaceSearchReferenceData')

    // When I visit the search bedspaces page
    const page = BedspaceSearchPage.visit()

    // And I click the previous bread crumb
    page.clickBreadCrumbUp()

    // Then I navigate to the dashboard page
    Page.verifyOnPage(DashboardPage)
  })
})
