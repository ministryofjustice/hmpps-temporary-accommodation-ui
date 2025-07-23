import { Locator, Page, expect } from '@playwright/test'
import { Property } from '@temporary-accommodation-ui/e2e'
import { BasePage } from '../../basePage'

export class AddPropertyPage extends BasePage {
  static async initialise(page: Page) {
    await expect(page.locator('h1')).toContainText('Add a property')
    return new AddPropertyPage(page)
  }

  async enterFormDetails(property: Property) {
    await this.page.getByLabel('Enter a property reference').fill(property.name)
    await this.page.getByLabel('Address line 1').fill(property.addressLine1)
    await this.page.getByLabel('Address line 2 (optional)').fill(property.addressLine2)
    await this.page.getByLabel('Town or city (optional)').fill(property.town)
    await this.page.getByLabel('Postcode').fill(property.postcode)

    const localAuthoritiesLocator = this.page.locator('#localAuthorityAreaId-select')
    const localAuthority = await this.getRandomOption(localAuthoritiesLocator)
    await this.page.getByLabel('What is the local authority?').fill(localAuthority)
    await this.page.getByRole('listbox').locator('li').getByText(localAuthority).first().click()
    property.localAuthority = localAuthority

    property.probationRegion = await this.selectOptionAtRandom('What is the region?', 'Select a probation region')
    property.pdu = await this.selectOptionAtRandom('What is the PDU?', 'Select a PDU')

    const characteristicsCheckboxes = await this.page.getByRole('checkbox').all()
    property.propertyAttributesValues = await this.checkRandomBoxes(characteristicsCheckboxes)

    await this.page.getByLabel('Additional property details').fill(property.notes)
    await this.page
      .getByLabel(
        'Enter the number of working days required to turnaround the property. The standard turnaround time should be 2 days',
      )
      .fill(`${property.turnaroundWorkingDayCount}`)
  }

  private async getRandomOption(select: Locator): Promise<string | undefined> {
    const options = await select.locator('option').allInnerTexts()

    if (!options) {
      return undefined
    }

    const index = Math.ceil(Math.random() * (options.length - 1))
    return options[index]
  }

  private async checkRandomBoxes(checkBoxes: Array<Locator>): Promise<Array<string>> {
    const labels = []

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
}
