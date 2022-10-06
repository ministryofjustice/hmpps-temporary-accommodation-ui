import type { NewBooking } from 'approved-premises'
import type { Request, Response, RequestHandler } from 'express'

import { BookingService, PremisesService, PersonService } from '../../services'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'
import { DateFormats } from '../../utils/dateUtils'

import paths from '../../paths/manage'

export default class BookingsController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly premisesService: PremisesService,
    private readonly personService: PersonService,
  ) {}

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params

      const booking = await this.bookingService.find(req.user.token, premisesId, bookingId)

      return res.render(`bookings/show`, { booking, premisesId, pageHeading: 'Booking details' })
    }
  }

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId } = req.params
      const { errors, errorSummary, userInput } = fetchErrorsAndUserInput(req)

      const crnArr = req.flash('crn')

      if (crnArr.length) {
        const person = await this.personService.findByCrn(req.user.token, crnArr[0])

        return res.render(`bookings/new`, {
          pageHeading: 'Make a booking',
          premisesId,
          ...person,
          errors,
          errorSummary,
          ...userInput,
        })
      }

      return res.render(`bookings/find`, {
        pageHeading: 'Make a booking - find someone by CRN',
        premisesId,
        errors,
        errorSummary,
        ...userInput,
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId } = req.params

      const booking: NewBooking = {
        ...req.body,
        ...DateFormats.convertDateAndTimeInputsToIsoString(req.body, 'arrivalDate'),
        ...DateFormats.convertDateAndTimeInputsToIsoString(req.body, 'departureDate'),
      }

      try {
        const confirmedBooking = await this.bookingService.create(req.user.token, premisesId as string, booking)

        res.redirect(
          paths.bookings.confirm({
            premisesId,
            bookingId: confirmedBooking.id,
          }),
        )
      } catch (err) {
        req.flash('crn', booking.crn)
        catchValidationErrorOrPropogate(req, res, err, paths.bookings.new({ premisesId }))
      }
    }
  }

  confirm(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bookingId } = req.params
      const booking = await this.bookingService.find(req.user.token, premisesId, bookingId)
      const overcapacityMessage = await this.premisesService.getOvercapacityMessage(req.user.token, premisesId)

      return res.render('bookings/confirm', {
        premisesId,
        bookingId,
        pageHeading: 'Booking complete',
        ...booking,
        infoMessages: overcapacityMessage,
      })
    }
  }
}
