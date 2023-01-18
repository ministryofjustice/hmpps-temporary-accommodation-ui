import { createMock } from '@golevelup/ts-jest'
import { Request, Response } from 'express'
import AuditService from '../services/auditService'
import { auditMiddleware } from './auditMiddleware'

jest.mock('../../logger')

const userUuid = 'some-user-uuid'
const requestParams = { param1: 'value-1', param2: 'value-2' }
const auditEvent = 'SOME_AUDIT_EVENT'

describe('auditMiddleware', () => {
  it('returns the given request handler when no audit events are specified', async () => {
    const handler = jest.fn()

    const auditService = createMock<AuditService>()

    const auditedhandler = auditMiddleware(handler, auditService)

    expect(auditedhandler).toEqual(handler)
  })

  it('returns an audited request handler, that forwards call on to the given request handler', async () => {
    const handler = jest.fn()
    const response = createMock<Response>({ locals: { user: { uuid: userUuid } } })
    const request = createMock<Request>()
    const next = jest.fn()

    const auditService = createMock<AuditService>()

    const auditedhandler = auditMiddleware(handler, auditService, { auditEvent })

    await auditedhandler(request, response, next)

    expect(handler).toHaveBeenCalled()
  })

  it('returns an audited request handler, that sends an audit message that includes the request parameters', async () => {
    const handler = jest.fn()
    const response = createMock<Response>({ locals: { user: { uuid: userUuid } } })
    const request = createMock<Request>({ params: requestParams })
    const next = jest.fn()

    const auditService = createMock<AuditService>()

    const auditedhandler = auditMiddleware(handler, auditService, { auditEvent })

    await auditedhandler(request, response, next)

    expect(handler).toHaveBeenCalled()
    expect(auditService.sendAuditMessage).toHaveBeenCalledWith(auditEvent, userUuid, requestParams)
  })
})
