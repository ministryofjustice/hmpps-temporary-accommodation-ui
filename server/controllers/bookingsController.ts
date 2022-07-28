import type { BookingDto } from 'approved-premises'
import type { Request, Response, RequestHandler } from 'express'

import BookingService from '../services/bookingService'
import { convertDateInputsToIsoString } from '../utils/utils'

export default class BookingsController {
  constructor(private readonly bookingService: BookingService) {}

  new(): RequestHandler {
    return (req: Request, res: Response) => {
      const { premisesId } = req.params

      return res.render(`premises/bookings/new`, { premisesId })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId } = req.params

      const booking: BookingDto = {
        ...req.body,
        ...convertDateInputsToIsoString(req.body, 'arrivalDate'),
        ...convertDateInputsToIsoString(req.body, 'expectedDepartureDate'),
      }

      const confirmedBooking = await this.bookingService.postBooking(premisesId as string, booking)

      return res.redirect(`/premises/${premisesId}/bookings/${confirmedBooking.id}/confirmation`)
    }
  }

  confirm(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params
      const booking = await this.bookingService.getBooking(premisesId, bookingId)

      return res.render('premises/bookings/confirm', booking)
    }
  }
}
