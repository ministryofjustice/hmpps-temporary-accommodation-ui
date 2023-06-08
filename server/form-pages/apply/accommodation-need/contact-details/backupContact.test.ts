import { applicationFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import ContactDetails from '../../contactDetails'
import BackupContact from './backupContact'

describe('BackupContact', () => {
  const application = applicationFactory.build()

  it('extends ContactDetails', () => {
    expect(new BackupContact({}, application)).toBeInstanceOf(ContactDetails)
  })

  itShouldHavePreviousValue(new BackupContact({}, application), 'probation-practitioner')
  itShouldHaveNextValue(new BackupContact({}, application), 'practitioner-pdu')
})
