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

  async getElementByClassAndIndex(elementClass: string, elementIndex: number): Promise<Locator> {
    return this.page.locator(`[class='${elementClass}']`).nth(elementIndex)
  }

  async getFirstElementByClass(elementClass: string): Promise<Locator> {
    return this.page.locator(`[class='${elementClass}']`).first()
  }

  async clickFirstElementByClass(elementClass: string) {
    await (await this.getFirstElementByClass(elementClass)).click()
  }

  async clickElementByClass(elementClass: string, elementIndex: number) {
    await (await this.getElementByClassAndIndex(elementClass, elementIndex)).click()
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

  async checkRandomCheckboxes(checkBoxes: Array<Locator>): Promise<Array<string>> {
    const labels = []

    // using a for loop with awaits here as playwright was unreliable checking checkboxes with Promise.all and map/forEach
    // eslint-disable-next-line no-restricted-syntax
    for (const checkbox of checkBoxes.filter(_ => Math.random() > 0.5)) {
      const parent = checkbox.locator('..')
      const label = parent.locator('label').first()
      // eslint-disable-next-line no-await-in-loop
      await label.click()
      // eslint-disable-next-line no-await-in-loop
      const labelText = await label.innerText()
      labels.push(labelText)
    }

    return labels
  }

  async getTableRow(expectedStringInRow: string) {
    const tableRows = await this.page.locator('.govuk-table__row').all()
    const promises: Array<Promise<string>> = []
    tableRows.forEach(row => {
      promises.push(row.textContent())
    })
    const rowContentList = await Promise.all(promises)
    let foundRowIndex = -1
    rowContentList.forEach((rowContent, index) => {
      if (rowContent.includes(expectedStringInRow)) {
        foundRowIndex = index
      }
    })
    return {
      tableRowIndex: foundRowIndex,
      tableRow: foundRowIndex !== -1 ? this.page.locator('.govuk-table__row').nth(foundRowIndex) : undefined,
    }
  }

  getRowTextByLabel(label: string, exact: boolean = false): Locator {
    return this.page.getByText(label, { exact }).locator('..').locator('dd')
  }

  findCheckboxByLabel(label: string, exact: boolean = false) {
    return this.page.getByLabel(label, { exact }).locator('..').locator('input')
  }
}
