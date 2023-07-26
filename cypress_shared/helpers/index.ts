import {
  ArrayOfOASysOffenceDetailsQuestions,
  ArrayOfOASysRiskManagementPlanQuestions,
  ArrayOfOASysRiskOfSeriousHarmSummaryQuestions,
  ArrayOfOASysRiskToSelfQuestions,
  ArrayOfOASysSupportingInformationQuestions,
} from '@approved-premises/api'
import { TableRow } from '@approved-premises/ui'
import oasysDataJson from '../fixtures/oasysData.json'

const roshSummariesFromJson = (): ArrayOfOASysRiskOfSeriousHarmSummaryQuestions => {
  return oasysDataJson['rosh-summary'].roshSummaries as ArrayOfOASysRiskOfSeriousHarmSummaryQuestions
}

const offenceDetailSummariesFromJson = (): ArrayOfOASysOffenceDetailsQuestions => {
  return oasysDataJson['offence-details'].offenceDetailsSummaries as ArrayOfOASysOffenceDetailsQuestions
}

const supportInformationFromJson = (): ArrayOfOASysSupportingInformationQuestions => {
  return oasysDataJson['supporting-information']
    .supportingInformationSummaries as ArrayOfOASysSupportingInformationQuestions
}

const riskManagementPlanFromJson = (): ArrayOfOASysRiskManagementPlanQuestions => {
  return oasysDataJson['risk-management-plan'].riskManagementSummaries as ArrayOfOASysRiskManagementPlanQuestions
}

const riskToSelfSummariesFromJson = (): ArrayOfOASysRiskToSelfQuestions => {
  return oasysDataJson['risk-to-self'].riskToSelfSummaries as ArrayOfOASysRiskToSelfQuestions
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
  offenceDetailSummariesFromJson,
  riskManagementPlanFromJson,
  riskToSelfSummariesFromJson,
  roshSummariesFromJson,
  shouldShowTableRows,
  supportInformationFromJson,
  tableRowsToArrays,
}
