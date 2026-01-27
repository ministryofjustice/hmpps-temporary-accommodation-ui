import type { Request, RequestHandler, Response } from 'express'
import type { Cas3NewDeparture } from '@approved-premises/api'
import { format as urlFormat } from 'url'
import paths from '../../../paths/temporary-accommodation/manage'
import { BookingService, DepartureService, PremisesService } from '../../../services'
import BedspaceService from '../../../services/bedspaceService'
import { DateFormats, nightsBetween } from '../../../utils/dateUtils'
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

      const newDeparture: Cas3NewDeparture = {
        ...req.body,
        ...DateFormats.dateAndTimeInputsToIsoString({ ...req.body }, 'dateTime', { representation: 'complete' }),
      }

      try {
        if (!newDeparture.dateTime || !newDeparture.reasonId || !newDeparture.moveOnCategoryId) {
          const error = new Error()
          if (!newDeparture.dateTime) {
            insertGenericError(error, 'dateTime', 'empty')
          }
          if (!newDeparture.reasonId) {
            insertGenericError(error, 'reasonId', 'empty')
          }
          if (!newDeparture.moveOnCategoryId) {
            insertGenericError(error, 'moveOnCategoryId', 'empty')
          }
          throw error
        }

        if (DateFormats.isoToDateObj(newDeparture.dateTime) > new Date()) {
          const error = new Error()
          insertGenericError(error, 'dateTime', 'departureDateInFuture')
          throw error
        }

        if (config.flags.bookingOverstayEnabled && newDeparture.dateTime) {
          const booking = await this.bookingsService.getBooking(callConfig, premisesId, bookingId)

          const newDepartureDate = DateFormats.dateObjToIsoDate(DateFormats.isoToDateObj(newDeparture.dateTime))
          const lengthOfStay = nightsBetween(booking.arrivalDate, newDepartureDate)

          if (lengthOfStay >= 84) {
            const address = urlFormat({
              pathname: paths.bookings.overstays.new({ premisesId, bedspaceId, bookingId }),
              query: { newDepartureDate },
            })

            req.session.departure = newDeparture
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

      const newDeparture: Cas3NewDeparture = {
        ...req.body,
        ...DateFormats.dateAndTimeInputsToIsoString({ ...req.body }, 'dateTime', { representation: 'complete' }),
      }

      try {
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
}
