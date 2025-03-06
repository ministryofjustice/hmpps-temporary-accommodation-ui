import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'
import { BedspaceSearchFormParameters } from '@approved-premises/ui'
import Page from '../../../../cypress_shared/pages/page'
import DashboardPage from '../../../../cypress_shared/pages/temporary-accommodation/dashboardPage'
import BedspaceSearchPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceSearch'
import {
  bedspaceSearchFormParametersFactory,
  bedspaceSearchResultFactory,
  bedspaceSearchResultsFactory,
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

    const searchParameters = bedspaceSearchFormParametersFactory.build({
      probationDeliveryUnits: [this.premises.probationDeliveryUnit.id],
      occupancyAttribute: characteristicsToSearchAttributes(this.premises, this.room).premisesOccupancyAttribute,
      attributes: [
        characteristicsToSearchAttributes(this.premises, this.room).wheelchairAccessibility,
      ] as BedspaceSearchFormParameters['attributes'],
    })

    page.completeForm(searchParameters)
    page.clickSubmit()

    cy.wrap(searchParameters).as('searchParameters')
  })
})

Then('I should see the bedspace search results', () => {
  cy.then(function _() {
    const results = bedspaceSearchResultsFactory.build({
      results: [
        bedspaceSearchResultFactory.forBedspace(this.premises, this.room).build({
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
