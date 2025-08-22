import { Page, expect } from '@playwright/test'
import { BasePage } from '../../basePage'

export class UnarchivePropertyPage extends BasePage {
  static async initialise(page: Page, addressLine1: string) {
    await expect(page.locator('h1')).toContainText(`When should ${addressLine1} go online?`)
    return new UnarchivePropertyPage(page)
  }

  async unarchiveToday(): Promise<Date> {
    await this.page.getByLabel('Today').click()
    await this.clickSubmit()
    return new Date()
  }
}
