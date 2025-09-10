import { Page, expect } from '@playwright/test'
import { BasePage } from '../../basePage'

export class ArchiveBedspacePage extends BasePage {
  static async initialise(page: Page, bedspaceReference: string) {
    await expect(page.locator('h1')).toContainText(`When should ${bedspaceReference} be archived?`)
    return new ArchiveBedspacePage(page)
  }

  async archiveToday(): Promise<Date> {
    await this.page.getByLabel('Today').click()
    await this.clickSubmit()
    return new Date()
  }
}
