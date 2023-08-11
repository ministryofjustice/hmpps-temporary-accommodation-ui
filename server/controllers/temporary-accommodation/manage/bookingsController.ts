import type { Request, RequestHandler, Response } from 'express'

import type { NewBooking } from '@approved-premises/api'
import paths from '../../../paths/temporary-accommodation/manage'
import { AssessmentsService, BookingService, PersonService, PremisesService } from '../../../services'
import BedspaceService from '../../../services/bedspaceService'
import {
  assessmentRadioItems,
  bookingActions,
  deriveBookingHistory,
  generateConflictBespokeError,
  noAssessmentId,
} from '../../../utils/bookingUtils'
import { DateFormats } from '../../../utils/dateUtils'
import extractCallConfig from '../../../utils/restUtils'
import { appendQueryString } from '../../../utils/utils'
import {
  catchValidationErrorOrPropogate,
  clearUserInput,
  fetchErrorsAndUserInput,
  insertBespokeError,
  insertGenericError,
} from '../../../utils/validation'
import { isApplyEnabledForUser } from '../../../utils/userUtils'

export default class BookingsController {
  constructor(
    private readonly premisesService: PremisesService,
    private readonly bedspacesService: BedspaceService,
    private readonly bookingsService: BookingService,
    private readonly personsService: PersonService,
    private readonly assessmentService: AssessmentsService,
  ) {}

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, errorTitle } = fetchErrorsAndUserInput(req)
      const { premisesId, roomId } = req.params

      const callConfig = extractCallConfig(req)

      const premises = await this.premisesService.getPremises(callConfig, premisesId)
      const room = await this.bedspacesService.getRoom(callConfig, premisesId, roomId)

      return res.render('temporary-accommodation/bookings/new', {
        premises,
        room,
        errors,
        errorSummary,
        errorTitle,
        ...req.query,
      })
    }
  }

  selectAssessment(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, errorTitle } = fetchErrorsAndUserInput(req)
      const { premisesId, roomId } = req.params

      const crn: string = req.query.crn as string

      const { arrivalDate } = DateFormats.dateAndTimeInputsToIsoString(req.query, 'arrivalDate')
      const { departureDate } = DateFormats.dateAndTimeInputsToIsoString(req.query, 'departureDate')

      const callConfig = extractCallConfig(req)

      const backLink = appendQueryString(paths.bookings.new({ premisesId, roomId }), req.query)
      const applyDisabled = !isApplyEnabledForUser(res.locals.user)

      try {
        let error: Error

        if (!crn) {
          error = error || new Error()
          insertGenericError(error, 'crn', 'empty')
        }

        if (!arrivalDate) {
          error = error || new Error()
          insertGenericError(error, 'arrivalDate', 'empty')
        } else {
          try {
            DateFormats.isoToDateObj(arrivalDate)
          } catch (er) {
            error = error || new Error()
            insertGenericError(error, 'arrivalDate', 'invalid')
          }
        }
        if (!departureDate) {
          error = error || new Error()
          insertGenericError(error, 'departureDate', 'empty')
        } else {
          try {
            DateFormats.isoToDateObj(departureDate)
          } catch (er) {
            error = error || new Error()
            insertGenericError(error, 'departureDate', 'invalid')
          }
        }

        if (error) {
          throw error
        }

        await this.personsService.findByCrn(callConfig, crn)
        const assessments = await this.assessmentService.getReadyToPlaceForCrn(callConfig, crn)

        return res.render('temporary-accommodation/bookings/selectAssessment', {
          premisesId,
          roomId,
          assessmentRadioItems: assessmentRadioItems(assessments),
          applyDisabled,
          forceAssessmentId: assessments.length && !applyDisabled ? undefined : noAssessmentId,
          backLink,
          errors,
          errorSummary,
          errorTitle,
          ...req.query,
        })
      } catch (err) {
        if (err.status === 404) {
          insertGenericError(err, 'crn', 'doesNotExist')
        } else if (err.status === 403) {
          insertGenericError(err, 'crn', 'userPermission')
        }

        return catchValidationErrorOrPropogate(req, res, err, backLink)
      }
    }
  }

  confirm(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, roomId } = req.params

      const crn: string = req.query.crn as string
      const { assessmentId } = req.query

      const callConfig = extractCallConfig(req)

      const premises = await this.premisesService.getPremises(callConfig, premisesId)
      const room = await this.bedspacesService.getRoom(callConfig, premisesId, roomId)

      const backLink = appendQueryString(
        paths.bookings.selectAssessment({ premisesId: premises.id, roomId: room.id }),
        req.query,
      )

      try {
        if (!assessmentId) {
          const error = new Error()
          insertGenericError(error, 'assessmentId', 'empty')

          return catchValidationErrorOrPropogate(req, res, error, backLink)
        }

        const person = await this.personsService.findByCrn(callConfig, crn)

        return res.render('temporary-accommodation/bookings/confirm', {
          premises,
          room,
          person,
          ...req.query,
          backLink,
        })
      } catch (err) {
        if (err.status === 404) {
          insertGenericError(err, 'crn', 'doesNotExist')
        } else if (err.status === 403) {
          insertGenericError(err, 'crn', 'userPermission')
        }

        return catchValidationErrorOrPropogate(
          req,
          res,
          err,
          appendQueryString(paths.bookings.new({ premisesId: premises.id, roomId: room.id }), req.query),
        )
      }
    }
  }

  create(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, roomId } = req.params
      const callConfig = extractCallConfig(req)

      const { assessmentId } = req.body

      const { arrivalDate } = DateFormats.dateAndTimeInputsToIsoString(req.body, 'arrivalDate')
      const { departureDate } = DateFormats.dateAndTimeInputsToIsoString(req.body, 'departureDate')

      const room = await this.bedspacesService.getRoom(callConfig, premisesId, roomId)

      const newBooking: NewBooking = {
        service: 'temporary-accommodation',
        ...req.body,
        assessmentId: assessmentId === noAssessmentId ? undefined : assessmentId,
        arrivalDate,
        departureDate,
      }

      try {
        const booking = await this.bookingsService.createForBedspace(callConfig, premisesId, room, newBooking)

        req.flash('success', 'Booking created')
        clearUserInput(req)

        res.redirect(paths.bookings.show({ premisesId, roomId, bookingId: booking.id }))
      } catch (err) {
        if (err.status === 409) {
          insertBespokeError(err, generateConflictBespokeError(err, premisesId, roomId, 'plural'))
          insertGenericError(err, 'arrivalDate', 'conflict')
          insertGenericError(err, 'departureDate', 'conflict')
        } else if (err.status === 403) {
          insertGenericError(err, 'crn', 'userPermission')
        }

        catchValidationErrorOrPropogate(
          req,
          res,
          err,
          appendQueryString(paths.bookings.new({ premisesId, roomId }), req.body),
        )
      }
    }
  }

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, roomId, bookingId } = req.params
      const callConfig = extractCallConfig(req)

      const premises = await this.premisesService.getPremises(callConfig, premisesId)
      const room = await this.bedspacesService.getRoom(callConfig, premisesId, roomId)

      const booking = await this.bookingsService.getBooking(callConfig, premisesId, bookingId)

      return res.render('temporary-accommodation/bookings/show', {
        premises,
        room,
        booking,
        actions: bookingActions(premisesId, roomId, booking),
      })
    }
  }

  history(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, roomId, bookingId } = req.params
      const callConfig = extractCallConfig(req)

      const premises = await this.premisesService.getPremises(callConfig, premisesId)
      const room = await this.bedspacesService.getRoom(callConfig, premisesId, roomId)

      const booking = await this.bookingsService.getBooking(callConfig, premisesId, bookingId)

      return res.render('temporary-accommodation/bookings/history', {
        premises,
        room,
        booking,
        history: deriveBookingHistory(booking).map(({ booking: historicBooking, updatedAt }) => ({
          booking: historicBooking,
          updatedAt: DateFormats.isoDateToUIDate(updatedAt, { format: 'short' }),
        })),
      })
    }
  }
}
