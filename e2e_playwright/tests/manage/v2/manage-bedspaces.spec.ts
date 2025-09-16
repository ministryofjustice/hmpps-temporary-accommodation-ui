import { test } from '../../../test'
import { getBedspace, getProperty } from '../../../utils/manage'
import { signIn } from '../../../steps/signIn'
import {
  archiveBedspace,
  cancelArchiveBedspace,
  cancelUnarchiveBedspace,
  createBedspace,
  createProperty,
  editBedspace,
  navigateToBedspace,
  navigateToPropertyFromBedspace,
  showBedspace,
  unarchiveBedspace,
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

test('Archive a bedspace', async ({ page, assessor }) => {
  const property = getProperty()
  const bedspace = getBedspace()

  await signIn(page, assessor)
  await visitListPropertiesPage(page)
  await createProperty(page, property)
  await createBedspace(page, property, bedspace)
  await showBedspace(page, property, bedspace)
  await archiveBedspace(page, bedspace)
})

test('Cancel archive of a bedspace', async ({ page, assessor }) => {
  const property = getProperty()
  const bedspace = getBedspace()
  await signIn(page, assessor)
  await visitListPropertiesPage(page)
  await createProperty(page, property)
  await createBedspace(page, property, bedspace)
  await showBedspace(page, property, bedspace)

  const archiveDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
  await archiveBedspace(page, bedspace, { date: archiveDate })
  await cancelArchiveBedspace(page, bedspace, { date: archiveDate })
})

// TODO: Add a test case when we cannot archive a bedspace with blocking booking/void
// test('Cannot archive a bedspace with blocking booking/void', async ({ page, assessor }) => {
// })

test('Unarchive a bedspace', async ({ page, assessor }) => {
  const property = getProperty()
  const bedspace = getBedspace()
  await signIn(page, assessor)
  await visitListPropertiesPage(page)
  await createProperty(page, property)
  await createBedspace(page, property, bedspace)
  await showBedspace(page, property, bedspace)
  await archiveBedspace(page, bedspace)
  await unarchiveBedspace(page, bedspace)
})

test('Cancel unarchive a bedspace', async ({ page, assessor }) => {
  const property = getProperty()
  const bedspace = getBedspace()
  await signIn(page, assessor)
  await visitListPropertiesPage(page)
  await createProperty(page, property)
  await createBedspace(page, property, bedspace)
  await showBedspace(page, property, bedspace)
  await archiveBedspace(page, bedspace)

  const unarchiveDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
  await unarchiveBedspace(page, bedspace, { date: unarchiveDate })
  await cancelUnarchiveBedspace(page, bedspace, { date: unarchiveDate })
})
