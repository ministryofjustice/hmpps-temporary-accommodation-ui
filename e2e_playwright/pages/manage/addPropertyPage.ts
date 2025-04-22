import { Page, expect } from '@playwright/test'
import { fakerEN_GB as faker } from '@faker-js/faker'
import { Property } from '@temporary-accommodation-ui/e2e'
import { BasePage } from '../basePage'

export class AddPropertyPage extends BasePage {
  static async initialize(page: Page) {
    await expect(page.locator('h1')).toContainText('Add a property')
    return new AddPropertyPage(page)
  }

  async enterFormDetails(property: Property) {
    await this.page.getByLabel('Enter a property reference').fill(property.name)
    await this.page.getByLabel('Address line 1').fill(property.addressLine1)
    await this.page.getByLabel('Address line 2 (optional)').fill(property.addressLine2)
    await this.page.getByLabel('Town or city (optional)').fill(property.town)
    await this.page.getByLabel('Postcode').fill(property.postcode)

    property.localAuthority = await this.selectOptionAtRandom('What is the local authority (optional)?')
    property.probationRegion = await this.selectOptionAtRandom(
      'What is the probation region?',
      'Select a probation region',
    )
    property.pdu = await this.selectOptionAtRandom('What is the PDU?', 'Select a PDU')
    property.propertyAttributesValues = [await this.checkCheckboxAtRandom()]
    property.status = await this.clickRandomStatusRadioButton()

    await this.page.getByLabel('Please provide any further property details').fill(property.notes)
    await this.page
      .getByLabel(
        'Enter the number of working days required to turnaround the property. The standard turnaround time should be 2 days',
      )
      .fill(String(property.turnaroundWorkingDayCount))
  }

  private async clickRandomStatusRadioButton(): Promise<string> {
    const statusRadioButtons = ['Online', 'Archived']
    const optionToSelect = faker.helpers.arrayElement(statusRadioButtons)
    await this.page.getByRole('radio', { name: optionToSelect }).click()
    return optionToSelect
  }
}
