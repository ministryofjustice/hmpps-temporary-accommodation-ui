import { Page, expect } from '@playwright/test'
import { Premises } from '@temporary-accommodation-ui/e2e'
import { BasePage } from '../basePage'

export class AddPropertyPage extends BasePage {
  static async initialize(page: Page) {
    await expect(page.locator('h1')).toContainText('Add a property')
    return new AddPropertyPage(page)
  }

  async enterFormDetails(premises: Premises) {
    await this.page.getByLabel('Enter a property reference').fill(premises.name)
    await this.page.getByLabel('Address line 1').fill(premises.addressLine1)
    await this.page.getByLabel('Address line 2 (optional)').fill(premises.addressLine2)
    await this.page.getByLabel('Town or city (optional)').fill(premises.town)
    await this.page.getByLabel('Postcode').fill(premises.postcode)
    await this.page.getByLabel('What is the local authority (optional)?').selectOption(premises.localAuthorityArea)
    await this.page.getByLabel('What is the probation region?').selectOption(premises.probationRegionName)
    await this.page.getByLabel('What is the PDU?').selectOption(premises.pdu)
  }
}
