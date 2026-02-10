import type { Request, RequestHandler, Response } from 'express'
import { format as urlFormat } from 'url'
import paths from '../../../paths/temporary-accommodation/manage'
import { BookingService, DepartureService, PremisesService } from '../../../services'
import BedspaceService from '../../../services/bedspaceService'
import {
  dateAndTimeInputsAreValidDates,
  DateFormats,
  dateIsBlank,
  dateIsInFuture,
  nightsBetween,
} from '../../../utils/dateUtils'
import extractCallConfig from '../../../utils/restUtils'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput, insertGenericError } from '../../../utils/validation'
import config from '../../../config'
import { SanitisedError } from '../../../sanitisedError'

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
      const { premisesId, bedspaceId, bookingId } = req.params

      const callConfig = extractCallConfig(req)

      const premises = await this.premisesService.getSinglePremises(callConfig, premisesId)
      const bedspace = await this.bedspacesService.getSingleBedspace(callConfig, premisesId, bedspaceId)
      const booking = await this.bookingsService.getBooking(callConfig, premisesId, bookingId)

      const { departureReasons: allDepartureReasons, moveOnCategories: allMoveOnCategories } =
        await this.departureService.getReferenceData(callConfig)

      return res.render('temporary-accommodation/departures/new', {
        premises,
        bedspace,
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
      const { premisesId, bedspaceId, bookingId } = req.params
      const callConfig = extractCallConfig(req)

      try {
        this.validateNewDeparture(req)

        const newDeparture = {
          ...req.body,
          ...DateFormats.dateAndTimeInputsToIsoString({ ...req.body }, 'dateTime', { representation: 'complete' }),
        }

        if (config.flags.bookingOverstayEnabled) {
          const booking = await this.bookingsService.getBooking(callConfig, premisesId, bookingId)

          const newDepartureDate = DateFormats.dateObjToIsoDate(DateFormats.isoToDateObj(newDeparture.dateTime))
          const lengthOfStay = nightsBetween(booking.arrivalDate, newDepartureDate)

          if (lengthOfStay >= 84) {
            const address = urlFormat({
              pathname: paths.bookings.overstays.new({ premisesId, bedspaceId, bookingId }),
              query: { newDepartureDate },
            })

            req.session.departure = newDeparture
            req.session.previousPage = paths.bookings.departures.new({ premisesId, bedspaceId, bookingId })
            res.redirect(address)
            return
          }
        }

        await this.departureService.createDeparture(callConfig, premisesId, bookingId, newDeparture)

        req.flash('success', {
          title: 'Booking marked as departed',
          text: config.flags.domainEventsEmit.includes('personDeparted')
            ? 'You no longer need to update NDelius with this change.'
            : 'At the moment the CAS3 digital service does not automatically update NDelius. Please continue to record accommodation and address changes directly in NDelius.',
        })
        res.redirect(paths.bookings.show({ premisesId, bedspaceId, bookingId }))
      } catch (err) {
        catchValidationErrorOrPropogate(
          req,
          res,
          err,
          paths.bookings.departures.new({ premisesId, bedspaceId, bookingId }),
        )
      }
    }
  }

  edit(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary: requestErrorSummary, userInput } = fetchErrorsAndUserInput(req)
      const { premisesId, bedspaceId, bookingId } = req.params

      const callConfig = extractCallConfig(req)

      const premises = await this.premisesService.getSinglePremises(callConfig, premisesId)
      const bedspace = await this.bedspacesService.getSingleBedspace(callConfig, premisesId, bedspaceId)
      const booking = await this.bookingsService.getBooking(callConfig, premisesId, bookingId)

      const { departureReasons: allDepartureReasons, moveOnCategories: allMoveOnCategories } =
        await this.departureService.getReferenceData(callConfig)

      return res.render('temporary-accommodation/departures/edit', {
        premises,
        bedspace,
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
      const { premisesId, bedspaceId, bookingId } = req.params
      const callConfig = extractCallConfig(req)

      try {
        this.validateNewDeparture(req)

        const newDeparture = {
          ...req.body,
          ...DateFormats.dateAndTimeInputsToIsoString({ ...req.body }, 'dateTime', { representation: 'complete' }),
        }

        if (config.flags.bookingOverstayEnabled) {
          const booking = await this.bookingsService.getBooking(callConfig, premisesId, bookingId)

          const newDepartureDate = DateFormats.dateObjToIsoDate(DateFormats.isoToDateObj(newDeparture.dateTime))
          const lengthOfStay = nightsBetween(booking.arrivalDate, newDepartureDate)

          if (lengthOfStay >= 84) {
            const address = urlFormat({
              pathname: paths.bookings.overstays.new({ premisesId, bedspaceId, bookingId }),
              query: { newDepartureDate },
            })

            req.session.departure = newDeparture
            req.session.previousPage = paths.bookings.departures.edit({ premisesId, bedspaceId, bookingId })
            res.redirect(address)
            return
          }
        }

        await this.departureService.createDeparture(callConfig, premisesId, bookingId, newDeparture)

        req.flash('success', 'Departure details changed')
        res.redirect(paths.bookings.show({ premisesId, bedspaceId, bookingId }))
      } catch (err) {
        catchValidationErrorOrPropogate(
          req,
          res,
          err,
          paths.bookings.departures.edit({ premisesId, bedspaceId, bookingId }),
        )
      }
    }
  }

  private validateNewDeparture(req: Request): void {
    const error = new Error()

    if (dateIsBlank(req.body, 'dateTime')) {
      insertGenericError(error, 'dateTime', 'empty')
    } else if (!dateAndTimeInputsAreValidDates(req.body, 'dateTime')) {
      insertGenericError(error, 'dateTime', 'invalidDate')
    } else if (dateIsInFuture(req.body.dateTime)) {
      insertGenericError(error, 'dateTime', 'departureDateInFuture')
    }

    if (!req.body.reasonId) {
      insertGenericError(error, 'reasonId', 'empty')
    }

    if (!req.body.moveOnCategoryId) {
      insertGenericError(error, 'moveOnCategoryId', 'empty')
    }

    if ((error as SanitisedError).data) {
      throw error
    }
  }
}
