import { createMock } from '@golevelup/ts-jest'
import { Request } from 'express'
import { probationRegionFactory } from '../testutils/factories'
import extractCallConfig from './restUtils'

describe('extractCallConfig', () => {
  it('extracts the token from the given request', () => {
    const request = createMock<Request>({
      user: { token: 'some-token' },
    })

    expect(extractCallConfig(request)).toEqual({ token: 'some-token' })
  })

  it('extracts the token and the probation region from the given request', () => {
    const request = createMock<Request>({
      user: { token: 'some-token' },
      session: { probationRegion: probationRegionFactory.build() },
    })

    expect(extractCallConfig(request)).toEqual({
      token: 'some-token',
      probationRegion: request.session.probationRegion,
    })
  })
})
