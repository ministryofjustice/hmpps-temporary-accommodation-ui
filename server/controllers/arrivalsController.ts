import type { Response, Request, RequestHandler } from 'express'
import type { Arrival, ArrivalDto } from 'approved-premises'

import { convertDateAndTimeInputsToIsoString } from '../utils/utils'
import ArrivalService from '../services/arrivalService'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../utils/validation'

export default class ArrivalsController {
  constructor(private readonly arrivalService: ArrivalService) {}

  new(): RequestHandler {
    return (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      res.render('arrivals/new', {
        premisesId,
        bookingId,
        errors,
        errorSummary,
        pageHeading: 'Did the resident arrive?',
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params
      const body = req.body as ArrivalDto

      const { date } = convertDateAndTimeInputsToIsoString(body, 'date')
      const { expectedDepartureDate } = convertDateAndTimeInputsToIsoString(body, 'expectedDepartureDate')

      const arrival: Omit<Arrival, 'id' | 'bookingId'> = {
        ...body.arrival,
        date,
        expectedDepartureDate,
      }

      try {
        await this.arrivalService.createArrival(req.user.token, premisesId, bookingId, arrival)

        req.flash('success', 'Arrival logged')
        res.redirect(`/premises/${premisesId}`)
      } catch (err) {
        catchValidationErrorOrPropogate(req, res, err, `/premises/${premisesId}/bookings/${bookingId}/arrivals/new`)
      }
    }
  }
}
