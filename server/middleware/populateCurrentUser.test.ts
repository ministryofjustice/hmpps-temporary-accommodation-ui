import { createMock } from '@golevelup/ts-jest'
import { telemetryMiddleware, trace } from '@ministryofjustice/hmpps-azure-telemetry'
import type { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { CallConfig } from '../data/restClient'
import type { UserService } from '../services'
import { UserDetails } from '../services/userService'
import { userFactory } from '../testutils/factories'
import extractCallConfig from '../utils/restUtils'
import populateCurrentUser from './populateCurrentUser'

jest.mock('../utils/restUtils')

describe('populateCurrentUser', () => {
  const callConfig = { token: 'some-call-config-token' } as CallConfig
  const userService = createMock<UserService>()

  const userDetails = userFactory.build() as UserDetails
  const userId = 'test-user-id'
  const userUuid = '11111111-1111-1111-1111-111111111111'
  const makeUser = (claims: Record<string, string> = {}) => ({
    token: jwt.sign(claims, 'test-secret'),
    username: 'test-user',
    authSource: 'delius',
  })

  beforeEach(() => {
    userService.getActingUser.mockReset()
  })

  it('set user details from the user service if not already set', async () => {
    const request = createMock<Request>()
    const response = createMock<Response>()
    const next = jest.fn()
    ;(extractCallConfig as jest.MockedFunction<typeof extractCallConfig>).mockReturnValue(callConfig)
    request.user = makeUser({ user_id: userId, user_uuid: userUuid })

    userService.getActingUser.mockResolvedValue(userDetails)

    await populateCurrentUser(userService)(request, response, next)

    expect(userService.getActingUser).toHaveBeenCalledWith(callConfig)

    expect(request.session.userDetails).toEqual(userDetails)
    expect(request.session.probationRegion).toEqual(userDetails.region)

    expect(response.locals.user).toEqual({
      ...userDetails,
      userId,
      userUuid,
    })

    expect(next).toHaveBeenCalledWith()

    const span = createMock<NonNullable<ReturnType<typeof trace.getActiveSpan>>>()
    const getActiveSpan = jest.spyOn(trace, 'getActiveSpan').mockReturnValue(span)
    telemetryMiddleware.addUserMetadataToTelemetry()(request, { locals: { user: response.locals.user } }, next)
    expect(span.setAttribute).toHaveBeenCalledWith('userId', userId)
    expect(span.setAttribute).toHaveBeenCalledWith('userUuid', userUuid)
    getActiveSpan.mockRestore()
  })

  it('set user details from the user session if not already set', async () => {
    const request = createMock<Request>()
    const response = createMock<Response>()
    const next = jest.fn()
    ;(extractCallConfig as jest.MockedFunction<typeof extractCallConfig>).mockReturnValue(callConfig)

    request.user = makeUser({ user_id: userId, user_uuid: userUuid })
    request.session.userDetails = userDetails

    await populateCurrentUser(userService)(request, response, next)

    expect(userService.getActingUser).not.toHaveBeenCalled()

    expect(request.session.userDetails).toEqual(userDetails)
    expect(request.session.probationRegion).toEqual(userDetails.region)

    expect(response.locals.user).toEqual({ ...userDetails, userId, userUuid })

    expect(next).toHaveBeenCalledWith()
  })

  it('continues without user identifiers when the token has no user_id or user_uuid claims', async () => {
    const request = createMock<Request>()
    const response = createMock<Response>()
    const next = jest.fn()
    request.user = makeUser()
    request.session.userDetails = userDetails

    await populateCurrentUser(userService)(request, response, next)

    expect(response.locals.user.userId).toBeUndefined()
    expect(response.locals.user.userUuid).toBeUndefined()
    expect(next).toHaveBeenCalledWith()
  })

  it('redirects to user details required page when staff record is missing', async () => {
    const request = createMock<Request>()
    const response = createMock<Response>()
    const next = jest.fn()
    ;(extractCallConfig as jest.MockedFunction<typeof extractCallConfig>).mockReturnValue(callConfig)
    request.user = makeUser()

    const { DeliusAccountMissingStaffDetailsError } = jest.requireActual('../services/userService')
    userService.getActingUser.mockRejectedValue(new DeliusAccountMissingStaffDetailsError('missing'))

    await populateCurrentUser(userService)(request, response, next)

    expect(response.redirect).toHaveBeenCalledWith('/deliusMissingStaffDetails')
    expect(next).not.toHaveBeenCalledWith(expect.any(Error))
  })

  it('propogates any error from the user service', async () => {
    const request = createMock<Request>()
    const response = createMock<Response>()
    const next = jest.fn()
    ;(extractCallConfig as jest.MockedFunction<typeof extractCallConfig>).mockReturnValue(callConfig)
    request.user = makeUser()

    const error = new Error()
    userService.getActingUser.mockRejectedValue(error)

    await populateCurrentUser(userService)(request, response, next)

    expect(next).toHaveBeenCalledWith(error)
  })
})
