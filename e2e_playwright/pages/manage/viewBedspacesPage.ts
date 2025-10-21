import { Locator, Page, expect } from '@playwright/test'
import { Bedspace } from '@temporary-accommodation-ui/e2e'
import { BasePage } from '../basePage'
import { DateFormats } from '../../../server/utils/dateUtils'

export class ViewBedspacesPage extends BasePage {
  static async initialise(page: Page, shortAddress: string) {
    await expect(page.locator('h1')).toContainText(shortAddress)
    return new ViewBedspacesPage(page)
  }

  async shouldShowBedspace(bedspace: Bedspace) {
    const bedspaceSection = this.page
      .getByText(`Bedspace reference: ${bedspace.reference}`)
      .locator('..')
      .locator('..')
      .locator('dl')
    const rowTextHelper = this.getRowTextByLabelHelper(bedspaceSection)
    await expect(rowTextHelper('Bedspace status')).toContainText('Online')
    await expect(rowTextHelper('Start date')).toContainText(
      DateFormats.isoDateToUIDate(DateFormats.dateObjToIsoDate(new Date())),
    )
    const detailsRow = rowTextHelper('Bedspace details', true)
    await Promise.all(bedspace.details.map(async detail => expect(detailsRow).toContainText(detail)))
    await expect(rowTextHelper('Additional bedspace details')).toContainText(bedspace.additionalDetails)
  }

  async clickManageBedspaceLink(bedspace: Bedspace) {
    const bedspaceSection = this.page.getByText(`Bedspace reference: ${bedspace.reference}`).locator('..')
    await bedspaceSection.getByText('View bedspace').click()
  }

  private getRowTextByLabelHelper(locator: Locator) {
    return (label: string, exact: boolean = false): Locator => {
      return locator.getByText(label, { exact }).locator('..').locator('dd')
    }
  }
}
