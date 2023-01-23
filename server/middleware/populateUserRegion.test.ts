import { createMock } from '@golevelup/ts-jest'
import type { Request, Response } from 'express'
import populateUserRegion from './populateUserRegion'

import type { UserService } from '../services'
import userFactory from '../testutils/factories/user'
import probationRegionFactory from '../testutils/factories/probationRegion'

describe('populateUserRegion', () => {
  const token = 'some-token'
  const userService = createMock<UserService>()

  it('does nothing if the user region is already set in the session', async () => {
    const actingUserProbationRegion = probationRegionFactory.build()
    const request = createMock<Request>({
      session: { actingUserProbationRegion },
    })
    const response = createMock<Response>()
    const next = jest.fn()

    await populateUserRegion(userService)(request, response, next)

    expect(userService.getActingUser).not.toHaveBeenCalled()
    expect(request.session.actingUserProbationRegion).toEqual(actingUserProbationRegion)
    expect(next).toHaveBeenCalledWith()
  })

  it('sets the user region in the session if it is not already set', async () => {
    const actingUserProbationRegion = probationRegionFactory.build()
    const request = createMock<Request>({ user: { token } })
    const response = createMock<Response>()
    const next = jest.fn()

    const user = userFactory.build({
      probationRegion: actingUserProbationRegion,
    })

    userService.getActingUser.mockResolvedValue(user)

    await populateUserRegion(userService)(request, response, next)

    expect(userService.getActingUser).toHaveBeenCalledWith(token)
    expect(request.session.actingUserProbationRegion).toEqual(actingUserProbationRegion)
    expect(next).toHaveBeenCalledWith()
  })
})
