import { Page, expect } from '@playwright/test'
import { Bedspace } from '@temporary-accommodation-ui/e2e'
import { BasePage } from '../basePage'

export class AddBedspacePage extends BasePage {
  static async initialise(page: Page) {
    await expect(page.locator('h1')).toContainText('Add a bedspace')
    return new AddBedspacePage(page)
  }

  async enterFormDetails(bedspace: Bedspace) {
    await this.page.getByLabel('Enter a bedspace reference').fill(bedspace.reference)
    await this.enterStartDate(bedspace.startDate)
    await this.enterCharacteristics(bedspace)
    await this.page.getByLabel('Additional bedspace details').fill(bedspace.additionalDetails)
  }

  async enterStartDate(startDate: Date) {
    await this.page.getByLabel('Day').clear()
    await this.page.getByLabel('Day').fill(startDate.getDate().toString())
    await this.page.getByLabel('Month').clear()
    await this.page.getByLabel('Month').fill((startDate.getMonth() + 1).toString())
    await this.page.getByLabel('Year').clear()
    await this.page.getByLabel('Year').fill(startDate.getFullYear().toString())
  }

  async enterCharacteristics(bedspace: Bedspace) {
    const checkboxes = await this.page.getByRole('checkbox').all()
    bedspace.details = await this.checkRandomCheckboxes(checkboxes)
  }
}
