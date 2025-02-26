import { BasePage } from './basePage'

export class DashboardPage extends BasePage {
  async goto() {
    await this.page.goto('/')
  }

  async clickReviewAndAssessReferral() {
    await this.page.getByRole('link', { name: 'Review and assess referrals' }).click()
  }
}
