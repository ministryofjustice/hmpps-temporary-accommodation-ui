import { test } from '../../test'
import { signIn } from '../../steps/signIn'
import {
  archiveProperty,
  cancelScheduledArchiveProperty,
  cancelScheduledUnarchiveProperty,
  createProperty,
  editProperty,
  navigateToProperty,
  scheduleArchiveProperty,
  scheduleUnarchiveProperty,
  searchForProperty,
  showProperty,
  unarchiveProperty,
  visitListPropertiesPage,
} from '../../steps/manage'
import { getProperty } from '../../utils/manage'

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

test('Cancel scheduled archive for a property', async ({ page, assessor }) => {
  const property = getProperty()

  await signIn(page, assessor)
  await visitListPropertiesPage(page)
  await createProperty(page, property)
  await showProperty(page, property)
  await scheduleArchiveProperty(page, property)
  await cancelScheduledArchiveProperty(page, property)
})

test('Cancel scheduled unarchive for a property', async ({ page, assessor }) => {
  const property = getProperty()

  await signIn(page, assessor)
  await visitListPropertiesPage(page)
  await createProperty(page, property)
  await showProperty(page, property)
  await archiveProperty(page, property)
  await scheduleUnarchiveProperty(page, property)
  await cancelScheduledUnarchiveProperty(page, property)
})
