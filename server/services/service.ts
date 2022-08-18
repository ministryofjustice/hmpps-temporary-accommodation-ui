import type { Request } from 'express'

export default class Service {
  token: string

  withTokenFromRequest(request: Request): typeof this {
    this.token = request.user.token
    return this
  }
}
