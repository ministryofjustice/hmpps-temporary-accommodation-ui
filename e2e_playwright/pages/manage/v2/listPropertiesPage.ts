import { Page, expect } from '@playwright/test'
import { BasePage } from '../../basePage'

export class ListPropertiesPage extends BasePage {
  static async initialise(page: Page) {
    await expect(page.locator('h1')).toContainText('Online properties')
    return new ListPropertiesPage(page)
  }

  static async goto(page: Page) {
    await page.goto('/v2/properties')
  }

  async clickAddPropertyButton() {
    await this.page.getByRole('button', { name: 'Add a property' }).click()
  }
}
