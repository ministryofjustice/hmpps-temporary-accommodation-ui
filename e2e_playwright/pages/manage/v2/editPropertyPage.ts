import { Locator, Page, expect } from '@playwright/test'
import { Property } from '@temporary-accommodation-ui/e2e'
import { EditablePropertyPage } from './editablePropertyPage'

export class EditPropertyPage extends EditablePropertyPage {
  static async initialise(page: Page) {
    await expect(page.locator('h1')).toContainText('Edit property')
    return new EditPropertyPage(page)
  }

  async clearFormDetails() {
    await this.page.getByLabel('Enter a property reference').clear()
    // eslint-disable-next-line no-restricted-syntax
    for (const input of await this.getInputsByLabel('What is the property address?').all()) {
      // eslint-disable-next-line no-await-in-loop
      await input.clear()
    }
    await this.page.getByLabel('What is the local authority?').clear()
    await this.page.getByLabel('What is the region?').selectOption('Select a probation region')
    await this.page.getByLabel('What is the PDU?').selectOption('Select a PDU')
    // eslint-disable-next-line no-restricted-syntax
    for (const checkbox of await this.page.getByRole('checkbox').all()) {
      // eslint-disable-next-line no-await-in-loop
      await checkbox.uncheck()
    }
    await this.page.getByLabel('Additional property details').clear()
    await this.page
      .getByLabel(
        'Enter the number of working days required to turnaround the property. The standard turnaround time should be 2 days',
      )
      .clear()
  }

  async shouldShowPropertyDetails(property: Property) {
    await expect(this.getRowTextByLabel('Status')).toContainText('Online')
    const addressRow = this.getRowTextByLabel('Address')
    await expect(addressRow).toContainText(property.addressLine1)
    await expect(addressRow).toContainText(property.addressLine2)
    await expect(addressRow).toContainText(property.town)
    await expect(addressRow).toContainText(property.postcode)

    await expect(this.page.getByLabel('Enter a property reference')).toHaveValue(property.name)

    const editableAddressInputs = this.getInputsByLabel('What is the property address?')
    await expect(editableAddressInputs.nth(0)).toHaveValue(property.addressLine1)
    await expect(editableAddressInputs.nth(1)).toHaveValue(property.addressLine2)
    await expect(editableAddressInputs.nth(2)).toHaveValue(property.town)
    await expect(editableAddressInputs.nth(3)).toHaveValue(property.postcode)

    await expect(this.page.getByLabel('What is the local authority?')).toHaveValue(property.localAuthority)

    await expect(this.getSelectedOptionByLabel('What is the region?')).toHaveText(property.probationRegion)

    await expect(this.getSelectedOptionByLabel('What is the PDU?')).toHaveText(property.pdu)

    await Promise.all(
      property.propertyAttributesValues.map(async attribute =>
        expect(this.findCheckboxByLabel(attribute, true)).toBeChecked(),
      ),
    )

    await expect(this.page.getByLabel('Additional property details')).toContainText(property.notes)

    await expect(
      this.page.getByLabel(
        'Enter the number of working days required to turnaround the property. The standard turnaround time should be 2 days',
      ),
    ).toHaveValue(`${property.turnaroundWorkingDayCount}`)
  }

  private getInputsByLabel(label: string, exact: boolean = false): Locator {
    return this.page.getByText(label, { exact }).locator('..').locator('input')
  }

  private getSelectedOptionByLabel(label: string, exact: boolean = false): Locator {
    return this.page.getByLabel(label, { exact }).locator('option[selected]')
  }
}
