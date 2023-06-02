import { applicationFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import ProbationPractitioner from './probationPractitioner'

describe('ProbationPractitioner', () => {
  const application = applicationFactory.build()

  itShouldHavePreviousValue(new ProbationPractitioner({}, application), 'dashboard')
  itShouldHaveNextValue(new ProbationPractitioner({}, application), 'backup-contact')
})
