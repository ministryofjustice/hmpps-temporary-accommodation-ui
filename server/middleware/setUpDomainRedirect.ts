import type { Router } from 'express'
import express from 'express'
import config from '../config'

const router = express.Router()

export default function setUpDomainRedirect(): Router {
  const source = new URL(config.firstDomain)
  const target = new URL(config.secondDomain)

  router.use((req, res, next) => {
    if (req.headers.host === source.host) {
      target.pathname = req.path
      return res.redirect(301, `${target.toString()}`)
    }
    return next()
  })

  return router
}
