import { createMock } from '@golevelup/ts-jest'
import type { Request, Response } from 'express'
import populateUserRegion from './populateUserRegion'

import type { UserService } from '../services'
import userFactory from '../testutils/factories/user'
import probationRegionFactory from '../testutils/factories/probationRegion'
import extractCallConfig from '../utils/restUtils'
import { CallConfig } from '../data/restClient'
import { ProbationRegion } from '../@types/shared'

jest.mock('../utils/restUtils')

describe('populateUserRegion', () => {
  const callConfig = { token: 'some-call-config-token' } as CallConfig
  const userService = createMock<UserService>()

  it('does nothing if the user region is already set in the session', async () => {
    const actingUserProbationRegion = probationRegionFactory.build()
    const request = createMock<Request>({
      session: { probationRegion: actingUserProbationRegion },
    })
    const response = createMock<Response>()
    const next = jest.fn()

    await populateUserRegion(userService)(request, response, next)

    expect(userService.getActingUser).not.toHaveBeenCalled()
    expect(request.session.probationRegion).toEqual(actingUserProbationRegion)
    expect(next).toHaveBeenCalledWith()
  })

  it('sets the user region in the session if it is not already set', async () => {
    const actingUserProbationRegion = probationRegionFactory.build()
    const request = createMock<Request>()
    const response = createMock<Response>()
    const next = jest.fn()
    ;(extractCallConfig as jest.MockedFunction<typeof extractCallConfig>).mockReturnValue(callConfig)

    const user = userFactory.build({
      region: actingUserProbationRegion as ProbationRegion,
    })

    userService.getActingUser.mockResolvedValue(user)

    await populateUserRegion(userService)(request, response, next)

    expect(userService.getActingUser).toHaveBeenCalledWith(callConfig)
    expect(request.session.probationRegion).toEqual(actingUserProbationRegion)
    expect(next).toHaveBeenCalledWith()
  })
})
