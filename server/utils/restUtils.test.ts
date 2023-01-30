import { createMock } from '@golevelup/ts-jest'
import { Request } from 'express'
import extractCallConfig from './restUtils'

describe('extractCallConfig', () => {
  it('extracts the token from the given request', () => {
    const request = createMock<Request>({
      user: { token: 'some-token' },
    })

    expect(extractCallConfig(request)).toEqual({ token: 'some-token' })
  })
})
