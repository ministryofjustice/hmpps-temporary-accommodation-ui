import type { Request, RequestHandler, Response } from 'express'

import type { NewBooking } from '@approved-premises/api'
import { ObjectWithDateParts } from '@approved-premises/ui'
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
import { clearPlaceContext, preservePlaceContext } from '../../../utils/placeUtils'
import extractCallConfig from '../../../utils/restUtils'
import { isApplyEnabledForUser } from '../../../utils/userUtils'
import { appendQueryString } from '../../../utils/utils'
import {
  catchValidationErrorOrPropogate,
  clearUserInput,
  fetchErrorsAndUserInput,
  insertBespokeError,
  insertGenericError,
} from '../../../utils/validation'

export default class BookingsController {
  constructor(
    private readonly premisesService: PremisesService,
    private readonly bedspacesService: BedspaceService,
    private readonly bookingsService: BookingService,
    private readonly personsService: PersonService,
    private readonly assessmentService: AssessmentsService,
  ) {}

  index(): RequestHandler {
    return async (req: Request, res: Response) => {
      return res.redirect(301, paths.bookings.search.provisional.index({}))
    }
  }

  new(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, errorTitle } = fetchErrorsAndUserInput(req)
      const { premisesId, roomId } = req.params

      const callConfig = extractCallConfig(req)

      const placeContext = await preservePlaceContext(req, res, this.assessmentService)
      const arrivalDatePrefill = placeContext?.arrivalDate
        ? DateFormats.isoToDateAndTimeInputs(placeContext.arrivalDate, 'arrivalDate')
        : {}
      const crnPrefill = placeContext ? { crn: placeContext.assessment.application.person.crn } : {}

      const premises = await this.premisesService.getPremises(callConfig, premisesId)
      const room = await this.bedspacesService.getRoom(callConfig, premisesId, roomId)
      const bedspaceStatus = this.bedspacesService.summaryListForBedspaceStatus(room)

      return res.render('temporary-accommodation/bookings/new', {
        premises,
        room,
        bedspaceStatus,
        errors,
        errorSummary,
        errorTitle,
        ...arrivalDatePrefill,
        ...crnPrefill,
        ...req.query,
      })
    }
  }

  selectAssessment(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { errors, errorSummary, errorTitle } = fetchErrorsAndUserInput(req)
      const { premisesId, roomId } = req.params

      const crn = req.query.crn as string

      const { arrivalDate } = DateFormats.dateAndTimeInputsToIsoString(
        req.query as ObjectWithDateParts<'arrivalDate'>,
        'arrivalDate',
      )
      const { departureDate } = DateFormats.dateAndTimeInputsToIsoString(
        req.query as ObjectWithDateParts<'departureDate'>,
        'departureDate',
      )

      const callConfig = extractCallConfig(req)

      let placeContext = await preservePlaceContext(req, res, this.assessmentService)

      if (placeContext && crn !== placeContext.assessment.application.person.crn) {
        clearPlaceContext(req, res)
        placeContext = undefined
      }

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
          } catch (err) {
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
          } catch (err) {
            error = error || new Error()
            insertGenericError(error, 'departureDate', 'invalid')
          }
        }

        if (error) {
          throw error
        }

        const assessmentIdPrefill = placeContext ? { assessmentId: placeContext.assessment.id } : {}

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
          ...assessmentIdPrefill,
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

      let placeContext = await preservePlaceContext(req, res, this.assessmentService)

      if (placeContext && placeContext.assessment.id !== assessmentId) {
        clearPlaceContext(req, res)
        placeContext = undefined
      }

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

      const { assessmentId, crn } = req.body

      const { arrivalDate } = DateFormats.dateAndTimeInputsToIsoString(req.body, 'arrivalDate')
      const { departureDate } = DateFormats.dateAndTimeInputsToIsoString(req.body, 'departureDate')

      const room = await this.bedspacesService.getRoom(callConfig, premisesId, roomId)

      const newBooking: NewBooking = {
        service: 'temporary-accommodation',
        ...req.body,
        crn: crn.trim(),
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
          appendQueryString(paths.bookings.new({ premisesId, roomId }), { ...req.body, _csrf: undefined }),
        )
      }
    }
  }

  show(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { premisesId, roomId, bookingId } = req.params
      const callConfig = extractCallConfig(req)

      await preservePlaceContext(req, res, this.assessmentService)

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

      await preservePlaceContext(req, res, this.assessmentService)

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
