import {
  ApprovedPremisesApplication,
  ArrayOfOASysOffenceDetailsQuestions,
  ArrayOfOASysRiskManagementPlanQuestions,
  ArrayOfOASysRiskOfSeriousHarmSummaryQuestions,
  ArrayOfOASysRiskToSelfQuestions,
  ArrayOfOASysSupportingInformationQuestions,
} from '@approved-premises/api'
import { TableRow } from '@approved-premises/ui'

const roshSummariesFromApplication = (
  application: ApprovedPremisesApplication,
): ArrayOfOASysRiskOfSeriousHarmSummaryQuestions => {
  return application.data['oasys-import']['rosh-summary'].roshSummaries as ArrayOfOASysRiskOfSeriousHarmSummaryQuestions
}

const offenceDetailSummariesFromApplication = (
  application: ApprovedPremisesApplication,
): ArrayOfOASysOffenceDetailsQuestions => {
  return application.data['oasys-import']['offence-details']
    .offenceDetailsSummaries as ArrayOfOASysOffenceDetailsQuestions
}

const supportInformationFromApplication = (
  application: ApprovedPremisesApplication,
): ArrayOfOASysSupportingInformationQuestions => {
  return application.data['oasys-import']['supporting-information']
    .supportingInformationSummaries as ArrayOfOASysSupportingInformationQuestions
}

const riskManagementPlanFromApplication = (
  application: ApprovedPremisesApplication,
): ArrayOfOASysRiskManagementPlanQuestions => {
  return application.data['oasys-import']['risk-management-plan']
    .riskManagementSummaries as ArrayOfOASysRiskManagementPlanQuestions
}

const riskToSelfSummariesFromApplication = (
  application: ApprovedPremisesApplication,
): ArrayOfOASysRiskToSelfQuestions => {
  return application.data['oasys-import']['risk-to-self'].riskToSelfSummaries as ArrayOfOASysRiskToSelfQuestions
}

const tableRowsToArrays = (tableRows: Array<TableRow>): Array<Array<string>> => {
  return tableRows.map(row => Object.keys(row).map(i => (row[i].html ? Cypress.$(row[i].html).text() : row[i].text)))
}

const shouldShowTableRows = <T>(items: Array<T>, tableRowFunction: (items: Array<T>) => Array<TableRow>): void => {
  const tableRows = tableRowFunction(items)
  const rowItems = tableRowsToArrays(tableRows)

  rowItems.forEach(columns => {
    const headerCell = columns.shift()
    cy.contains('th', headerCell)
      .parent('tr')
      .within(() => {
        columns.forEach((e, i) => {
          cy.get('td').eq(i).invoke('text').should('contain', e)
        })
      })
  })
}

export {
  roshSummariesFromApplication,
  offenceDetailSummariesFromApplication,
  supportInformationFromApplication,
  riskManagementPlanFromApplication,
  riskToSelfSummariesFromApplication,
  tableRowsToArrays,
  shouldShowTableRows,
}
