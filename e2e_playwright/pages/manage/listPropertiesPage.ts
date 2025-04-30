import { Page, expect } from '@playwright/test'
import { Property } from '@temporary-accommodation-ui/e2e'
import { BasePage } from '../basePage'

export class ListPropertiesPage extends BasePage {
  static async initialize(page: Page) {
    await expect(page.locator('h1')).toContainText('List of properties')
    return new ListPropertiesPage(page)
  }

  async clickAddPremisesButton() {
    await this.page.getByRole('button', { name: 'Add a property' }).click()
  }

  async getPropertyRow(property: Property) {
    return this.getTableRow(`${property.addressLine1}, ${property.postcode}`)
  }

  async clickManageLink(rowNumber: number) {
    await this.page.getByRole('link', { name: 'Manage' }).nth(rowNumber).click()
  }

  async searchForPostcodeOrAddress(postcodeOrAddress: string) {
    await this.page.getByLabel('Find a property').fill(postcodeOrAddress)
    await this.page.getByRole('button', { name: 'Search' }).click()
  }

  async checkAllEntriesMatchPostcodeOrAddress(postcodeOrAddress: string) {
    const tableRows = await this.page.locator('main table tbody tr').all()

    const promises = tableRows.map(async row => {
      const textContent = await row.textContent()
      expect(textContent).toContain(postcodeOrAddress)
    })

    await Promise.all(promises)
  }
}
