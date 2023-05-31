import { applicationFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import BackupContact from './backupContact'

describe('BackupContact', () => {
  const application = applicationFactory.build()

  itShouldHavePreviousValue(new BackupContact({}, application), 'probation-practitioner')
  itShouldHaveNextValue(new BackupContact({}, application), 'practitioner-pdu')
})
