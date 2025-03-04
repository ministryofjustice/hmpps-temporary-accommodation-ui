import { test } from '../../test'
import { createApplication } from '../../steps/apply'
import { signIn } from '../../steps/signIn'

test('Create Application', async ({ page, assessor }) => {
  await signIn(page, assessor)
  await createApplication({ page })
})
