import type { TemporaryAccommodationApplication as Application, ProbationRegion } from '@approved-premises/api'
import type { ErrorMessages, PlaceContext } from '@approved-premises/ui'
import { UserDetails } from '../../services/userService'

export default {}

declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    nowInMinutes: number
    application: Application
    previousPage: string
    probationRegion: ProbationRegion
    userDetails: UserDetails
  }
}

declare module 'express-serve-static-core' {
  interface Locals {
    placeContext: PlaceContext
  }
}

declare module 'express' {
  interface TypedRequest<T extends Query, U = Body> extends Express.Request {
    body: U
    params: T
  }

  interface TypedRequestHandler<T, U = Response> extends Express.RequestHandler {
    (req: T, res: U, next: () => void): void
  }

  interface ShowParams {
    id: string
  }
}

type FlashMessage = string | ErrorMessages | Array<ErrorSummary> | Record<string, unknown>

export declare global {
  namespace Express {
    interface User {
      username: string
      token: string
      authSource: string
    }

    interface Request {
      verified?: boolean
      id: string
      user?: User

      logout(done: (err: unknown) => void): void

      flash(type: string, message: FlashMessage): number

      flash(type: string): FlashMessage
    }
  }
}
