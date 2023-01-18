import { createMock } from '@golevelup/ts-jest'
import { Request, Response } from 'express'
import { path } from 'static-path'
import logger from '../../logger'
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

  it('returns an audited request handler, the redirects to /authError if there is no user UUID', async () => {
    const handler = jest.fn()
    const response = createMock<Response>({ locals: { user: {} } })
    const request = createMock<Request>()
    const next = jest.fn()

    const auditService = createMock<AuditService>()

    const auditedhandler = auditMiddleware(handler, auditService, { auditEvent })

    await auditedhandler(request, response, next)

    expect(handler).not.toHaveBeenCalled()
    expect(response.redirect).toHaveBeenCalledWith('/authError')
    expect(logger.error).toHaveBeenCalledWith('User without a UUID is attempt to access an audited path')
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

  it('returns an audited request handler, that sends an audit message that includes selected request body parameters', async () => {
    const handler = jest.fn()
    const response = createMock<Response>({ locals: { user: { uuid: userUuid } } })
    const request = createMock<Request>({
      params: requestParams,
      body: { bodyParam1: 'body-value-1', bodyParam2: 'body-value-2', bodyParam3: 'body-value-3' },
    })
    const next = jest.fn()

    const auditService = createMock<AuditService>()

    const auditedhandler = auditMiddleware(handler, auditService, {
      auditEvent,
      auditBodyParams: ['bodyParam1', 'bodyParam2'],
    })

    await auditedhandler(request, response, next)

    expect(handler).toHaveBeenCalled()
    expect(auditService.sendAuditMessage).toHaveBeenCalledWith(auditEvent, userUuid, {
      ...requestParams,
      bodyParam1: 'body-value-1',
      bodyParam2: 'body-value-2',
    })
  })

  it('ignores empty request body parameters', async () => {
    const handler = jest.fn()
    const response = createMock<Response>({ locals: { user: { uuid: userUuid } } })
    const request = createMock<Request>({
      params: requestParams,
      body: { bodyParam1: 'body-value-1', bodyParam2: '' },
    })
    const next = jest.fn()

    const auditService = createMock<AuditService>()

    const auditedhandler = auditMiddleware(handler, auditService, {
      auditEvent,
      auditBodyParams: ['bodyParam1', 'bodyParam2'],
    })

    await auditedhandler(request, response, next)

    expect(handler).toHaveBeenCalled()
    expect(auditService.sendAuditMessage).toHaveBeenCalledWith(auditEvent, userUuid, {
      ...requestParams,
      bodyParam1: 'body-value-1',
    })
  })

  it('returns an audited request handler, that sends an audit message based on the redirect destination of the given request handler', async () => {
    const somePath = path('/').path('premises').path(':premisesId').path('room').path(':roomId')

    const handler = jest.fn()
    const response = createMock<Response>({
      locals: { user: { uuid: userUuid } },
      get: field => {
        return field === 'Location' ? somePath({ premisesId: 'some-premises', roomId: 'some-room' }) : undefined
      },
    })
    const request = createMock<Request>()
    const next = jest.fn()

    const auditService = createMock<AuditService>()

    const auditedhandler = auditMiddleware(handler, auditService, {
      redirectAuditEventSpecs: [{ auditEvent, path: somePath.pattern }],
    })

    await auditedhandler(request, response, next)

    expect(handler).toHaveBeenCalled()
    expect(auditService.sendAuditMessage).toHaveBeenCalledWith(auditEvent, userUuid, {
      premisesId: 'some-premises',
      roomId: 'some-room',
    })
  })

  it('sends an audit message only for the first matching RedirectAuditEventSpec', async () => {
    const nonMatchingPath = path('/').path('some-path-component')
    const matchingPath1 = path('/').path('premises').path(':premisesId').path('room').path('new')
    const matchingPath2 = path('/').path('premises').path(':premisesId').path('room').path(':roomId')

    const handler = jest.fn()
    const response = createMock<Response>({
      locals: { user: { uuid: userUuid } },
      get: field => {
        return field === 'Location' ? matchingPath1({ premisesId: 'some-premises' }) : undefined
      },
    })
    const request = createMock<Request>()
    const next = jest.fn()

    const auditService = createMock<AuditService>()

    const auditedhandler = auditMiddleware(handler, auditService, {
      redirectAuditEventSpecs: [
        { auditEvent: 'NON_MATCHING_PATH_AUDIT_EVENT', path: nonMatchingPath.pattern },
        { auditEvent: 'MATCHING_PATH_1_AUDIT_EVENT', path: matchingPath1.pattern },
        { auditEvent: 'MATCHING_PATH_2_AUDIT_EVENT', path: matchingPath2.pattern },
      ],
    })

    await auditedhandler(request, response, next)

    expect(handler).toHaveBeenCalled()
    expect(auditService.sendAuditMessage).toHaveBeenCalledWith('MATCHING_PATH_1_AUDIT_EVENT', userUuid, {
      premisesId: 'some-premises',
    })
  })
})
