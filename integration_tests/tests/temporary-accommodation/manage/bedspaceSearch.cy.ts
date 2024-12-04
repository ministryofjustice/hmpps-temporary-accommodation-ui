import Page from '../../../../cypress_shared/pages/page'
import DashboardPage from '../../../../cypress_shared/pages/temporary-accommodation/dashboardPage'
import AssessmentSummaryPage from '../../../../cypress_shared/pages/assess/summary'
import BedspaceSearchPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceSearch'
import BedspaceShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceShow'
import { setupTestUser } from '../../../../cypress_shared/utils/setupTestUser'
import {
  assessmentFactory,
  bedSearchParametersFactory,
  bedSearchResultFactory,
  bedSearchResultsFactory,
  overlapFactory,
  personFactory,
  placeContextFactory,
  premisesFactory,
  roomFactory,
} from '../../../../server/testutils/factories'

context('Bedspace Search', () => {
  beforeEach(() => {
    cy.task('reset')
    setupTestUser('assessor')
  })

  it('navigates to the bedspace search page with a default number of days', () => {
    // Given I am signed in
    cy.signIn()

    // And there is reference data in the database
    cy.task('stubBedspaceSearchReferenceData')

    // When I visit the dashboard page
    const page = DashboardPage.visit()

    // Add I click the search bedspaces link
    page.clickSearchBedspacesLink()

    // Then I navigate to the bedspace search page
    const searchPage = Page.verifyOnPage(BedspaceSearchPage)

    searchPage.shouldShowTextInputByLabel('Number of days required', '84')
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

    // Then a search should have been received by the API
    cy.task('verifyBedSearch').then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.startDate).equal(searchParameters.startDate)
      expect(requestBody.durationDays).equal(searchParameters.durationDays)
      expect(requestBody.probationDeliveryUnits).to.have.members(searchParameters.probationDeliveryUnits)
      expect(requestBody.attributes).to.have.members(searchParameters.attributes)
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

    // Then a search should have been received by the API
    cy.task('verifyBedSearch').then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.startDate).equal(searchParameters.startDate)
      expect(requestBody.durationDays).equal(searchParameters.durationDays)
      expect(requestBody.probationDeliveryUnits).to.include.members(searchParameters.probationDeliveryUnits)
      expect(requestBody.attributes).to.have.members(searchParameters.attributes)
    })

    // And I should see empty search results
    const postSearchPage = Page.verifyOnPage(BedspaceSearchPage, results)
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

  it("allows me to view an overlapping offender's referral", () => {
    // Given I am signed in
    cy.signIn()

    // And there is reference data in the database
    cy.task('stubBedspaceSearchReferenceData')

    // When I visit the search bedspaces page
    const preSearchPage = BedspaceSearchPage.visit()

    // And there is a bedspace with an overlap in the database
    const person = personFactory.build({ crn: 'known-crn' })
    const premises = premisesFactory.build()
    const room = roomFactory.build()

    const assessment = assessmentFactory.build({ status: 'closed' })

    const results = bedSearchResultsFactory.build({
      results: [
        bedSearchResultFactory.forBedspace(premises, room).build({
          overlaps: [
            overlapFactory.build({
              name: person.name,
              crn: person.crn,
              personType: person.type,
              roomId: room.id,
              assessmentId: assessment.id,
              days: 5,
              sex: person.sex,
            }),
          ],
        }),
      ],
    })

    cy.task('stubBedSearch', results)
    cy.task('stubSinglePremises', premises)
    cy.task('stubSingleRoom', { premisesId: premises.id, room })
    cy.task('stubFindAssessment', { ...assessment, status: 'closed' })

    // And when I fill out the form
    const searchParameters = bedSearchParametersFactory.build()
    preSearchPage.completeForm(searchParameters)
    preSearchPage.clickSubmit()

    // I should be able to navigate to the overlapping booking
    const postSearchPage = Page.verifyOnPage(BedspaceSearchPage, results)
    postSearchPage.clickOverlapLink(room, person.crn)

    Page.verifyOnPage(AssessmentSummaryPage, assessment)
  })

  it('shows errors when the API returns an error', () => {
    // Given I am signed in
    cy.signIn()

    // And there is reference data in the database
    cy.task('stubBedspaceSearchReferenceData')

    // When I visit the search bedspaces page
    const page = BedspaceSearchPage.visit()

    // And I miss required fields
    cy.task('stubBedSearchErrors', ['startDate', 'durationDays', 'probationDeliveryUnits'])
    page.clearTextInputByLabel('Number of days required')
    page.clickSubmit()

    // Then I should see error messages relating to those fields
    page.shouldShowErrorMessagesForFields(
      ['startDate', 'durationDays', 'probationDeliveryUnits'],
      'empty',
      'bedspaceSearch',
    )
  })

  it('clears search results', () => {
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

    // Then I should see the search results
    const postSearchPage = Page.verifyOnPage(BedspaceSearchPage, results)
    postSearchPage.shouldShowPrefilledSearchParameters(searchParameters)
    postSearchPage.shouldShowSearchResults()

    // When I click Clear filters
    postSearchPage.clickClearFilters()

    // Then I should see the search form with default values
    const searchPage = Page.verifyOnPage(BedspaceSearchPage)
    searchPage.shouldShowDefaultSearchParameters()
  })

  it('clears search results but retains the place context', () => {
    // Given I am signed in
    cy.signIn()

    // And there is reference data in the database
    cy.task('stubBedspaceSearchReferenceData')

    // When I visit the search bedspaces page with a place context
    const placeContext = placeContextFactory.build()
    cy.task('stubFindAssessment', placeContext.assessment)
    const preSearchPage = BedspaceSearchPage.visit(placeContext)

    // And when I fill out the form
    const results = bedSearchResultsFactory.build()
    cy.task('stubBedSearch', results)

    const searchParameters = bedSearchParametersFactory.build()
    preSearchPage.completeForm(searchParameters)
    preSearchPage.clickSubmit()

    // Then I should see the search results with the place context
    const postSearchPage = Page.verifyOnPage(BedspaceSearchPage, results)
    postSearchPage.shouldShowPlaceContextHeader(placeContext)

    // When I click Clear filters
    postSearchPage.clickClearFilters()

    // Then I should see the search form with default values
    const searchPage = Page.verifyOnPage(BedspaceSearchPage)
    searchPage.shouldShowDefaultSearchParameters(placeContext)

    // And I should see the place context
    searchPage.shouldShowPlaceContextHeader(placeContext)
  })

  it('navigates back from the bedspace search page to the dashboard', () => {
    // Given I am signed in
    cy.signIn()

    // And there is reference data in the database
    cy.task('stubBedspaceSearchReferenceData')

    // When I visit the search bedspaces page
    const page = BedspaceSearchPage.visit()

    // And I click the previous bread crumb
    page.clickBack()

    // Then I navigate to the dashboard page
    Page.verifyOnPage(DashboardPage)
  })
})
