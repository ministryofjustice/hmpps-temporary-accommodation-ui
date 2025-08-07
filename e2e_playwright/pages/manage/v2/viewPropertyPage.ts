import { Page, expect } from '@playwright/test'
import { Property } from '@temporary-accommodation-ui/e2e'
import { BasePage } from '../../basePage'
import { DateFormats } from '../../../../server/utils/dateUtils'

export class ViewPropertyPage extends BasePage {
  static async initialise(page: Page, shortAddress: string) {
    await expect(page.locator('h1')).toContainText(shortAddress)
    return new ViewPropertyPage(page)
  }

  static async goto(page: Page, premisesId: string) {
    await page.goto(`/v2/properties/${premisesId}`)
  }

  async shouldShowPropertyDetails(property: Property) {
    await expect(this.page.locator('.govuk-summary-card h2').first()).toContainText(property.name)
    await this.shouldShowPropertyStatus('Online')
    await expect(this.getRowTextByLabel('Start date')).toContainText(
      DateFormats.isoDateToUIDate(DateFormats.dateObjToIsoDate(new Date())),
    )
    const addressRow = this.getRowTextByLabel('Address')
    await expect(addressRow).toContainText(property.addressLine1)
    await expect(addressRow).toContainText(property.addressLine2)
    await expect(addressRow).toContainText(property.town)
    await expect(addressRow).toContainText(property.postcode)

    await expect(this.getRowTextByLabel('Local authority')).toContainText(property.localAuthority)
    await expect(this.getRowTextByLabel('Probation region')).toContainText(property.probationRegion)
    await expect(this.getRowTextByLabel('Probation delivery unit')).toContainText(property.pdu)

    const characteristicsRow = this.getRowTextByLabel('Property details', true)
    await Promise.all(
      property.propertyAttributesValues.map(async characteristic => {
        await expect(characteristicsRow).toContainText(characteristic)
      }),
    )

    await expect(this.getRowTextByLabel('Additional property details')).toContainText(property.notes)
  }

  async clickEditButton() {
    await this.page.getByRole('button').getByText('Actions').click()
    await this.page.getByText('Edit property details').click()
  }

  async clickAddABedspace() {
    await this.page.getByRole('button').getByText('Actions').click()
    await this.page.getByText('Add a bedspace').click()
  }

  async clickBedspacesOverview() {
    await this.page.getByText('Bedspaces overview').click()
  }

  async clickArchiveButton() {
    await this.page.getByRole('button').getByText('Actions').click()
    await this.page.getByText('Archive property').click()
  }

  async shouldShowPropertyStatus(status: string) {
    await expect(this.getRowTextByLabel('Property status')).toContainText(status)
  }
}
