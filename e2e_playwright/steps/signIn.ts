import { UserLoginDetails } from '@temporary-accommodation-ui/e2e'
import { Page } from '@playwright/test'
import { DashboardPage } from '../pages/dashboardPage'

export const signIn = async (page: Page, user: UserLoginDetails) => {
  if (!user.username || !user.password) {
    throw new Error('Credentials missing, have you set the correct environment variables?')
  }

  await page.goto('/sign-in')

  const signInUrl = new URL(page.url())
  signInUrl.pathname = signInUrl.pathname.replace(/\/sign-in$/, '/sign-in-other')
  await page.goto(signInUrl.toString())

  await page.getByLabel('Username').fill(user.username)
  await page.getByLabel('Password').fill(user.password)
  await page.getByRole('button', { name: 'Sign in' }).click()
}

export const visitDashboard = async (page: Page): Promise<DashboardPage> => {
  const dashboard = new DashboardPage(page)
  await dashboard.goto()
  return dashboard
}
