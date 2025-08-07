import { test } from '../../../test'
import { getBedspace, getProperty } from '../../../utils/manage'
import { signIn } from '../../../steps/signIn'
import {
  createBedspace,
  createProperty,
  editBedspace,
  navigateToBedspace,
  navigateToPropertyFromBedspace,
  showBedspace,
  visitListPropertiesPage,
} from '../../../steps/v2/manage'

test('Create a bedspace', async ({ page, assessor }) => {
  const property = getProperty()
  const bedspace = getBedspace()

  await signIn(page, assessor)
  await visitListPropertiesPage(page)
  await createProperty(page, property)
  await createBedspace(page, property, bedspace)
})

test('Show a bedspace', async ({ page, assessor }) => {
  const property = getProperty()
  const bedspace = getBedspace()

  await signIn(page, assessor)
  await visitListPropertiesPage(page)
  await createProperty(page, property)
  await createBedspace(page, property, bedspace)
  await navigateToPropertyFromBedspace(page, property, bedspace)
  await navigateToBedspace(page, property, bedspace)
  await showBedspace(page, property, bedspace)
})

test('Edit a bedspace', async ({ page, assessor }) => {
  const property = getProperty()
  const bedspace = getBedspace()
  const updatedBedspace = getBedspace()

  await signIn(page, assessor)
  await visitListPropertiesPage(page)
  await createProperty(page, property)
  await createBedspace(page, property, bedspace)
  await editBedspace(page, property, bedspace, updatedBedspace)
  await showBedspace(page, property, updatedBedspace)
})
