import type { Response, Request, RequestHandler } from 'express'

import type { NewCancellation } from 'approved-premises'

import { CancellationService, BookingService } from '../services'
import { fetchErrorsAndUserInput, catchValidationErrorOrPropogate } from '../utils/validation'
import { convertDateAndTimeInputsToIsoString } from '../utils/utils'

export default class CancellationsController {
  constructor(
    private readonly cancellationService: CancellationService,
    private readonly bookingService: BookingService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const booking = await this.bookingService.find(req.user.token, premisesId, bookingId)
      const cancellationReasons = await this.cancellationService.getCancellationReasons(req.user.token)

      res.render('cancellations/new', {
        premisesId,
        bookingId,
        booking,
        cancellationReasons,
        pageHeading: 'Cancel this placement',
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params
      const { date } = convertDateAndTimeInputsToIsoString(req.body, 'date')

      const cancellation = {
        ...req.body.cancellation,
        date,
      } as NewCancellation

      try {
        const { id } = await this.cancellationService.createCancellation(
          req.user.token,
          premisesId,
          bookingId,
          cancellation,
        )
        res.redirect(`/premises/${premisesId}/bookings/${bookingId}/cancellations/${id}/confirmation`)
      } catch (err) {
        catchValidationErrorOrPropogate(
          req,
          res,
          err,
          `/premises/${premisesId}/bookings/${bookingId}/cancellations/new`,
        )
      }
    }
  }

  confirm(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId, id } = req.params
      const booking = await this.bookingService.find(req.user.token, premisesId, bookingId)
      const cancellation = await this.cancellationService.getCancellation(req.user.token, premisesId, bookingId, id)

      return res.render('cancellations/confirm', {
        cancellation,
        booking,
        premisesId,
        pageHeading: 'Cancellation complete',
      })
    }
  }
}
