import type { Request } from 'express'
import type { DeepMocked } from '@golevelup/ts-jest'

import type Service from '../../services/service'

export default function servicesShouldGetTokenFromRequest(services: Array<DeepMocked<Service>>, request: Request) {
  beforeEach(() => {
    services.forEach(service => service.withTokenFromRequest.mockReturnValue(service))
  })

  afterEach(() => {
    services.forEach(service => expect(service.withTokenFromRequest).toHaveBeenCalledWith(request))
  })
}
