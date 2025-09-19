import { Page, expect } from '@playwright/test'
import { BasePage } from '../../basePage'

export class CancelUnarchivePropertyPage extends BasePage {
  static async initialise(page: Page, propertyAddress: string) {
    await expect(page.locator('h1')).toContainText(`Are you sure you want to cancel the scheduled online date`)
    return new CancelUnarchivePropertyPage(page)
  }

  async selectYes() {
    await this.page.getByRole('radio', { name: 'Yes' }).click()
  }

  async selectNo() {
    await this.page.getByRole('radio', { name: 'No' }).click()
  }

  async confirmCancelUnarchive() {
    await this.selectYes()
    await this.clickSubmit()
  }
}
