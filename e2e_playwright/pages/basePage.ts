import { Page } from '@playwright/test'

export class BasePage {
  constructor(public readonly page: Page) {}

  async clickSubmit(name: string = 'Submit') {
    await this.page.getByRole('button', { name }).click()
  }
}
