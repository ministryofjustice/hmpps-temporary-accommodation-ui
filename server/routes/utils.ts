/* istanbul ignore file */

import { type RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { AuditEventSpec, auditMiddleware } from '../middleware/auditMiddleware'
import AuditService from '../services/auditService'

export default function actions(router: Router, auditService: AuditService) {
  return {
    get: (path: string | string[], handler: RequestHandler, auditEventSpec?: AuditEventSpec) =>
      router.get(path, asyncMiddleware(auditMiddleware(handler, auditService, auditEventSpec))),
    post: (path: string | string[], handler: RequestHandler, auditEventSpec?: AuditEventSpec) =>
      router.post(path, asyncMiddleware(auditMiddleware(handler, auditService, auditEventSpec))),
    put: (path: string | string[], handler: RequestHandler, auditEventSpec?: AuditEventSpec) =>
      router.put(path, asyncMiddleware(auditMiddleware(handler, auditService, auditEventSpec))),
  }
}
