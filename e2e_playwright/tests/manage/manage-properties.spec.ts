import { test } from '../../test'
import { signIn } from '../../steps/signIn'
import {
  checkNewPropertyIsListedAndClickManageLink,
  checkViewPropertyPageHasExpectedPropertyDetails,
  createProperty,
  editPropertyAndCheckSavedSuccessfully,
  gotoEditPropertyPageAndCheckDetails,
  visitManagePropertiesPage,
} from '../../steps/manage'

test('Create and edit property', async ({ page, assessor, property }) => {
  await signIn(page, assessor)
  await visitManagePropertiesPage(page)
  await createProperty(page, property)
  await gotoEditPropertyPageAndCheckDetails(page, property)
  await editPropertyAndCheckSavedSuccessfully(page, property)
})

test('Create, check listed and view property', async ({ page, assessor, property }) => {
  await signIn(page, assessor)
  await visitManagePropertiesPage(page)
  await createProperty(page, property)
  await visitManagePropertiesPage(page)
  await checkNewPropertyIsListedAndClickManageLink(page, property)
  await checkViewPropertyPageHasExpectedPropertyDetails(page, property)
})
