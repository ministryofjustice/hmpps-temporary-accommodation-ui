import { fakerEN_GB as faker } from '@faker-js/faker'
import { Locator, Page } from '@playwright/test'

export class BasePage {
  constructor(public readonly page: Page) {}

  async clickSubmit(name: string = 'Submit') {
    await this.page.getByRole('button', { name }).click()
  }

  async clickLink(label: string) {
    await this.page.getByRole('link', { name: label }).click()
  }

  async clickFirstElementByClass(elementClass: string) {
    await this.page.locator(`[class='${elementClass}']`).first().click()
  }

  async clickElementByClass(elementClass: string, elementIndex: number) {
    await this.page.locator(`[class='${elementClass}']`).nth(elementIndex).click()
  }

  async isBannerMessageDisplayed(expectedBannerMessage: string) {
    const bannerContent = await this.page.locator(`[class='govuk-notification-banner__content']`).textContent()
    return bannerContent.includes(expectedBannerMessage)
  }

  async selectOptionAtRandom(label: string, filterOutOption: string = ''): Promise<string> {
    const select = this.page.getByLabel(label)
    const selectOptionValues = await this.getSelectOptionValues(select, filterOutOption)
    const optionToSelect = faker.helpers.arrayElement(selectOptionValues)
    await select.selectOption(optionToSelect)
    return optionToSelect
  }

  private async getSelectOptionValues(select: Locator, filterOutOption: string): Promise<Array<string>> {
    return (await select.textContent())
      .trim()
      .split('\n')
      .filter(value => value.trim().length > 0)
      .filter(value => value !== filterOutOption)
      .map(value => value.trim())
  }

  async checkCheckboxAtRandom(): Promise<string> {
    const allCheckboxes = await this.page.getByRole('checkbox').all()
    const randomCheckbox = faker.helpers.arrayElement(allCheckboxes)
    await randomCheckbox.click()
    return randomCheckbox.getAttribute('value')
  }
}
