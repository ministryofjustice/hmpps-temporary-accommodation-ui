import { Page } from '@playwright/test'
import { DashboardPage } from '../pages/dashboardPage'

export const createApplication = async ({ page }: { page: Page }) => {
  // Given I visit the Dashboard
  const dashboard = new DashboardPage(page)
  await dashboard.goto()

  // And I click the Review and Asses Referral link
  await dashboard.clickReviewAndAssessReferral()

  // TODO: steps to create application
}
