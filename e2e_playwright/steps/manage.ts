import { Page, expect } from '@playwright/test'
import { Property } from '@temporary-accommodation-ui/e2e'
import { visitDashboard } from './signIn'
import { ListPropertiesPage } from '../pages/manage/listPropertiesPage'
import { AddPropertyPage } from '../pages/manage/addPropertyPage'
import { ViewPropertyPage } from '../pages/manage/viewPropertyPage'
import { EditPropertyPage } from '../pages/manage/editPropertyPage'

export const visitManagePropertiesPage = async (page: Page) => {
  const dashboard = await visitDashboard(page)
  await dashboard.clickManagePropertiesLink()
}

export const createProperty = async (page: Page, property: Property) => {
  const listPropertiesPage = await ListPropertiesPage.initialize(page)
  await listPropertiesPage.clickAddPremisesButton()

  const addPropertyPage = await AddPropertyPage.initialize(page)
  await addPropertyPage.enterFormDetails(property)
  await addPropertyPage.clickSubmit()

  const premisesShowPage = await ViewPropertyPage.initialize(page)
  const isBannerMessageDisplayed = await premisesShowPage.isBannerMessageDisplayed(
    property.status === 'Online' ? 'Property created' : 'Archived property created',
  )
  expect(isBannerMessageDisplayed).toBe(true)
}

export const editProperty = async (page: Page, property: Property) => {
  const viewPropertyPage = await ViewPropertyPage.initialize(page)
  await viewPropertyPage.clickEditLink()
  const editPropertyPage = await EditPropertyPage.initialize(page)
  await editPropertyPage.shouldShowPropertyDetails(property)
}
