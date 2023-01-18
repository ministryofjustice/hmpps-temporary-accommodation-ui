import { RequestHandler, Request, Response, NextFunction } from 'express'
import logger from '../../logger'
import AuditService from '../services/auditService'

export type AuditEventSpec = {
  auditEvent?: string
  auditBodyParams?: string[]
}

export const auditMiddleware = (
  handler: RequestHandler,
  auditService: AuditService,
  auditEventSpec?: AuditEventSpec,
) => {
  if (auditEventSpec) {
    return wrapHandler(handler, auditService, auditEventSpec?.auditEvent, auditEventSpec?.auditBodyParams)
  }
  return handler
}

const wrapHandler =
  (
    handler: RequestHandler,
    auditService: AuditService,
    auditEvent: string | undefined,
    auditBodyParams: string[] | undefined,
  ) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const userUuid = res?.locals?.user?.uuid

    if (!userUuid) {
      logger.error('User without a UUID is attempt to access an audited path')
      res.redirect('/authError')
      return
    }

    await handler(req, res, next)

    if (auditEvent) {
      await auditService.sendAuditMessage(auditEvent, userUuid, auditDetails(req, auditBodyParams))
    }
  }

const auditDetails = (req: Request, auditBodyParams: string[] | undefined) => {
  if (!auditBodyParams) {
    return req.params
  }

  return {
    ...req.params,
    ...auditBodyParams.reduce(
      (previous, current) => (req.body[current] ? { [current]: req.body[current], ...previous } : previous),
      {},
    ),
  }
}
