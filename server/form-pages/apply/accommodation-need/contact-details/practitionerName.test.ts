import { applicationFactory } from '../../../../testutils/factories'
import PractitionerName from './practitionerName'
import UpdatePractitionerDetail from './updatePractitionerDetail'

describe('PractitionerName', () => {
  it('extends UpdatePractitionerDetail', () => {
    const application = applicationFactory.build()

    expect(new PractitionerName({}, application)).toBeInstanceOf(UpdatePractitionerDetail)
  })
})
