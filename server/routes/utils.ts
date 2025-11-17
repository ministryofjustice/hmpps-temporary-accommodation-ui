/* istanbul ignore file */

import { type RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { AuditEventSpec, auditMiddleware } from '../middleware/auditMiddleware'
import AuditService from '../services/auditService'
import validateMiddleware from '../middleware/validateMiddleware'
import { fieldValidators } from './validators'

type RoutingFunction = (path: string | string[], handler: RequestHandler, auditEventSpec?: AuditEventSpec) => Router

type Actions = {
  get: RoutingFunction
  post: RoutingFunction
  put: RoutingFunction
  patch: RoutingFunction
}

export function actions(router: Router, auditService: AuditService): Actions {
  return {
    get: (path: string | string[], handler: RequestHandler, auditEventSpec?: AuditEventSpec) =>
      router.get(
        path,
        asyncMiddleware(validateMiddleware(auditMiddleware(handler, auditService, auditEventSpec), fieldValidators)),
      ),
    post: (path: string | string[], handler: RequestHandler, auditEventSpec?: AuditEventSpec) =>
      router.post(
        path,
        asyncMiddleware(validateMiddleware(auditMiddleware(handler, auditService, auditEventSpec), fieldValidators)),
      ),
    put: (path: string | string[], handler: RequestHandler, auditEventSpec?: AuditEventSpec) =>
      router.put(
        path,
        asyncMiddleware(validateMiddleware(auditMiddleware(handler, auditService, auditEventSpec), fieldValidators)),
      ),
    patch: (path: string | string[], handler: RequestHandler, auditEventSpec?: AuditEventSpec) =>
      router.patch(
        path,
        asyncMiddleware(validateMiddleware(auditMiddleware(handler, auditService, auditEventSpec), fieldValidators)),
      ),
  }
}

export function compose(sourceActions: Actions, middleware: (handler: RequestHandler) => RequestHandler): Actions {
  return {
    get: (path: string | string[], handler: RequestHandler, auditEventSpec?: AuditEventSpec) =>
      sourceActions.get(path, middleware(handler), auditEventSpec),
    post: (path: string | string[], handler: RequestHandler, auditEventSpec?: AuditEventSpec) =>
      sourceActions.post(path, middleware(handler), auditEventSpec),
    put: (path: string | string[], handler: RequestHandler, auditEventSpec?: AuditEventSpec) =>
      sourceActions.put(path, middleware(handler), auditEventSpec),
    patch: (path: string | string[], handler: RequestHandler, auditEventSpec?: AuditEventSpec) =>
      sourceActions.patch(path, middleware(handler), auditEventSpec),
  }
}
