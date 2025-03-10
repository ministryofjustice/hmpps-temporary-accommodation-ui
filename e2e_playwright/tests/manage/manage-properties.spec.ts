import { test } from '../../test'
import { signIn } from '../../steps/signIn'
import { visitManagePropertiesPage } from '../../steps/manage'

test('Create Property', async ({ page, assessor, premises }) => {
  await signIn(page, assessor)
  await visitManagePropertiesPage(page, premises)
})
