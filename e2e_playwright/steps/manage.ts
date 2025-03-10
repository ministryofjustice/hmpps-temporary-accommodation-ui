import { Page } from '@playwright/test'
import { Premises } from '@temporary-accommodation-ui/e2e'
import { visitDashboard } from './signIn'
import { ListPropertiesPage } from '../pages/manage/listPropertiesPage'
import { AddPropertyPage } from '../pages/manage/addPropertyPage'

export const visitManagePropertiesPage = async (page: Page, premises: Premises) => {
  const dashboard = await visitDashboard(page)
  await dashboard.clickManagePropertiesLink()

  const listPropertiesPage = await ListPropertiesPage.initialize(page)
  await listPropertiesPage.clickAddPremisesButton()

  const addPropertyPage = await AddPropertyPage.initialize(page)
  await addPropertyPage.enterFormDetails(premises)
}
