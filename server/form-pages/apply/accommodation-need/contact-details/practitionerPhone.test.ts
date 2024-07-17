import { applicationFactory } from '../../../../testutils/factories'
import PractitionerPhone from './practitionerPhone'
import UpdatePractitionerDetail from './updatePractitionerDetail'

describe('PractitionerPhone', () => {
  it('extends UpdatePractitionerDetail', () => {
    const application = applicationFactory.build()

    expect(new PractitionerPhone({}, application)).toBeInstanceOf(UpdatePractitionerDetail)
  })
})
