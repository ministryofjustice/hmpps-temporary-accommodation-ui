import { OASysQuestion, OASysSupportingInformationQuestion } from '@approved-premises/api'
import { TableRow } from '@approved-premises/ui'
import oasysDataJson from '../fixtures/oasysData.json'

const roshSummariesFromJson = (): Array<OASysQuestion> => {
  return oasysDataJson['rosh-summary'].roshSummaries as Array<OASysQuestion>
}

const offenceDetailSummariesFromJson = (): Array<OASysQuestion> => {
  return oasysDataJson['offence-details'].offenceDetailsSummaries as Array<OASysQuestion>
}

const supportInformationFromJson = (): Array<OASysSupportingInformationQuestion> => {
  return oasysDataJson['supporting-information']
    .supportingInformationSummaries as Array<OASysSupportingInformationQuestion>
}

const riskManagementPlanFromJson = (): Array<OASysQuestion> => {
  return oasysDataJson['risk-management-plan'].riskManagementSummaries as Array<OASysQuestion>
}

const riskToSelfSummariesFromJson = (): Array<OASysQuestion> => {
  return oasysDataJson['risk-to-self'].riskToSelfSummaries as Array<OASysQuestion>
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
