import { test } from '../../../test'
import { signIn } from '../../../steps/signIn'
import {
  createProperty,
  editProperty,
  navigateToProperty,
  searchForProperty,
  showProperty,
  visitListPropertiesPage,
} from '../../../steps/v2/manage'
import { getProperty } from '../../../utils/manage'

test('Create a property', async ({ page, assessor }) => {
  const property = getProperty()

  await signIn(page, assessor)
  await visitListPropertiesPage(page)
  await createProperty(page, property)
})

test('Show a property', async ({ page, assessor }) => {
  const property = getProperty()

  await signIn(page, assessor)
  await visitListPropertiesPage(page)
  await createProperty(page, property)
  await visitListPropertiesPage(page)
  await searchForProperty(page, property.postcode)
  await navigateToProperty(page, property)
})

test('Edit a property', async ({ page, assessor }) => {
  const property = getProperty()
  const updatedProperty = getProperty()

  await signIn(page, assessor)
  await visitListPropertiesPage(page)
  await createProperty(page, property)
  await editProperty(page, property, updatedProperty)
  await showProperty(page, updatedProperty)
})
