import { Page, expect } from '@playwright/test'
import { BasePage } from '../../basePage'

export class ArchiveBedspacePage extends BasePage {
  static async initialise(page: Page, bedspaceReference: string) {
    await expect(page.locator('h1')).toContainText(`When should ${bedspaceReference} be archived?`)
    return new ArchiveBedspacePage(page)
  }

  async archiveAnotherDate(date: Date): Promise<Date> {
    await this.page.getByLabel('Another date').click()
    await this.enterArchiveDate(date)
    await this.clickSubmit()
    return date
  }

  async enterArchiveDate(date: Date) {
    await this.page.getByRole('textbox', { name: 'Day' }).clear()
    await this.page.getByRole('textbox', { name: 'Day' }).fill(date.getDate().toString())
    await this.page.getByRole('textbox', { name: 'Month' }).clear()
    await this.page.getByRole('textbox', { name: 'Month' }).fill((date.getMonth() + 1).toString())
    await this.page.getByRole('textbox', { name: 'Year' }).clear()
    await this.page.getByRole('textbox', { name: 'Year' }).fill(date.getFullYear().toString())
  }

  async archiveToday(): Promise<Date> {
    await this.page.getByLabel('Today').click()
    await this.clickSubmit()
    return new Date()
  }
}
