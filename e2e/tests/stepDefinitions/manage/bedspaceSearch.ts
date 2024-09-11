import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'
import Page from '../../../../cypress_shared/pages/page'
import DashboardPage from '../../../../cypress_shared/pages/temporary-accommodation/dashboardPage'
import BedspaceSearchPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceSearch'
import {
  bedSearchParametersFactory,
  bedSearchResultFactory,
  bedSearchResultsFactory,
} from '../../../../server/testutils/factories'
import { characteristicsToSearchAttributes } from '../../../../cypress_shared/utils/bedspaceSearch'

Given("I'm searching for a bedspace", () => {
  const dashboardPage = Page.verifyOnPage(DashboardPage)
  dashboardPage.clickSearchBedspacesLink()

  Page.verifyOnPage(BedspaceSearchPage)
})

Given('I search for a bedspace', () => {
  cy.then(function _() {
    const page = Page.verifyOnPage(BedspaceSearchPage)

    const searchParameters = bedSearchParametersFactory.build({
      probationDeliveryUnit: this.premises.probationDeliveryUnit.name,
      attributes: characteristicsToSearchAttributes(this.premises),
    })

    page.completeForm(searchParameters)
    page.clickSubmit()

    cy.wrap(searchParameters).as('searchParameters')
  })
})

Given('I attempt to search for a bedspace with required details missing', () => {
  cy.then(function _() {
    const page = Page.verifyOnPage(BedspaceSearchPage)
    page.clearTextInputByLabel('Number of days required')
    page.clickSubmit()
  })
})

Then('I should see the bedspace search results', () => {
  cy.then(function _() {
    const results = bedSearchResultsFactory.build({
      results: [
        bedSearchResultFactory.forBedspace(this.premises, this.room).build({
          overlaps: [],
        }),
      ],
    })

    cy.wrap({ room: this.room, sr: results })

    const page = Page.verifyOnPage(BedspaceSearchPage, results)

    page.shouldShowSearchResults(false)
    page.shouldShowPrefilledSearchParameters(this.searchParameters)
  })
})

Then('I should see a list of the problems encountered searching for a bedspace', () => {
  cy.then(function _() {
    const page = Page.verifyOnPage(BedspaceSearchPage)
    page.shouldShowErrorMessagesForFields(
      ['startDate', 'durationDays', 'probationDeliveryUnit'],
      'empty',
      'bedspaceSearch',
    )
  })
})
