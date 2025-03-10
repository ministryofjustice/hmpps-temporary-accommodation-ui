import { Page, expect } from '@playwright/test'
import { BasePage } from '../basePage'

export class ViewPropertyPage extends BasePage {
  static async initialize(page: Page) {
    await expect(page.locator('h1')).toContainText('View a property')
    return new ViewPropertyPage(page)
  }

  async clickEditLink() {
    await this.clickLink('Edit')
  }

  async containsPropertyNameHeader(propertyTitle: string) {
    await expect(this.page.locator('h3').first()).toContainText(propertyTitle)
  }

  async containsProbationRegion(propertyProbationRegion: string) {
    await expect(this.page.locator('.govuk-summary-list__value').nth(2)).toContainText(propertyProbationRegion)
  }
}
