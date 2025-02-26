import { UserLoginDetails } from '@temporary-accommodation-ui/e2e'
import { Page } from '@playwright/test'

export const signIn = async (page: Page, user: UserLoginDetails) => {
  if (!user.username || !user.password) {
    throw new Error('Credentials missing, have you set the correct environment variables?')
  }

  await page.goto('/')
  await page.getByLabel('Username').fill(user.username)
  await page.getByLabel('Password').fill(user.password)
  await page.getByRole('button', { name: 'Sign in' }).click()
}
