import type { Booking } from 'approved-premises'
import type { Request, Response, RequestHandler } from 'express'

import BookingService from '../services/bookingService'
import { convertDateInputsToDateObj } from '../utils/utils'

export default class BookingsController {
  constructor(private readonly bookingService: BookingService) {}

  new(): RequestHandler {
    return (req: Request, res: Response) => {
      const { premisesId } = req.params

      return res.render(`premises/booking/new`, { premisesId })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId } = req.params
      const { CRN, keyWorker }: Booking = req.body

      const arrivalDate = convertDateInputsToDateObj(
        {
          'arrival-day': req.body['arrival-day'],
          'arrival-month': req.body['arrival-month'],
          'arrival-year': req.body['arrival-year'],
        },
        'arrival',
      ).arrival.toISOString()

      const expectedDepartureDate = convertDateInputsToDateObj(
        {
          'expected-departure-day': req.body['expected-departure-day'],
          'expected-departure-month': req.body['expected-departure-month'],
          'expected-departure-year': req.body['expected-departure-year'],
        },
        'expected-departure',
      )['expected-departure'].toISOString()

      await this.bookingService.postBooking(premisesId as string, {
        CRN,
        arrivalDate,
        expectedDepartureDate,
        keyWorker,
      })

      req.flash('info', 'Booking made successfully')

      res.redirect(`/premises`)
    }
  }
}
