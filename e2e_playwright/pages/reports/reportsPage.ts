import { Page, expect } from '@playwright/test'
import { ProbationRegion } from '@temporary-accommodation-ui/e2e'
import { BasePage } from '../basePage'

const today = new Date()

export class ReportsPage extends BasePage {
  static async initialize(page: Page) {
    await expect(page.locator('h1')).toContainText('Reports')
    return new ReportsPage(page)
  }

  async enterFormDetails(probationRegion: ProbationRegion) {
    await this.selectProbationRegion(decodeURI(probationRegion.name))
    await this.pickStartDateUsingDatePicker()
    await this.pickEndDateUsingDatePicker()
  }

  private async selectProbationRegion(probationRegionName: string) {
    await this.page.getByLabel('Select a probation region').selectOption(probationRegionName)
  }

  private async pickStartDateUsingDatePicker() {
    const firstDayOfLastMonth = `1/${today.getMonth()}/${today.getFullYear()}`
    await this.clickFirstElementByClass('moj-datepicker__toggle moj-js-datepicker-toggle')
    await this.clickFirstElementByClass('moj-datepicker__button moj-js-datepicker-prev-month')
    await this.page.getByTestId(firstDayOfLastMonth).click()
  }

  private async pickEndDateUsingDatePicker() {
    const thisMonth = today.getMonth() + 1
    const firstDayOfThisMonth = `1/${thisMonth}/${today.getFullYear()}`
    await this.clickElementByClass('moj-datepicker__toggle moj-js-datepicker-toggle', 1)
    await this.page.locator('#datepicker-endDate').getByTestId(firstDayOfThisMonth).click()
  }
}
