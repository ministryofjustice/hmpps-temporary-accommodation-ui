import { Page, expect } from '@playwright/test'
import { Property } from '@temporary-accommodation-ui/e2e'
import { BasePage } from '../basePage'

export class ListPropertiesPage extends BasePage {
  static async initialise(page: Page) {
    await expect(page.locator('h1')).toContainText('Online properties')
    return new ListPropertiesPage(page)
  }

  static async goto(page: Page) {
    await page.goto('/properties')
  }

  async clickAddPropertyButton() {
    await this.page.getByRole('button', { name: 'Add a property' }).click()
  }

  async searchForOnlineProperty(address: string) {
    await this.page.getByLabel('Find an online property').fill(address)
    await this.page.getByRole('button', { name: 'Search' }).click()
  }

  async checkAllEntriesMatchAddress(address: string) {
    const tableRows = await this.page.locator('table tbody tr').all()

    const promises = tableRows.map(async row => {
      const text = await row.textContent()
      expect(text).toContain(address)
    })

    await Promise.all(promises)
  }

  async clickManageLink(property: Property) {
    await this.page.locator('table tr').getByText(property.addressLine1).locator('..').getByText('Manage').click()
  }
}
