import { Page, expect } from '@playwright/test'
import { Property } from '@temporary-accommodation-ui/e2e'
import { ListPropertiesPage } from '../../pages/manage/v2/listPropertiesPage'
import { AddPropertyPage } from '../../pages/manage/v2/addPropertyPage'
import { ViewPropertyPage } from '../../pages/manage/v2/viewPropertyPage'

export const visitListPropertiesPage = async (page: Page) => {
  // TODO: navigate to the list properties page from the dashboard once the v2 pages are live in prod
  await ListPropertiesPage.goto(page)
}

export const createProperty = async (page: Page, property: Property) => {
  const listPropertiesPage = await ListPropertiesPage.initialise(page)
  await listPropertiesPage.clickAddPropertyButton()

  const addPropertyPage = await AddPropertyPage.initialise(page)
  await addPropertyPage.enterFormDetails(property)
  await addPropertyPage.clickSubmit()

  const shortAddress = `${property.addressLine1}, ${property.postcode}`
  const showPropertyPage = await ViewPropertyPage.initialise(page, shortAddress)
  const isBannerMessageDisplayed = await showPropertyPage.isBannerMessageDisplayed('Property added')
  expect(isBannerMessageDisplayed).toBe(true)
}

export const searchForProperty = async (page: Page, address: string) => {
  const listPropertiesPage = await ListPropertiesPage.initialise(page)
  await listPropertiesPage.searchForOnlineProperty(address)
  await listPropertiesPage.checkAllEntriesMatchAddress(address)
}

export const showProperty = async (page: Page, property: Property) => {
  const listPropertiesPage = await ListPropertiesPage.initialise(page)
  await listPropertiesPage.clickManageLink(property)

  const shortAddress = `${property.addressLine1}, ${property.postcode}`
  const showPropertyPage = await ViewPropertyPage.initialise(page, shortAddress)
  await showPropertyPage.shouldShowPropertyDetails(property)
}
