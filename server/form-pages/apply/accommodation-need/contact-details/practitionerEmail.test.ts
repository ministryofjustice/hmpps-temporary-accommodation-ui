import { applicationFactory } from '../../../../testutils/factories'
import PractitionerEmail from './practitionerEmail'
import UpdatePractitionerDetail from './updatePractitionerDetail'

describe('PractitionerEmail', () => {
  it('extends UpdatePractitionerDetail', () => {
    const application = applicationFactory.build()

    expect(new PractitionerEmail({}, application)).toBeInstanceOf(UpdatePractitionerDetail)
  })
})
