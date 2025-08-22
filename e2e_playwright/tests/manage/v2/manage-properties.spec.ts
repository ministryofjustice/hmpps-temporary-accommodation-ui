import { test } from '../../../test'
import { signIn } from '../../../steps/signIn'
import {
  archiveProperty,
  createProperty,
  editProperty,
  navigateToProperty,
  searchForProperty,
  showProperty,
  unarchiveProperty,
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

test('Archive a property', async ({ page, assessor }) => {
  const property = getProperty()

  await signIn(page, assessor)
  await visitListPropertiesPage(page)
  await createProperty(page, property)
  await showProperty(page, property)
  await archiveProperty(page, property)
})

test('Unarchive a property', async ({ page, assessor }) => {
  const property = getProperty()

  await signIn(page, assessor)
  await visitListPropertiesPage(page)
  await createProperty(page, property)
  await showProperty(page, property)
  await archiveProperty(page, property)
  await unarchiveProperty(page, property)
})
