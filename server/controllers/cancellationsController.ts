import type { Response, Request, RequestHandler } from 'express'

import { CancellationService, BookingService } from '../services'
import { fetchErrorsAndUserInput } from '../utils/validation'

export default class CancellationsController {
  constructor(
    private readonly cancellationService: CancellationService,
    private readonly bookingService: BookingService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const booking = await this.bookingService.getBooking(premisesId, bookingId)
      const cancellationReasons = await this.cancellationService.getCancellationReasons()

      res.render('cancellations/new', {
        premisesId,
        bookingId,
        booking,
        cancellationReasons,
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }
}
