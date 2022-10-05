import type { Response, Request, RequestHandler } from 'express'
import type { Arrival, NewArrival } from 'approved-premises'

import { DateFormats } from '../../utils/dateUtils'
import ArrivalService from '../../services/arrivalService'
import PremisesService from '../../services/premisesService'

import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'
import paths from '../../paths/manage'

export default class ArrivalsController {
  constructor(private readonly arrivalService: ArrivalService, private readonly premisesService: PremisesService) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const staffMembers = await this.premisesService.getStaffMembers(req.user.token, premisesId)

      res.render('arrivals/new', {
        premisesId,
        bookingId,
        errors,
        errorSummary,
        staffMembers,
        pageHeading: 'Did the resident arrive?',
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params
      const body = req.body as NewArrival

      const { date } = DateFormats.convertDateAndTimeInputsToIsoString(body, 'date')
      const { expectedDepartureDate } = DateFormats.convertDateAndTimeInputsToIsoString(body, 'expectedDepartureDate')

      const arrival: Omit<Arrival, 'id' | 'bookingId'> = {
        ...body.arrival,
        date,
        expectedDepartureDate,
      }

      try {
        await this.arrivalService.createArrival(req.user.token, premisesId, bookingId, arrival)

        req.flash('success', 'Arrival logged')
        res.redirect(paths.premises.show({ premisesId }))
      } catch (err) {
        catchValidationErrorOrPropogate(req, res, err, paths.bookings.arrivals.new({ bookingId, premisesId }))
      }
    }
  }
}
