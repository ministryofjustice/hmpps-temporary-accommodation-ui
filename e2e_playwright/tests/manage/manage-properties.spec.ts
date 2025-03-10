import { test } from '../../test'
import { signIn } from '../../steps/signIn'
import { createProperty, editProperty, visitManagePropertiesPage } from '../../steps/manage'

test('Create Property', async ({ page, assessor, property }) => {
  await signIn(page, assessor)
  await visitManagePropertiesPage(page)
  await createProperty(page, property)
})

test('Edit Property', async ({ page, assessor, property }) => {
  await signIn(page, assessor)
  await visitManagePropertiesPage(page)
  await createProperty(page, property)
  await editProperty(page, property)
})
