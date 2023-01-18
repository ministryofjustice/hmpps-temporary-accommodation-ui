import { RequestHandler, Request, Response, NextFunction } from 'express'
import AuditService from '../services/auditService'

export type AuditEventSpec = {
  auditEvent?: string
}

export const auditMiddleware = (
  handler: RequestHandler,
  auditService: AuditService,
  auditEventSpec?: AuditEventSpec,
) => {
  if (auditEventSpec) {
    return wrapHandler(handler, auditService, auditEventSpec?.auditEvent)
  }
  return handler
}

const wrapHandler =
  (handler: RequestHandler, auditService: AuditService, auditEvent: string | undefined) =>
  async (req: Request, res: Response, next: NextFunction) => {
    await handler(req, res, next)

    if (auditEvent) {
      await auditService.sendAuditMessage(auditEvent, res.locals.user.uuid, req.params)
    }
  }
