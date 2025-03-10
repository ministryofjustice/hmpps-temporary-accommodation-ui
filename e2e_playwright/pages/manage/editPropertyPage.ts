import { Locator, Page, expect } from '@playwright/test'
import { Property } from '@temporary-accommodation-ui/e2e'
import { BasePage } from '../basePage'

export class EditPropertyPage extends BasePage {
  static async initialize(page: Page) {
    await expect(page.locator('h1')).toContainText('Edit a property')
    return new EditPropertyPage(page)
  }

  async shouldShowPropertyDetails(property: Property) {
    await expect(this.page.getByLabel('Enter a property reference')).toHaveValue(property.name)
    await expect(this.page.getByLabel('Address line 1')).toHaveValue(property.addressLine1)
    await expect(this.page.getByLabel('Address line 2')).toHaveValue(property.addressLine2)
    await expect(this.page.getByLabel('Town or city (optional)')).toHaveValue(property.town)
    await expect(this.page.getByLabel('Postcode')).toHaveValue(property.postcode)

    const selectedOptions = await this.page.locator('select > option[selected]').all()
    await expect(selectedOptions[0]).toHaveText(property.localAuthority)
    await expect(selectedOptions[1]).toHaveText(property.probationRegion)
    await expect(selectedOptions[2]).toHaveText(property.pdu)

    await this.isCorrectPropertyAttributesChecked(property)

    const statusRadioThatShouldBeChecked = this.page.getByLabel(property.status)
    expect(await statusRadioThatShouldBeChecked.isChecked()).toBe(true)

    await expect(this.page.getByLabel('Please provide any further property details')).toHaveValue(property.notes)

    const expectedNoOfWorkingDays = String(property.turnaroundWorkingDayCount)
    await expect(this.page.locator('#turnaroundWorkingDayCount')).toHaveValue(expectedNoOfWorkingDays)
  }

  async changeAddressLine1(addressLine1: string) {
    await this.page.getByLabel('Address line 1').fill(addressLine1)
  }

  private async isCorrectPropertyAttributesChecked(property: Property) {
    const allPropertyAttributes = await this.page.getByRole('checkbox').all()
    const promises = [] as Array<Promise<void>>
    allPropertyAttributes.forEach(propertyAttributeCheckbox => {
      promises.push(
        this.isPropertyAttributeCheckedAsExpected(propertyAttributeCheckbox, property.propertyAttributesValues),
      )
    })
    await Promise.all(promises)
  }

  private async isPropertyAttributeCheckedAsExpected(
    propertyAttributeCheckbox: Locator,
    checkedPropertyAttributeValues: Array<string>,
  ) {
    const propertyAttributeValue = (await propertyAttributeCheckbox.getAttribute('value')) as string
    const shouldBeChecked = checkedPropertyAttributeValues.includes(propertyAttributeValue)
    expect(await propertyAttributeCheckbox.isChecked()).toBe(shouldBeChecked)
  }
}
