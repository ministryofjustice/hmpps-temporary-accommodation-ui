import { Page, expect } from '@playwright/test'
import { Bedspace, Property } from '@temporary-accommodation-ui/e2e'
import { BasePage } from '../../basePage'

export class EditBedspacePage extends BasePage {
  static async initialise(page: Page) {
    await expect(page.locator('h1')).toContainText('Edit bedspace')
    return new EditBedspacePage(page)
  }

  async shouldShowPropertySummary(property: Property) {
    await expect(this.getRowTextByLabel('Status')).toContainText('Online')
    const addressRow = this.getRowTextByLabel('Address')
    await expect(addressRow).toContainText(property.addressLine1)
    await expect(addressRow).toContainText(property.addressLine2)
    await expect(addressRow).toContainText(property.town)
    await expect(addressRow).toContainText(property.postcode)
  }

  async shouldShowBedspaceDetails(bedspace: Bedspace) {
    await expect(this.page.getByLabel('Bedspace reference')).toHaveValue(bedspace.reference)
    await Promise.all(
      bedspace.details.map(async detail => expect(this.findCheckboxByLabel(detail, true)).toBeChecked()),
    )
    await expect(this.page.getByLabel('Additional bedspace details')).toHaveValue(bedspace.additionalDetails)
  }

  async clearFormDetails() {
    await this.page.getByLabel('Bedspace reference').clear()
    // using a for loop with awaits as using Promise.all with checkboxes.map was very flaky
    // eslint-disable-next-line no-restricted-syntax
    for (const checkbox of await this.page.getByRole('checkbox').all()) {
      // eslint-disable-next-line no-await-in-loop
      await checkbox.uncheck()
    }
    await this.page.getByLabel('Additional bedspace details').clear()
  }

  async enterFormDetails(bedspace: Bedspace) {
    await this.page.getByLabel('Bedspace reference').fill(bedspace.reference)
    const detailsCheckboxes = await this.page.getByRole('checkbox').all()
    bedspace.details = await this.checkRandomCheckboxes(detailsCheckboxes)
    await this.page.getByLabel('Additional bedspace details').fill(bedspace.additionalDetails)
  }
}
