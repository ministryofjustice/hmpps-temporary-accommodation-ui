import { createMock } from '@golevelup/ts-jest'
import type { Request, Response } from 'express'
import { CallConfig } from '../data/restClient'
import type { UserService } from '../services'
import { UserDetails } from '../services/userService'
import { userFactory } from '../testutils/factories'
import extractCallConfig from '../utils/restUtils'
import populateCurrentUser from './populateCurrentUser'

jest.mock('../utils/restUtils')

describe('populateUserRegion', () => {
  const callConfig = { token: 'some-call-config-token' } as CallConfig
  const userService = createMock<UserService>()

  const userDetails = userFactory.build() as UserDetails

  beforeEach(() => {
    userService.getActingUser.mockReset()
  })

  it('set user details from the user service if not already set', async () => {
    const request = createMock<Request>()
    const response = createMock<Response>()
    const next = jest.fn()
    ;(extractCallConfig as jest.MockedFunction<typeof extractCallConfig>).mockReturnValue(callConfig)

    userService.getActingUser.mockResolvedValue(userDetails)

    await populateCurrentUser(userService)(request, response, next)

    expect(userService.getActingUser).toHaveBeenCalledWith(callConfig)

    expect(request.session.userDetails).toEqual(userDetails)
    expect(request.session.probationRegion).toEqual(userDetails.region)

    expect(response.locals.user).toEqual(userDetails)

    expect(next).toHaveBeenCalledWith()
  })

  it('set user details from the user session if not already set', async () => {
    const request = createMock<Request>()
    const response = createMock<Response>()
    const next = jest.fn()
    ;(extractCallConfig as jest.MockedFunction<typeof extractCallConfig>).mockReturnValue(callConfig)

    request.session.userDetails = userDetails

    await populateCurrentUser(userService)(request, response, next)

    expect(userService.getActingUser).not.toHaveBeenCalled()

    expect(request.session.userDetails).toEqual(userDetails)
    expect(request.session.probationRegion).toEqual(userDetails.region)

    expect(response.locals.user).toEqual(userDetails)

    expect(next).toHaveBeenCalledWith()
  })

  it('propogates any error from the user service', async () => {
    const request = createMock<Request>()
    const response = createMock<Response>()
    const next = jest.fn()
    ;(extractCallConfig as jest.MockedFunction<typeof extractCallConfig>).mockReturnValue(callConfig)

    const error = new Error()
    userService.getActingUser.mockRejectedValue(error)

    await populateCurrentUser(userService)(request, response, next)

    expect(next).toHaveBeenCalledWith(error)
  })
})
