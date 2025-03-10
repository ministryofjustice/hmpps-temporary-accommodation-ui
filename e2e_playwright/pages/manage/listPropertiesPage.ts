import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class ListPropertiesPage extends BasePage {
  static async initialize(page: Page) {
    await expect(page.locator('h1')).toContainText('List of properties')
    return new ListPropertiesPage(page)
  }

  async clickAddPremisesButton() {
    await this.page.getByRole('button', { name: 'Add a property' }).click()
  }
}
