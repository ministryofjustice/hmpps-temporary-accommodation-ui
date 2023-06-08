import { applicationFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import ContactDetails from '../../contactDetails'
import ProbationPractitioner from './probationPractitioner'

describe('ProbationPractitioner', () => {
  const application = applicationFactory.build()

  it('extends ContactDetails', () => {
    expect(new ProbationPractitioner({}, application)).toBeInstanceOf(ContactDetails)
  })

  itShouldHavePreviousValue(new ProbationPractitioner({}, application), 'dashboard')
  itShouldHaveNextValue(new ProbationPractitioner({}, application), 'backup-contact')
})
