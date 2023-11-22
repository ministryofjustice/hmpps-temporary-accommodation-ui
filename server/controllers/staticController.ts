import type { Request, RequestHandler, Response } from 'express'

export default class StaticController {
  cookies(): RequestHandler {
    return (_req: Request, res: Response) => {
      res.render('temporary-accommodation/static/cookies')
    }
  }

  accessibilityStatement(): RequestHandler {
    return (_req: Request, res: Response) => {
      res.render('temporary-accommodation/static/accessibilityStatement')
    }
  }

  useNDelius(): RequestHandler {
    return (_req: Request, res: Response) => {
      res.render('temporary-accommodation/static/useNDelius')
    }
  }

  notAuthorised(): RequestHandler {
    return (_req: Request, res: Response) => {
      res.render('temporary-accommodation/static/notAuthorised')
    }
  }
}
