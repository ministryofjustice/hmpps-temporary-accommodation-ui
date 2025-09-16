import { Page, expect } from '@playwright/test'
import { Bedspace, Property } from '@temporary-accommodation-ui/e2e'
import { BasePage } from '../../basePage'
import { DateFormats } from '../../../../server/utils/dateUtils'

export class ViewBedspacePage extends BasePage {
  static async initialise(page: Page, reference: string) {
    await expect(page.locator('h1')).toContainText(`Bedspace reference: ${reference}`)
    return new ViewBedspacePage(page)
  }

  static async goto(page: Page, premisesId: string, bedspaceId: string) {
    await page.goto(`/properties/${premisesId}/bedspaces/${bedspaceId}`)
  }

  async shouldShowPropertySummary(property: Property) {
    const addressSection = this.page.getByText('Property address').locator('..').locator('p')
    await expect(addressSection).toContainText(property.addressLine1)
    await expect(addressSection).toContainText(property.addressLine2)
    await expect(addressSection).toContainText(property.town)
    await expect(addressSection).toContainText(property.postcode)

    const detailsTags = await this.page
      .getByText('Property details')
      .locator('..')
      .locator('span[class="hmpps-tag-filters"]')
      .all()
    const allAttributes = await Promise.all(detailsTags.map(async tag => tag.innerText()))
    property.propertyAttributesValues.forEach(attribute => {
      expect(allAttributes).toContain(attribute)
    })
  }

  async shouldShowBedspaceDetails(bedspace: Bedspace) {
    await expect(this.getRowTextByLabel('Bedspace status')).toContainText('Online')
    await expect(this.getRowTextByLabel('Start date')).toContainText(
      DateFormats.isoDateToUIDate(DateFormats.dateObjToIsoDate(new Date())),
    )
    const detailsRow = this.getRowTextByLabel('Bedspace details', true)
    await Promise.all(
      bedspace.details.map(async detail => {
        await expect(detailsRow).toContainText(detail)
      }),
    )
    await expect(this.getRowTextByLabel('Additional bedspace details')).toContainText(bedspace.additionalDetails)
  }

  async clickBackToProperty(shortAddress: string) {
    await this.page.getByText(shortAddress).click()
  }

  async clickEditButton() {
    await this.page.getByRole('button').getByText('Actions').click()
    await this.page.getByText('Edit bedspace details').click()
  }

  async clickArchiveButton() {
    await this.page.getByRole('button').getByText('Actions').click()
    await this.page.getByText('Archive bedspace').click()
  }

  async clickUnarchiveButton() {
    await this.page.getByRole('button').getByText('Actions').click()
    await this.page.getByText('Make bedspace online').click()
  }

  async clickCancelArchiveButton() {
    await this.page.getByRole('button').getByText('Actions').click()
    await this.page.getByText('Cancel scheduled bedspace archive').click()
  }

  async clickCancelUnarchiveButton() {
    await this.page.getByRole('button').getByText('Actions').click()
    await this.page.getByText('Cancel scheduled bedspace online date').click()
  }

  async shouldShowBedspaceStatus(status: string) {
    await expect(this.getRowTextByLabel('Bedspace status')).toContainText(status)
  }
}
