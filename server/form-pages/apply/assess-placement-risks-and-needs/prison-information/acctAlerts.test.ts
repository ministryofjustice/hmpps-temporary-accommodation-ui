import { createMock } from '@golevelup/ts-jest'
import { CallConfig } from '../../../../data/restClient'
import { PersonService } from '../../../../services'
import { acctAlertFactory, applicationFactory, personFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import { PageBodyPersonAcctAlert, mapAcctAlertsForPageBody } from '../../../utils'
import AcctAlerts, { acctAlertResponse } from './acctAlerts'
import { SanitisedError } from '../../../../sanitisedError'

jest.mock('../../../../services/personService')
jest.mock('../../../utils')

describe('acctAlertResponse', () => {
  it('returns a response for an ACCT Alert', () => {
    const acctAlert = acctAlertFactory.build({
      alertId: 123,
      comment: 'Some description',
      dateCreated: '2022-01-01T10:00:00Z',
      dateExpires: '2022-01-09T10:00:00Z',
    })

    expect(acctAlertResponse(acctAlert)).toEqual({
      'Alert type': 123,
      'ACCT description': 'Some description',
      'Date created': '1 January 2022',
      'Expiry date': '9 January 2022',
    })
  })

  it('returns a response for an ACCT Alert when the alert expiry date is not provided', () => {
    const acctAlert = acctAlertFactory.build({
      alertId: 123,
      comment: 'Some description',
      dateCreated: '2022-01-01T10:00:00Z',
      dateExpires: undefined,
    })

    expect(acctAlertResponse(acctAlert)).toEqual({
      'Alert type': 123,
      'ACCT description': 'Some description',
      'Date created': '1 January 2022',
      'Expiry date': '',
    })
  })
})

describe('AcctAlerts', () => {
  const callConfig = { token: 'some-call-config-token' } as CallConfig
  const person = personFactory.build({ name: 'John Wayne' })
  const application = applicationFactory.build({ person })

  const acctAlerts = acctAlertFactory.buildList(5) as Array<PageBodyPersonAcctAlert>

  const body = { acctAlerts }

  describe('body', () => {
    it('sets the body', () => {
      const page = new AcctAlerts(body, application)

      expect(page.body).toEqual(body)
    })
  })

  describe('initialize', () => {
    it('populates the body with the results of getAcctAlerts and mapAcctAlertsForPageBody', async () => {
      const apiAcctAlerts = acctAlertFactory.buildList(5)

      const getAcctAlertsMock = jest.fn().mockResolvedValue(apiAcctAlerts)
      ;(mapAcctAlertsForPageBody as jest.MockedFunction<typeof mapAcctAlertsForPageBody>).mockReturnValue(acctAlerts)

      const personService = createMock<PersonService>({
        getAcctAlerts: getAcctAlertsMock,
      })

      const page = await AcctAlerts.initialize({}, application, callConfig, { personService })

      expect(page.body).toEqual({ acctAlerts })

      expect(getAcctAlertsMock).toHaveBeenCalledWith(callConfig, application.person.crn)
      expect(mapAcctAlertsForPageBody).toHaveBeenCalledWith(apiAcctAlerts)
    })

    it('sets the number of acctAlerts to 0 if none are found', async () => {
      const err = <SanitisedError>{ data: { status: 404 } }
      const getAcctAlertsMock = jest.fn().mockImplementation(() => {
        throw err
      })

      const personService = createMock<PersonService>({
        getAcctAlerts: getAcctAlertsMock,
      })

      const page = await AcctAlerts.initialize({}, application, callConfig, { personService })

      expect(page.body).toEqual({ acctAlerts })

      expect(getAcctAlertsMock).toHaveBeenCalledWith(callConfig, application.person.crn)
      expect(mapAcctAlertsForPageBody).toHaveBeenCalledWith([])
    })
  })

  itShouldHavePreviousValue(new AcctAlerts({}, application), 'adjudications')
  itShouldHaveNextValue(new AcctAlerts({}, application), '')

  describe('response', () => {
    it('returns the ACCT alerts', () => {
      const page = new AcctAlerts(body, application)

      expect(page.response()).toEqual({
        'ACCT Alerts': [
          acctAlertResponse(acctAlerts[0]),
          acctAlertResponse(acctAlerts[1]),
          acctAlertResponse(acctAlerts[2]),
          acctAlertResponse(acctAlerts[3]),
          acctAlertResponse(acctAlerts[4]),
        ],
      })
    })

    it('returns a message when there are no ACCT alerts', () => {
      const page = new AcctAlerts({ acctAlerts: [] }, application)

      expect(page.response()).toEqual({
        'ACCT Alerts': 'No ACCT information available for the person at the time of referral',
      })
    })
  })

  describe('errors', () => {
    expect(new AcctAlerts({}, application).errors()).toEqual({})
  })
})
