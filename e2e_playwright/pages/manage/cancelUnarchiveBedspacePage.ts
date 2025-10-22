import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class CancelUnarchiveBedspacePage extends BasePage {
  static async initialise(page: Page, bedspaceUnarchiveDate: string) {
    await expect(page.locator('h1')).toContainText(
      `Are you sure you want to cancel the scheduled online date of ${bedspaceUnarchiveDate}?`,
    )
    return new CancelUnarchiveBedspacePage(page)
  }

  async clickYes(): Promise<void> {
    await this.page.getByLabel('Yes, I want to cancel it').click()
    await this.clickSubmit()
  }
}
