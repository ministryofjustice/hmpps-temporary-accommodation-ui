import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class CancelArchiveBedspacePage extends BasePage {
  static async initialise(page: Page, bedspaceArchiveDate: string) {
    await expect(page.locator('h1')).toContainText(
      `Are you sure you want to cancel the scheduled archive on ${bedspaceArchiveDate}?`,
    )
    return new CancelArchiveBedspacePage(page)
  }

  async clickYes(): Promise<void> {
    await this.page.getByLabel('Yes, I want to cancel it').click()
    await this.clickSubmit()
  }
}
