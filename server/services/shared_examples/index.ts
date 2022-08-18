import type { Request } from 'express'
// eslint-disable-next-line import/no-extraneous-dependencies
import { createMock } from '@golevelup/ts-jest'

import Service from '../service'

export default function itGetsATokenFromARequest(service: Service) {
  describe('withTokenFromRequest', () => {
    const request = createMock<Request>({ user: { token: 'some-token' } })
    const result = service.withTokenFromRequest(request)

    it('should extract a token from the request', () => {
      expect(result.token).toEqual('some-token')
    })

    it('should return the object', () => {
      expect(result).toEqual(service)
    })
  })
}
