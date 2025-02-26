import { Page, expect } from '@playwright/test'
import { ProbationRegion } from '@temporary-accommodation-ui/e2e'
import { BasePage } from '../basePage'

export class ReportsPage extends BasePage {
  static async initialize(page: Page) {
    await expect(page.locator('h1')).toContainText('Reports')
    return new ReportsPage(page)
  }

  async enterFormDetails(probationRegion: ProbationRegion, startDate: string, endDate: string) {
    await this.selectProbationRegion(decodeURI(probationRegion.name))
    await this.enterStartDate(startDate)
    await this.enterEndDate(endDate)
  }

  private async selectProbationRegion(probationRegionName: string) {
    await this.page.getByLabel('Select a probation region').selectOption(probationRegionName)
  }

  private async enterStartDate(startDate: string) {
    await this.page.getByLabel('Start date').fill(startDate)
  }

  private async enterEndDate(endDate: string) {
    await this.page.getByLabel('End date').fill(endDate)
  }
}
