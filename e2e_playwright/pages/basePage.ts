import { Page } from '@playwright/test'

export class BasePage {
  constructor(public readonly page: Page) {}

  async clickSubmit(name: string = 'Submit') {
    await this.page.getByRole('button', { name }).click()
  }

  async clickFirstElementByClass(elementClass: string) {
    const allElements = this.page.locator(`[class='${elementClass}']`).first()
    await allElements.click()
  }

  async clickElementByClass(elementClass: string, elementIndex: number) {
    const elements = await this.page.locator(`[class='${elementClass}']`).all()
    await elements.at(elementIndex).click()
  }
}
