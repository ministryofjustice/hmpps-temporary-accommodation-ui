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

  async scheduleFutureArchive(): Promise<Date> {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    await this.page.getByLabel('Another date').click()

    const dateGroupName = 'Enter a date within the last 7 days or the next 3 months'
    const dateGroup = this.page.getByRole('group', { name: dateGroupName })
    await expect(dateGroup).toBeVisible()

    await dateGroup.getByLabel('Day').fill(tomorrow.getDate().toString())
    await dateGroup.getByLabel('Month').fill((tomorrow.getMonth() + 1).toString())
    await dateGroup.getByLabel('Year').fill(tomorrow.getFullYear().toString())

    await this.clickSubmit()
    return tomorrow
  }
}
