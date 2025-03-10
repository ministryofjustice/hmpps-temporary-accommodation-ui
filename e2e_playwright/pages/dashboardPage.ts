import { BasePage } from './basePage'

export class DashboardPage extends BasePage {
  async goto() {
    await this.page.goto('/')
  }

  async clickReviewAndAssessReferral() {
    await this.page.getByRole('link', { name: 'Review and assess referrals' }).click()
  }

  async clickDownloadDataLink() {
    await this.page.getByRole('link', { name: 'Download data' }).click()
  }

  async clickManagePropertiesLink() {
    await this.page.getByRole('link', { name: 'Manage properties, bedspaces, and bookings' }).click()
  }
}
