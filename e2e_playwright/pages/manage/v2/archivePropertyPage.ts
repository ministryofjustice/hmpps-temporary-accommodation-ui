import { Page, expect } from '@playwright/test'
import { BasePage } from '../../basePage'

export class ArchivePropertyPage extends BasePage {
  static async initialise(page: Page, addressLine1: string) {
    await expect(page.locator('h1')).toContainText(`When should ${addressLine1} be archived?`)
    return new ArchivePropertyPage(page)
  }

  async archiveToday(): Promise<Date> {
    await this.page.getByLabel('Today').click()
    await this.clickSubmit()
    return new Date()
  }
}
