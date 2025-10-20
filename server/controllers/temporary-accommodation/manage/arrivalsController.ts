import type { Request, RequestHandler, Response } from 'express'

import type { NewCas3Arrival as NewArrival } from '@approved-premises/api'
import paths from '../../../paths/temporary-accommodation/manage'
import { ArrivalService, BookingService, PremisesService } from '../../../services'
import { generateConflictBespokeError } from '../../../utils/bookingUtils'
import { DateFormats, dateIsInFuture } from '../../../utils/dateUtils'
import extractCallConfig from '../../../utils/restUtils'
import {
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
  insertBespokeError,
  insertGenericError,
} from '../../../utils/validation'
import config from '../../../config'
import BedspaceService from '../../../services/bedspaceService'

export default class ArrivalsController {
  constructor(
    private readonly premisesService: PremisesService,
    private readonly bedspacesService: BedspaceService,
    private readonly bookingsService: BookingService,
    private readonly arrivalService: ArrivalService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, errorTitle, userInput } = fetchErrorsAndUserInput(req)
      const { premisesId, bedspaceId, bookingId } = req.params

      const callConfig = extractCallConfig(req)

      const premises = await this.premisesService.getSinglePremises(callConfig, premisesId)
      const bedspace = await this.bedspacesService.getSingleBedspace(callConfig, premisesId, bedspaceId)
      const booking = await this.bookingsService.getBooking(callConfig, premisesId, bookingId)

      return res.render('temporary-accommodation/arrivals/new', {
        premises,
        bedspace,
        booking,
        errors,
        errorSummary,
        errorTitle,
        ...DateFormats.isoToDateAndTimeInputs(booking.arrivalDate, 'arrivalDate'),
        ...DateFormats.isoToDateAndTimeInputs(booking.departureDate, 'expectedDepartureDate'),
        ...userInput,
        nDeliusUpdateMessage: !config.flags.domainEventsEmit.includes('personArrived'),
      })
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bedspaceId, bookingId } = req.params
      const callConfig = extractCallConfig(req)
      try {
        const newArrival: NewArrival = {
          ...req.body,
          ...DateFormats.dateAndTimeInputsToIsoString(req.body, 'arrivalDate'),
          ...DateFormats.dateAndTimeInputsToIsoString(req.body, 'expectedDepartureDate'),
          type: 'CAS3',
        }

        if (newArrival.arrivalDate && dateIsInFuture(newArrival.arrivalDate)) {
          const error = new Error()
          insertGenericError(error, 'arrivalDate', 'todayOrInThePast')
          throw error
        }

        if (newArrival.arrivalDate) {
          const parsedDepartureDate = DateFormats.isoToDateObj(newArrival.expectedDepartureDate)
          const maxAllowedDate = new Date(newArrival.arrivalDate)
          maxAllowedDate.setDate(maxAllowedDate.getDate() + 84)
          if (parsedDepartureDate > maxAllowedDate) {
            const error = new Error()
            insertGenericError(error, 'expectedDepartureDate', 'exceedsMaxNights')
            throw error
          }
        }

        await this.arrivalService.createArrival(callConfig, premisesId, bookingId, newArrival)

        req.flash('success', {
          title: 'Booking marked as active',
          text: config.flags.domainEventsEmit.includes('personArrived')
            ? 'You no longer need to update NDelius with this change.'
            : 'At the moment the CAS3 digital service does not automatically update NDelius. Please continue to record accommodation and address changes directly in NDelius.',
        })
        res.redirect(paths.bookings.show({ premisesId, bedspaceId, bookingId }))
      } catch (err) {
        if (err.status === 409) {
          insertBespokeError(err, generateConflictBespokeError(err, premisesId, bedspaceId, 'plural'))
          insertGenericError(err, 'arrivalDate', 'conflict')
          insertGenericError(err, 'expectedDepartureDate', 'conflict')
        }

        catchValidationErrorOrPropogate(
          req,
          res,
          err,
          paths.bookings.arrivals.new({ premisesId, bedspaceId, bookingId }),
        )
      }
    }
  }

  edit(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, errorTitle, userInput } = fetchErrorsAndUserInput(req)
      const { premisesId, bedspaceId, bookingId } = req.params

      const callConfig = extractCallConfig(req)

      const [premises, bedspace, booking] = await Promise.all([
        this.premisesService.getSinglePremises(callConfig, premisesId),
        this.bedspacesService.getSingleBedspace(callConfig, premisesId, bedspaceId),
        this.bookingsService.getBooking(callConfig, premisesId, bookingId),
      ])

      return res.render('temporary-accommodation/arrivals/edit', {
        premises,
        bedspace,
        booking,
        errors,
        errorSummary,
        errorTitle,
        notes: booking.arrival?.notes,
        ...userInput,
      })
    }
  }

  update(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, bedspaceId, bookingId } = req.params
      const callConfig = extractCallConfig(req)
      try {
        const booking = await this.bookingsService.getBooking(callConfig, premisesId, bookingId)

        const updateArrival: NewArrival = {
          notes: req.body.notes,
          arrivalDate: DateFormats.dateAndTimeInputsToIsoString(req.body, 'arrivalDate').arrivalDate,
          expectedDepartureDate: booking.departureDate,
          type: 'CAS3',
        }

        if (updateArrival.arrivalDate) {
          if (dateIsInFuture(updateArrival.arrivalDate)) {
            const error = new Error()
            insertGenericError(error, 'arrivalDate', 'todayOrInThePast')
            throw error
          }
        }

        // INFO: this may confuse, the API is overloading the POST with a writeback of existing and new data
        await this.arrivalService.createArrival(callConfig, premisesId, bookingId, updateArrival)
        req.flash('success', 'Arrival updated')
        res.redirect(paths.bookings.show({ premisesId, bedspaceId, bookingId }))
      } catch (err) {
        if (err.status === 409) {
          insertBespokeError(err, generateConflictBespokeError(err, premisesId, bedspaceId, 'singular'))
          insertGenericError(err, 'arrivalDate', 'conflict')
        }

        catchValidationErrorOrPropogate(
          req,
          res,
          err,
          paths.bookings.arrivals.edit({ premisesId, bedspaceId, bookingId }),
        )
      }
    }
  }
}
