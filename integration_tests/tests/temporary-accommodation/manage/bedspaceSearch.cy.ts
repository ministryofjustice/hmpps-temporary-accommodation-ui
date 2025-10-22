import { faker } from '@faker-js/faker/locale/en'
import Page from '../../../../cypress_shared/pages/page'
import DashboardPage from '../../../../cypress_shared/pages/temporary-accommodation/dashboardPage'
import AssessmentSummaryPage from '../../../../cypress_shared/pages/assess/summary'
import BedspaceSearchPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceSearch'
import BedspaceShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceShow'
import { setupTestUser } from '../../../../cypress_shared/utils/setupTestUser'
import {
  assessmentFactory,
  bedFactory,
  bedspaceSearchFormParametersFactory,
  bedspaceSearchResultFactory,
  bedspaceSearchResultsFactory,
  bookingFactory,
  cas3BedspaceFactory,
  cas3PremisesFactory,
  lostBedFactory,
  overlapFactory,
  personFactory,
  placeContextFactory,
  timelineEventsFactory,
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
    const results = bedspaceSearchResultsFactory.build()
    cy.task('stubBedspaceSearch', results)

    const searchParameters = bedspaceSearchFormParametersFactory.build()
    preSearchPage.completeForm(searchParameters)
    preSearchPage.clickSubmit()

    // Then a search should have been received by the API
    cy.task('verifyBedSearch').then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.startDate).equal(searchParameters.startDate)
      expect(requestBody.durationDays).equal(searchParameters.durationDays)
      expect(requestBody.probationDeliveryUnits).to.have.members(searchParameters.probationDeliveryUnits)

      if (searchParameters.accessibilityAttributes?.length) {
        expect(requestBody.bedspaceFilters?.includedCharacteristicIds).to.have.members(
          searchParameters.accessibilityAttributes,
        )
      }

      if (searchParameters.sexualRiskAttributes?.length) {
        expect(requestBody.premisesFilters?.excludedCharacteristicIds).to.have.members(
          searchParameters.sexualRiskAttributes,
        )
      }

      if (searchParameters.occupancyAttribute && searchParameters.occupancyAttribute !== 'all') {
        expect(requestBody.premisesFilters?.includedCharacteristicIds).to.include(searchParameters.occupancyAttribute)
      }
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
    const results = bedspaceSearchResultsFactory.build({
      results: [],
      resultsPremisesCount: 0,
      resultsRoomCount: 0,
      resultsBedCount: 0,
    })
    cy.task('stubBedspaceSearch', results)

    const searchParameters = bedspaceSearchFormParametersFactory.build()
    preSearchPage.completeForm(searchParameters)
    preSearchPage.clickSubmit()

    // Then a search should have been received by the API
    cy.task('verifyBedSearch').then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.startDate).equal(searchParameters.startDate)
      expect(requestBody.durationDays).equal(searchParameters.durationDays)
      expect(requestBody.probationDeliveryUnits).to.include.members(searchParameters.probationDeliveryUnits)

      if (searchParameters.accessibilityAttributes?.length) {
        expect(requestBody.bedspaceFilters?.includedCharacteristicIds).to.have.members(
          searchParameters.accessibilityAttributes,
        )
      }

      if (searchParameters.sexualRiskAttributes?.length) {
        expect(requestBody.premisesFilters?.excludedCharacteristicIds).to.have.members(
          searchParameters.sexualRiskAttributes,
        )
      }

      if (searchParameters.occupancyAttribute && searchParameters.occupancyAttribute !== 'all') {
        expect(requestBody.premisesFilters?.includedCharacteristicIds).to.include(searchParameters.occupancyAttribute)
      }
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

    const premisesId = faker.string.uuid()
    const bedspaceId = faker.string.uuid()

    // And when I fill out the form
    const premises = cas3PremisesFactory.build({ id: premisesId, status: 'online', reference: 'Test premises' })
    const cas3Bedspace = cas3BedspaceFactory.build({ id: bedspaceId, reference: 'Test bedspace', status: 'online' })
    const bookings = bookingFactory
      .params({
        bed: bedFactory.build({ id: cas3Bedspace.id }),
      })
      .buildList(5)
    const lostBeds = lostBedFactory
      .active()
      .params({
        bedId: cas3Bedspace.id,
      })
      .buildList(5)

    const results = bedspaceSearchResultsFactory.build({
      results: [bedspaceSearchResultFactory.forBedspace(premises, cas3Bedspace).build()],
    })

    cy.task('stubBedspaceSearch', results)
    cy.task('stubSinglePremisesV2', premises)
    cy.task('stubBedspaceV2', { premisesId: premises.id, bedspace: cas3Bedspace })
    cy.task('stubBookingsForPremisesId', { premisesId: premises.id, bookings })
    cy.task('stubLostBedsForPremisesId', { premisesId: premises.id, lostBeds })

    const searchParameters = bedspaceSearchFormParametersFactory.build()
    preSearchPage.completeForm(searchParameters)
    preSearchPage.clickSubmit()

    // I should be able to navigate to a bedspace
    const postSearchPage = Page.verifyOnPage(BedspaceSearchPage, results)
    postSearchPage.clickBedspaceLink(cas3Bedspace)
    Page.verifyOnPage(BedspaceShowPage, cas3Bedspace)
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
    const premises = cas3PremisesFactory.build()
    const bedspace = cas3BedspaceFactory.build({ status: 'online' })
    const assessment = assessmentFactory.build({ status: 'closed' })
    const timeline = timelineEventsFactory.build()

    const results = bedspaceSearchResultsFactory.build({
      results: [
        bedspaceSearchResultFactory.forBedspace(premises, bedspace).build({
          overlaps: [
            overlapFactory.build({
              name: person.name,
              crn: person.crn,
              personType: person.type,
              roomId: bedspace.id,
              assessmentId: assessment.id,
              days: 5,
              sex: person.sex,
            }),
          ],
        }),
      ],
    })

    cy.task('stubBedspaceSearch', results)
    cy.task('stubSinglePremisesV2', premises)
    cy.task('stubFindAssessment', { ...assessment, status: 'closed' })
    cy.task('stubAssessmentReferralHistoryGet', {
      assessment,
      referralNotes: timelineEventsFactory.build().events,
    })

    // And when I fill out the form
    const searchParameters = bedspaceSearchFormParametersFactory.build()
    preSearchPage.completeForm(searchParameters)
    preSearchPage.clickSubmit()

    // I should be able to navigate to the overlapping booking
    const postSearchPage = Page.verifyOnPage(BedspaceSearchPage, results)
    postSearchPage.clickOverlapLink(bedspace, person.crn)

    Page.verifyOnPage(AssessmentSummaryPage, assessment, timeline)
  })

  it('shows validation errors when required fields are missing or incorrect', () => {
    // Given I am signed in
    cy.signIn()

    // And there is reference data in the database
    cy.task('stubBedspaceSearchReferenceData')

    // When I visit the search bedspaces page
    const page = BedspaceSearchPage.visit()

    // And I miss required fields
    cy.task('stubBedspaceSearchErrors', ['startDate', 'durationDays', 'probationDeliveryUnits'])
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
    const results = bedspaceSearchResultsFactory.build()
    cy.task('stubBedspaceSearch', results)

    const searchParameters = bedspaceSearchFormParametersFactory.build()
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
    const results = bedspaceSearchResultsFactory.build()
    cy.task('stubBedspaceSearch', results)

    const searchParameters = bedspaceSearchFormParametersFactory.build()
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
