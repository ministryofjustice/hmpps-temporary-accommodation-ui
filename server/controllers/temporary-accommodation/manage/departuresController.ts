import type { Request, RequestHandler, Response } from 'express'
import type { NewDeparture } from '@approved-premises/api'
import paths from '../../../paths/temporary-accommodation/manage'
import { BedspaceService, BookingService, DepartureService, PremisesService } from '../../../services'
import { DateFormats } from '../../../utils/dateUtils'
import extractCallConfig from '../../../utils/restUtils'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput, insertGenericError } from '../../../utils/validation'
import config from '../../../config'

export default class DeparturesController {
  constructor(
    private readonly premisesService: PremisesService,
    private readonly bedspacesService: BedspaceService,
    private readonly bookingsService: BookingService,
    private readonly departureService: DepartureService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary: requestErrorSummary, userInput } = fetchErrorsAndUserInput(req)
      const { premisesId, roomId, bookingId } = req.params

      const callConfig = extractCallConfig(req)

      const premises = await this.premisesService.getPremises(callConfig, premisesId)
      const room = await this.bedspacesService.getRoom(callConfig, premisesId, roomId)
      const booking = await this.bookingsService.getBooking(callConfig, premisesId, bookingId)

      const { departureReasons: allDepartureReasons, moveOnCategories: allMoveOnCategories } =
        await this.departureService.getReferenceData(callConfig)

      return res.render('temporary-accommodation/departures/new', {
        premises,
        room,
        booking,
        allDepartureReasons,
        allMoveOnCategories,
        errors,
        errorSummary: requestErrorSummary,
        ...userInput,
        nDeliusUpdateMessage: !config.flags.domainEventsEmit.includes('personDeparted'),
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, roomId, bookingId } = req.params
      const callConfig = extractCallConfig(req)

      const newDeparture: NewDeparture = {
        ...req.body,
        ...DateFormats.dateAndTimeInputsToIsoString({ ...req.body }, 'dateTime', { representation: 'complete' }),
      }

      try {
        await this.departureService.createDeparture(callConfig, premisesId, bookingId, newDeparture)

        if(DateFormats.isoToDateObj(newDeparture.dateTime) > new Date()) {
          const error = new Error()
          insertGenericError(error, 'dateTime', "departureDateInFuture")
          throw error 
        }

        req.flash('success', {
          title: 'Booking marked as departed',
          text: config.flags.domainEventsEmit.includes('personDeparted')
            ? 'You no longer need to update NDelius with this change.'
            : 'At the moment the CAS3 digital service does not automatically update NDelius. Please continue to record accommodation and address changes directly in NDelius.',
        })
        res.redirect(paths.bookings.show({ premisesId, roomId, bookingId }))
      } catch (err) {
        catchValidationErrorOrPropogate(req, res, err, paths.bookings.departures.new({ premisesId, roomId, bookingId }))
      }
    }
  }

  edit(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary: requestErrorSummary, userInput } = fetchErrorsAndUserInput(req)
      const { premisesId, roomId, bookingId } = req.params

      const callConfig = extractCallConfig(req)

      const premises = await this.premisesService.getPremises(callConfig, premisesId)
      const room = await this.bedspacesService.getRoom(callConfig, premisesId, roomId)
      const booking = await this.bookingsService.getBooking(callConfig, premisesId, bookingId)

      const { departureReasons: allDepartureReasons, moveOnCategories: allMoveOnCategories } =
        await this.departureService.getReferenceData(callConfig)

      return res.render('temporary-accommodation/departures/edit', {
        premises,
        room,
        booking,
        allDepartureReasons,
        allMoveOnCategories,
        errors,
        errorSummary: requestErrorSummary,
        ...DateFormats.isoToDateAndTimeInputs(booking.departure.dateTime, 'dateTime'),
        reasonId: booking.departure.reason.id,
        moveOnCategoryId: booking.departure.moveOnCategory.id,
        notes: booking.departure.notes,
        ...userInput,
      })
    }
  }

  update(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, roomId, bookingId } = req.params
      const callConfig = extractCallConfig(req)

      const newDeparture: NewDeparture = {
        ...req.body,
        ...DateFormats.dateAndTimeInputsToIsoString({ ...req.body }, 'dateTime', { representation: 'complete' }),
      }

      try {
        await this.departureService.createDeparture(callConfig, premisesId, bookingId, newDeparture)

        req.flash('success', 'Departure details changed')
        res.redirect(paths.bookings.show({ premisesId, roomId, bookingId }))
      } catch (err) {
        catchValidationErrorOrPropogate(
          req,
          res,
          err,
          paths.bookings.departures.edit({ premisesId, roomId, bookingId }),
        )
      }
    }
  }
}
