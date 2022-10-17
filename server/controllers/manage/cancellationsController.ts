import type { Response, Request, RequestHandler } from 'express'

import type { NewCancellation } from '@approved-premises/api'

import { CancellationService, BookingService } from '../../services'
import { fetchErrorsAndUserInput, catchValidationErrorOrPropogate } from '../../utils/validation'
import { DateFormats } from '../../utils/dateUtils'

import paths from '../../paths/manage'

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
      const { date } = DateFormats.convertDateAndTimeInputsToIsoString(req.body, 'date')

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
        res.redirect(
          paths.bookings.cancellations.confirm({
            bookingId,
            premisesId,
            id,
          }),
        )
      } catch (err) {
        catchValidationErrorOrPropogate(
          req,
          res,
          err,
          paths.bookings.cancellations.new({
            bookingId,
            premisesId,
          }),
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
