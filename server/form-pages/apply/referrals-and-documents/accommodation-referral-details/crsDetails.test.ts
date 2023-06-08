import { applicationFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import ContactDetails from '../../contactDetails'
import CrsDetails from './crsDetails'

describe('CrsDetails', () => {
  const application = applicationFactory.build()

  it('extends ContactDetails', () => {
    expect(new CrsDetails({}, application)).toBeInstanceOf(ContactDetails)
  })

  itShouldHavePreviousValue(new CrsDetails({}, application), 'crs-submitted')
  itShouldHaveNextValue(new CrsDetails({}, application), 'other-accommodation-options')
})
