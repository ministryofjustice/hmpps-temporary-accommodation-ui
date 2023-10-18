import passport from 'passport'
import { Strategy } from 'passport-oauth2'
import type { RequestHandler } from 'express'

import config from '../config'
import generateOauthClientToken from './clientCredentials'
import type { TokenVerifier } from '../data/tokenVerification'

passport.serializeUser((user, done) => {
  // Not used but required for Passport
  done(null, user)
})

passport.deserializeUser((user, done) => {
  // Not used but required for Passport
  done(null, user as Express.User)
})

export type AuthenticationMiddleware = (tokenVerifier: TokenVerifier) => RequestHandler

const authenticationMiddleware: AuthenticationMiddleware = verifyToken => {
  return async (req, res, next) => {
    if (req.isAuthenticated() && (await verifyToken(req))) {
      return next()
    }
    req.session.returnTo = req.originalUrl
    return res.redirect('/sign-in')
  }
}

function init(): void {
  const defaultStrategyConfig = {
    authorizationURL: `${config.apis.hmppsAuth.externalUrl}/oauth/authorize`,
    tokenURL: `${config.apis.hmppsAuth.url}/oauth/token`,
    clientID: config.apis.hmppsAuth.apiClientId,
    clientSecret: config.apis.hmppsAuth.apiClientSecret,
    state: true,
    customHeaders: { Authorization: generateOauthClientToken() },
  }

  // TODO: Remove this once our sign in testing on our new domain is complete on
  // the test env.
  const redirectToDomain = process.env.NODE_ENV === 'test' ? config.secondDomain : config.firstDomain

  const callbackURL = {
    callbackURL: `${redirectToDomain}/sign-in/callback`,
  }

  const strategy = new Strategy(
    {
      ...defaultStrategyConfig,
      ...callbackURL,
    },
    (token, refreshToken, params, profile, done) => {
      return done(null, { token, username: params.user_name, authSource: params.auth_source })
    },
  )

  passport.use(strategy)
}

export default {
  authenticationMiddleware,
  init,
}
