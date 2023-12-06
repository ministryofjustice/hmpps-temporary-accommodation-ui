import flash from 'connect-flash'
import type { Router } from 'express'
import express from 'express'
import passport from 'passport'
import logger from '../../logger'
import auth from '../authentication/auth'
import config from '../config'

const router = express.Router()

export default function setUpAuth(): Router {
  auth.init()

  router.use(passport.initialize())
  router.use(passport.session())
  router.use(flash())

  router.get('/autherror', (req, res) => {
    res.status(401)
    return res.render('autherror')
  })

  router.get('/sign-in', passport.authenticate('oauth2'))

  router.get('/sign-in/callback', (req, res, next) => {
    const authCallback: passport.AuthenticateCallback = (err, user, info) => {
      if (err) {
        return res.redirect('/autherror')
      }
      if (!user) {
        if (Object.prototype.hasOwnProperty.call(info, 'message')) {
          const { message } = info as { message: string }
          if (info && message === 'Unable to verify authorization request state.') {
            // failure to due authorisation state not being there on return, so retry
            logger.info('Retrying auth callback as no state found')
            return res.redirect('/')
          }
        }
        logger.info(`Auth failure due to ${JSON.stringify(info)}`)
        return res.redirect('/autherror')
      }
      req.logIn(user, err2 => {
        if (err2) {
          return next(err2)
        }
        if (Object.prototype.hasOwnProperty.call(req.session, 'returnTo')) {
          const { returnTo } = req.session
          if (typeof returnTo === 'string' && returnTo.startsWith('/')) {
            return res.redirect(returnTo)
          }
        }
        return res.redirect('/')
      })
      return null
    }
    passport.authenticate('oauth2', authCallback)(req, res, next)
  })

  const authUrl = config.apis.hmppsAuth.externalUrl
  const redirectToDomain = config.secondDomain
  const authSignOutUrl = `${authUrl}/sign-out?client_id=${config.apis.hmppsAuth.apiClientId}&redirect_uri=${redirectToDomain}`

  router.use('/sign-out', (req, res, next) => {
    if (req.user) {
      req.logout(err => {
        if (err) return next(err)
        return req.session.destroy(() => res.redirect(authSignOutUrl))
      })
    } else res.redirect(authSignOutUrl)
  })

  router.use('/account-details', (req, res) => {
    res.redirect(`${authUrl}/account-details`)
  })

  router.use((req, res, next) => {
    res.locals.user = req.user
    next()
  })

  return router
}
