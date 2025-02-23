import { test } from '../../test'
import { createApplication } from '../../steps/apply'
import { signIn } from '../../steps/signIn'

test('Create Application', async ({ page, user }) => {
  await signIn(page, user)
  await createApplication({ page })
})
