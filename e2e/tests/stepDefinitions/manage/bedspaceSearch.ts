import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'
import { BedspaceSearchFormParameters } from '@approved-premises/ui'
import Page from '../../../../cypress_shared/pages/page'
import DashboardPage from '../../../../cypress_shared/pages/temporary-accommodation/dashboardPage'
import BedspaceSearchPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bedspaceSearch'
import {
  bedspaceSearchFormParametersFactory,
  cas3v2BedspaceSearchResultFactory,
  cas3v2BedspaceSearchResultsFactory,
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

    const occupancyAttribute = characteristicsToSearchAttributes(
      this.premises,
      this.bedspace,
    ).premisesOccupancyAttribute
    const { wheelchairAccessibility, sexualRiskAttributes } = characteristicsToSearchAttributes(
      this.premises,
      this.bedspace,
    )

    const searchParameters = bedspaceSearchFormParametersFactory.build({
      probationDeliveryUnits: [this.premises.probationDeliveryUnit.id],
    })

    if (occupancyAttribute) {
      searchParameters.occupancyAttribute = occupancyAttribute as BedspaceSearchFormParameters['occupancyAttribute']
    }
    if (sexualRiskAttributes) {
      searchParameters.sexualRiskAttributes = sexualRiskAttributes
    }
    if (wheelchairAccessibility) {
      searchParameters.accessibilityAttributes = [
        wheelchairAccessibility,
      ] as BedspaceSearchFormParameters['accessibilityAttributes']
    }

    page.completeForm(searchParameters)
    page.clickSubmit()

    cy.wrap(searchParameters).as('searchParameters')
  })
})

Then('I should see the bedspace search results', () => {
  cy.then(function _() {
    const results = cas3v2BedspaceSearchResultsFactory.build({
      results: [
        cas3v2BedspaceSearchResultFactory.forBedspace(this.premises, this.bedspace).build({
          overlaps: [],
        }),
      ],
    })

    cy.wrap({ bedspace: this.bedspace, sr: results })

    const page = Page.verifyOnPage(BedspaceSearchPage, results)

    page.shouldShowSearchResults(false)
    page.shouldShowPrefilledSearchParameters(this.searchParameters)
  })
})
