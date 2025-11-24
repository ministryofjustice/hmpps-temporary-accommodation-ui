import express, { Router } from 'express'
import config from '../config'
import { userHasAdminRole } from '../utils/userUtils'
import paths from '../paths/temporary-accommodation/static'

export default function setUpMaintenancePageRedirect(): Router {
  const router = express.Router()
  const allowedPaths = ['/sign-in', '/sign-in/callback', '/health', '/maintenance']

  router.use((req, res, next) => {
    if (config.flags.maintenanceMode) {
      if (!allowedPaths.includes(req.path) && !userHasAdminRole(res.locals.user)) {
        return res.redirect(302, paths.static.maintenance({}))
      }
    }
    return next()
  })

  return router
}
