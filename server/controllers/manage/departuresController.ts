import type { Response, Request, RequestHandler } from 'express'
import type { NewDeparture } from '@approved-premises/api'

import { DateFormats } from '../../utils/dateUtils'
import DepartureService from '../../services/departureService'

import BookingService from '../../services/bookingService'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'
import paths from '../../paths/manage'

export default class DeparturesController {
  constructor(private readonly departureService: DepartureService, private readonly bookingService: BookingService) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const booking = await this.bookingService.find(req.user.token, premisesId, bookingId)
      const referenceData = await this.departureService.getReferenceData(req.user.token)

      res.render('departures/new', {
        premisesId,
        booking,
        referenceData,
        pageHeading: 'Log a departure',
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params
      const { dateTime } = DateFormats.convertDateAndTimeInputsToIsoString(req.body, 'dateTime')

      const departure = {
        ...req.body.departure,
        dateTime,
      } as NewDeparture

      try {
        const { id } = await this.departureService.createDeparture(req.user.token, premisesId, bookingId, departure)
        res.redirect(
          paths.bookings.departures.confirm({
            premisesId,
            bookingId,
            departureId: id,
          }),
        )
      } catch (err) {
        catchValidationErrorOrPropogate(
          req,
          res,
          err,
          paths.bookings.departures.new({
            premisesId,
            bookingId,
          }),
        )
      }
    }
  }

  confirm(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId, departureId } = req.params

      const booking = await this.bookingService.find(req.user.token, premisesId, bookingId)
      const departure = await this.departureService.getDeparture(req.user.token, premisesId, bookingId, departureId)

      return res.render(`departures/confirm`, {
        ...departure,
        premisesId,
        bookingId,
        pageHeading: 'Departure confirmed',
        name: booking.person.name,
        crn: booking.person.crn,
      })
    }
  }
}
