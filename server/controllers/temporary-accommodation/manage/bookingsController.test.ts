import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { BespokeError } from '../../../@types/ui'
import config from '../../../config'
import { CallConfig } from '../../../data/restClient'
import paths from '../../../paths/temporary-accommodation/manage'
import { AssessmentsService, BookingService, PersonService, PremisesService } from '../../../services'
import BedspaceService from '../../../services/bedspaceService'
import {
  assessmentSummaryFactory,
  bookingFactory,
  newBookingFactory,
  personFactory,
  premisesFactory,
  roomFactory,
} from '../../../testutils/factories'
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
  fetchErrorsAndUserInput,
  insertBespokeError,
  insertGenericError,
} from '../../../utils/validation'
import BookingsController from './bookingsController'

jest.mock('../../../utils/bookingUtils')
jest.mock('../../../utils/restUtils')
jest.mock('../../../utils/validation')
jest.mock('../../../utils/utils')

describe('BookingsController', () => {
  const callConfig = { token: 'some-call-config-token' } as CallConfig
  const premisesId = 'premisesId'
  const roomId = 'roomId'
  const backLink = 'some-back-link'
  const assessmentId = 'some-assessment-id'
  const radioItems = [{ text: 'Some text', value: 'some-value' }]

  let request: Request

  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const premisesService = createMock<PremisesService>({})
  const bedspaceService = createMock<BedspaceService>({})
  const bookingService = createMock<BookingService>({})
  const personService = createMock<PersonService>({})
  const assessmentService = createMock<AssessmentsService>({})

  const bookingsController = new BookingsController(
    premisesService,
    bedspaceService,
    bookingService,
    personService,
    assessmentService,
  )

  beforeEach(() => {
    request = createMock<Request>()
    ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)
    config.flags.applyDisabled = false
  })

  describe('new', () => {
    it('renders the form', async () => {
      request.params = {
        premisesId,
        roomId,
      }
      request.query = {
        crn: 'some-crn',
      }

      const premises = premisesFactory.build()
      const room = roomFactory.build()

      premisesService.getPremises.mockResolvedValue(premises)
      bedspaceService.getRoom.mockResolvedValue(room)

      const requestHandler = bookingsController.new()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [] })

      await requestHandler(request, response, next)

      expect(premisesService.getPremises).toHaveBeenCalledWith(callConfig, premisesId)
      expect(bedspaceService.getRoom).toHaveBeenCalledWith(callConfig, premisesId, roomId)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/bookings/new', {
        premises,
        room,
        errors: {},
        errorSummary: [],
        crn: 'some-crn',
      })
    })
  })

  describe('selectAssessment', () => {
    it('renders the select assessment page', async () => {
      const newBooking = newBookingFactory.build()
      const person = personFactory.build()
      const assessmentSummaries = assessmentSummaryFactory.buildList(5)

      request.params = {
        premisesId,
        roomId,
      }
      request.query = {
        crn: newBooking.crn,
        ...DateFormats.isoToDateAndTimeInputs(newBooking.arrivalDate, 'arrivalDate'),
        ...DateFormats.isoToDateAndTimeInputs(newBooking.departureDate, 'departureDate'),
      }

      personService.findByCrn.mockResolvedValue(person)
      assessmentService.getReadyToPlaceForCrn.mockResolvedValue(assessmentSummaries)
      ;(assessmentRadioItems as jest.MockedFunction<typeof assessmentRadioItems>).mockReturnValue(radioItems)
      ;(appendQueryString as jest.MockedFunction<typeof appendQueryString>).mockReturnValue(backLink)

      const requestHandler = bookingsController.selectAssessment()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [] })

      await requestHandler(request, response, next)

      expect(assessmentService.getReadyToPlaceForCrn).toHaveBeenCalledWith(callConfig, newBooking.crn)
      expect(personService.findByCrn).toHaveBeenCalledWith(callConfig, newBooking.crn)
      expect(assessmentRadioItems).toHaveBeenCalledWith(assessmentSummaries)
      expect(appendQueryString).toHaveBeenCalledWith(paths.bookings.new({ premisesId, roomId }), request.query)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/bookings/selectAssessment', {
        premisesId,
        roomId,
        assessmentRadioItems: radioItems,
        crn: newBooking.crn,
        ...DateFormats.isoToDateAndTimeInputs(newBooking.arrivalDate, 'arrivalDate'),
        ...DateFormats.isoToDateAndTimeInputs(newBooking.departureDate, 'departureDate'),
        errors: {},
        errorSummary: [],
        backLink,
      })
    })

    it('renders the select with a "no assessment" assessment ID if there are no assessments for the given CRN', async () => {
      const newBooking = newBookingFactory.build()
      const person = personFactory.build()
      const assessmentSummaries = assessmentSummaryFactory.buildList(5)

      config.flags.applyDisabled = true

      request.params = {
        premisesId,
        roomId,
      }
      request.query = {
        crn: newBooking.crn,
        ...DateFormats.isoToDateAndTimeInputs(newBooking.arrivalDate, 'arrivalDate'),
        ...DateFormats.isoToDateAndTimeInputs(newBooking.departureDate, 'departureDate'),
      }

      personService.findByCrn.mockResolvedValue(person)
      assessmentService.getReadyToPlaceForCrn.mockResolvedValue(assessmentSummaries)
      ;(assessmentRadioItems as jest.MockedFunction<typeof assessmentRadioItems>).mockReturnValue(radioItems)
      ;(appendQueryString as jest.MockedFunction<typeof appendQueryString>).mockReturnValue(backLink)

      const requestHandler = bookingsController.selectAssessment()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [] })

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/bookings/selectAssessment', {
        premisesId,
        roomId,
        assessmentRadioItems: radioItems,
        crn: newBooking.crn,
        ...DateFormats.isoToDateAndTimeInputs(newBooking.arrivalDate, 'arrivalDate'),
        ...DateFormats.isoToDateAndTimeInputs(newBooking.departureDate, 'departureDate'),
        forceAssessmentId: noAssessmentId,
        errors: {},
        errorSummary: [],
        backLink,
      })
    })

    it('renders the select with a "no assessment" assessment ID if the Apply feature is disabled', async () => {
      const newBooking = newBookingFactory.build()
      const person = personFactory.build()

      request.params = {
        premisesId,
        roomId,
      }
      request.query = {
        crn: newBooking.crn,
        ...DateFormats.isoToDateAndTimeInputs(newBooking.arrivalDate, 'arrivalDate'),
        ...DateFormats.isoToDateAndTimeInputs(newBooking.departureDate, 'departureDate'),
      }

      personService.findByCrn.mockResolvedValue(person)
      assessmentService.getReadyToPlaceForCrn.mockResolvedValue([])
      ;(assessmentRadioItems as jest.MockedFunction<typeof assessmentRadioItems>).mockReturnValue(radioItems)
      ;(appendQueryString as jest.MockedFunction<typeof appendQueryString>).mockReturnValue(backLink)

      const requestHandler = bookingsController.selectAssessment()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [] })

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/bookings/selectAssessment', {
        premisesId,
        roomId,
        assessmentRadioItems: radioItems,
        crn: newBooking.crn,
        ...DateFormats.isoToDateAndTimeInputs(newBooking.arrivalDate, 'arrivalDate'),
        ...DateFormats.isoToDateAndTimeInputs(newBooking.departureDate, 'departureDate'),
        forceAssessmentId: noAssessmentId,
        errors: {},
        errorSummary: [],
        backLink,
      })
    })

    it('renders with an error if the API returns a 404 person not found status', async () => {
      const newBooking = newBookingFactory.build()

      request.params = {
        premisesId,
        roomId,
      }
      request.query = {
        crn: newBooking.crn,
        ...DateFormats.isoToDateAndTimeInputs(newBooking.arrivalDate, 'arrivalDate'),
        ...DateFormats.isoToDateAndTimeInputs(newBooking.departureDate, 'departureDate'),
      }

      const err = { status: 404 }
      personService.findByCrn.mockImplementation(() => {
        throw err
      })
      ;(appendQueryString as jest.MockedFunction<typeof appendQueryString>).mockReturnValue(backLink)

      const requestHandler = bookingsController.selectAssessment()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [] })

      await requestHandler(request, response, next)

      expect(appendQueryString).toHaveBeenCalledWith(paths.bookings.new({ premisesId, roomId }), request.query)
      expect(insertGenericError).toHaveBeenCalledWith(err, 'crn', 'doesNotExist')
      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(request, response, err, backLink)
    })

    it('renders with an error if the API returns a 403 forbidden status', async () => {
      const newBooking = newBookingFactory.build()

      request.params = {
        premisesId,
        roomId,
      }
      request.query = {
        crn: newBooking.crn,
        ...DateFormats.isoToDateAndTimeInputs(newBooking.arrivalDate, 'arrivalDate'),
        ...DateFormats.isoToDateAndTimeInputs(newBooking.departureDate, 'departureDate'),
      }

      const err = { status: 403 }
      personService.findByCrn.mockImplementation(() => {
        throw err
      })
      ;(appendQueryString as jest.MockedFunction<typeof appendQueryString>).mockReturnValue(backLink)

      const requestHandler = bookingsController.selectAssessment()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [] })

      await requestHandler(request, response, next)

      expect(appendQueryString).toHaveBeenCalledWith(paths.bookings.new({ premisesId, roomId }), request.query)
      expect(insertGenericError).toHaveBeenCalledWith(err, 'crn', 'userPermission')
      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(request, response, err, backLink)
    })
  })

  describe('confirm', () => {
    it('renders the confirmation page', async () => {
      const newBooking = newBookingFactory.build()
      const premises = premisesFactory.build()
      const room = roomFactory.build()
      const person = personFactory.build()

      request.params = {
        premisesId,
        roomId,
      }
      request.query = {
        crn: newBooking.crn,
        ...DateFormats.isoToDateAndTimeInputs(newBooking.arrivalDate, 'arrivalDate'),
        ...DateFormats.isoToDateAndTimeInputs(newBooking.departureDate, 'departureDate'),
        assessmentId,
      }

      premisesService.getPremises.mockResolvedValue(premises)
      bedspaceService.getRoom.mockResolvedValue(room)
      personService.findByCrn.mockResolvedValue(person)
      ;(appendQueryString as jest.MockedFunction<typeof appendQueryString>).mockReturnValue(backLink)

      const requestHandler = bookingsController.confirm()

      await requestHandler(request, response, next)

      expect(premisesService.getPremises).toHaveBeenCalledWith(callConfig, premisesId)
      expect(bedspaceService.getRoom).toHaveBeenCalledWith(callConfig, premisesId, roomId)
      expect(appendQueryString).toHaveBeenCalledWith(
        paths.bookings.selectAssessment({ premisesId: premises.id, roomId: room.id }),
        request.query,
      )

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/bookings/confirm', {
        premises,
        room,
        person,
        crn: newBooking.crn,
        ...DateFormats.isoToDateAndTimeInputs(newBooking.arrivalDate, 'arrivalDate'),
        ...DateFormats.isoToDateAndTimeInputs(newBooking.departureDate, 'departureDate'),
        assessmentId,
        backLink,
      })
    })

    it('renders with an error if the API returns a 404 person not found status', async () => {
      request.query = {
        crn: 'some-crn',
        assessmentId,
      }

      const requestHandler = bookingsController.confirm()

      const premises = premisesFactory.build()
      const room = roomFactory.build()

      premisesService.getPremises.mockResolvedValue(premises)
      bedspaceService.getRoom.mockResolvedValue(room)
      ;(appendQueryString as jest.MockedFunction<typeof appendQueryString>).mockReturnValue(backLink)

      const err = { status: 404 }
      personService.findByCrn.mockImplementation(() => {
        throw err
      })

      await requestHandler(request, response, next)

      expect(appendQueryString).toHaveBeenCalledWith(
        paths.bookings.new({ premisesId: premises.id, roomId: room.id }),
        request.query,
      )
      expect(insertGenericError).toHaveBeenCalledWith(err, 'crn', 'doesNotExist')
      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(request, response, err, backLink)
    })

    it('renders with an error if the API returns a 403 forbidden status', async () => {
      request.query = {
        crn: 'some-crn',
        assessmentId,
      }

      const requestHandler = bookingsController.confirm()

      const premises = premisesFactory.build()
      const room = roomFactory.build()

      premisesService.getPremises.mockResolvedValue(premises)
      bedspaceService.getRoom.mockResolvedValue(room)
      ;(appendQueryString as jest.MockedFunction<typeof appendQueryString>).mockReturnValue(backLink)

      const err = { status: 403 }
      personService.findByCrn.mockImplementation(() => {
        throw err
      })

      await requestHandler(request, response, next)

      expect(appendQueryString).toHaveBeenCalledWith(
        paths.bookings.new({ premisesId: premises.id, roomId: room.id }),
        request.query,
      )
      expect(insertGenericError).toHaveBeenCalledWith(err, 'crn', 'userPermission')
      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(request, response, err, backLink)
    })

    it('renders with an error if no assessment ID is provided', async () => {
      const newBooking = newBookingFactory.build()
      const premises = premisesFactory.build()
      const room = roomFactory.build()
      const person = personFactory.build()

      request.params = {
        premisesId,
        roomId,
      }
      request.query = {
        crn: newBooking.crn,
        ...DateFormats.isoToDateAndTimeInputs(newBooking.arrivalDate, 'arrivalDate'),
        ...DateFormats.isoToDateAndTimeInputs(newBooking.departureDate, 'departureDate'),
      }

      premisesService.getPremises.mockResolvedValue(premises)
      bedspaceService.getRoom.mockResolvedValue(room)
      personService.findByCrn.mockResolvedValue(person)
      ;(appendQueryString as jest.MockedFunction<typeof appendQueryString>).mockReturnValue(backLink)

      const requestHandler = bookingsController.confirm()

      await requestHandler(request, response, next)

      expect(appendQueryString).toHaveBeenCalledWith(
        paths.bookings.selectAssessment({ premisesId: premises.id, roomId: room.id }),
        request.query,
      )
      expect(appendQueryString).not.toHaveBeenCalledWith(
        paths.bookings.new({ premisesId: premises.id, roomId: room.id }),
        request.query,
      )

      expect(insertGenericError).toHaveBeenCalledWith(new Error(), 'assessmentId', 'empty')
      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(request, response, new Error(), backLink)
    })
  })

  describe('create', () => {
    it('creates a booking and redirects to the show room page', async () => {
      const requestHandler = bookingsController.create()

      const room = roomFactory.build()

      const booking = bookingFactory.build()
      const newBooking = newBookingFactory.build({
        ...booking,
      })

      request.params = {
        premisesId,
        roomId,
      }
      request.body = {
        ...newBooking,
        ...DateFormats.isoToDateAndTimeInputs(newBooking.arrivalDate, 'arrivalDate'),
        ...DateFormats.isoToDateAndTimeInputs(newBooking.departureDate, 'departureDate'),
        assessmentId,
      }

      bedspaceService.getRoom.mockResolvedValue(room)
      bookingService.createForBedspace.mockResolvedValue(booking)

      await requestHandler(request, response, next)

      expect(bookingService.createForBedspace).toHaveBeenCalledWith(
        callConfig,
        premisesId,
        room,
        expect.objectContaining({ ...newBooking, assessmentId }),
      )

      expect(request.flash).toHaveBeenCalledWith('success', 'Booking created')
      expect(response.redirect).toHaveBeenCalledWith(paths.bookings.show({ premisesId, roomId, bookingId: booking.id }))
    })

    it('creates a booking without an assessment ID if the given assessment ID is the known "no assessment" ID', async () => {
      const requestHandler = bookingsController.create()

      const room = roomFactory.build()

      const booking = bookingFactory.build()
      const newBooking = newBookingFactory.build({
        ...booking,
      })

      request.params = {
        premisesId,
        roomId,
      }
      request.body = {
        ...newBooking,
        ...DateFormats.isoToDateAndTimeInputs(newBooking.arrivalDate, 'arrivalDate'),
        ...DateFormats.isoToDateAndTimeInputs(newBooking.departureDate, 'departureDate'),
        assessmentId: noAssessmentId,
      }

      bedspaceService.getRoom.mockResolvedValue(room)
      bookingService.createForBedspace.mockResolvedValue(booking)

      await requestHandler(request, response, next)

      expect(bookingService.createForBedspace).toHaveBeenCalledWith(
        callConfig,
        premisesId,
        room,
        expect.not.objectContaining({ assessmentId: noAssessmentId }),
      )

      expect(request.flash).toHaveBeenCalledWith('success', 'Booking created')
      expect(response.redirect).toHaveBeenCalledWith(paths.bookings.show({ premisesId, roomId, bookingId: booking.id }))
    })

    it('renders with errors if the API returns an error', async () => {
      const requestHandler = bookingsController.create()

      const room = roomFactory.build()
      bedspaceService.getRoom.mockResolvedValue(room)

      const err = new Error()
      bookingService.createForBedspace.mockImplementation(() => {
        throw err
      })
      ;(appendQueryString as jest.MockedFunction<typeof appendQueryString>).mockReturnValue(backLink)

      const booking = bookingFactory.build()
      const newBooking = newBookingFactory.build({
        ...booking,
      })

      request.params = {
        premisesId,
        roomId,
      }
      request.body = {
        ...newBooking,
        ...DateFormats.isoToDateAndTimeInputs(newBooking.arrivalDate, 'arrivalDate'),
        ...DateFormats.isoToDateAndTimeInputs(newBooking.arrivalDate, 'departureDate'),
      }

      await requestHandler(request, response, next)

      expect(appendQueryString).toHaveBeenCalledWith(paths.bookings.new({ premisesId, roomId }), request.body)
      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(request, response, err, backLink)
    })

    it('renders with errors if the API returns a 409 Conflict status', async () => {
      const requestHandler = bookingsController.create()

      const room = roomFactory.build()
      bedspaceService.getRoom.mockResolvedValue(room)

      const err = { status: 409 }
      bookingService.createForBedspace.mockImplementation(() => {
        throw err
      })

      const bespokeError: BespokeError = {
        errorTitle: 'some-bespoke-error',
        errorSummary: [],
      }
      ;(generateConflictBespokeError as jest.MockedFunction<typeof generateConflictBespokeError>).mockReturnValue(
        bespokeError,
      )
      ;(appendQueryString as jest.MockedFunction<typeof appendQueryString>).mockReturnValue(backLink)

      const booking = bookingFactory.build()
      const newBooking = newBookingFactory.build({
        ...booking,
      })

      request.params = {
        premisesId,
        roomId,
      }
      request.body = {
        ...newBooking,
        ...DateFormats.isoToDateAndTimeInputs(newBooking.arrivalDate, 'arrivalDate'),
        ...DateFormats.isoToDateAndTimeInputs(newBooking.arrivalDate, 'departureDate'),
      }

      await requestHandler(request, response, next)

      expect(appendQueryString).toHaveBeenCalledWith(paths.bookings.new({ premisesId, roomId }), request.body)
      expect(generateConflictBespokeError).toHaveBeenCalledWith(err, premisesId, roomId, 'plural')
      expect(insertBespokeError).toHaveBeenCalledWith(err, bespokeError)
      expect(insertGenericError).toHaveBeenCalledWith(err, 'arrivalDate', 'conflict')
      expect(insertGenericError).toHaveBeenCalledWith(err, 'departureDate', 'conflict')
      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(request, response, err, backLink)
    })

    it('renders with errors if the API returns a 403 Forbidden status', async () => {
      const requestHandler = bookingsController.create()

      const room = roomFactory.build()
      bedspaceService.getRoom.mockResolvedValue(room)

      const err = { status: 403 }
      bookingService.createForBedspace.mockImplementation(() => {
        throw err
      })
      ;(appendQueryString as jest.MockedFunction<typeof appendQueryString>).mockReturnValue(backLink)

      const booking = bookingFactory.build()
      const newBooking = newBookingFactory.build({
        ...booking,
      })

      request.params = {
        premisesId,
        roomId,
      }
      request.body = {
        ...newBooking,
        ...DateFormats.isoToDateAndTimeInputs(newBooking.arrivalDate, 'arrivalDate'),
        ...DateFormats.isoToDateAndTimeInputs(newBooking.arrivalDate, 'departureDate'),
      }

      await requestHandler(request, response, next)

      expect(appendQueryString).toHaveBeenCalledWith(paths.bookings.new({ premisesId, roomId }), request.body)
      expect(insertGenericError).toHaveBeenCalledWith(err, 'crn', 'userPermission')
      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(request, response, err, backLink)
    })
  })

  describe('show', () => {
    it('renders the template for viewing a booking', async () => {
      const premises = premisesFactory.build()
      const room = roomFactory.build()
      const booking = bookingFactory.build()

      premisesService.getPremises.mockResolvedValue(premises)
      bedspaceService.getRoom.mockResolvedValue(room)
      bookingService.getBooking.mockResolvedValue(booking)
      ;(bookingActions as jest.MockedFunction<typeof bookingActions>).mockReturnValue([])

      request.params = {
        premisesId: premises.id,
        roomId: room.id,
        bookingId: booking.id,
      }

      const requestHandler = bookingsController.show()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/bookings/show', {
        premises,
        room,
        booking,
        actions: [],
      })

      expect(premisesService.getPremises).toHaveBeenCalledWith(callConfig, premises.id)
      expect(bedspaceService.getRoom).toHaveBeenCalledWith(callConfig, premises.id, room.id)
      expect(bookingService.getBooking).toHaveBeenCalledWith(callConfig, premises.id, booking.id)
    })
  })

  describe('history', () => {
    it('renders the template for viewing booking history', async () => {
      const premises = premisesFactory.build()
      const room = roomFactory.build()
      const booking = bookingFactory.build()

      premisesService.getPremises.mockResolvedValue(premises)
      bedspaceService.getRoom.mockResolvedValue(room)
      bookingService.getBooking.mockResolvedValue(booking)
      ;(deriveBookingHistory as jest.MockedFunction<typeof deriveBookingHistory>).mockReturnValue([
        {
          booking,
          updatedAt: '2022-02-01',
        },
      ])

      request.params = {
        premisesId: premises.id,
        roomId: room.id,
        bookingId: booking.id,
      }

      const requestHandler = bookingsController.history()
      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/bookings/history', {
        premises,
        room,
        booking,
        history: [
          {
            booking,
            updatedAt: '1 Feb 22',
          },
        ],
      })

      expect(premisesService.getPremises).toHaveBeenCalledWith(callConfig, premises.id)
      expect(bedspaceService.getRoom).toHaveBeenCalledWith(callConfig, premises.id, room.id)
      expect(bookingService.getBooking).toHaveBeenCalledWith(callConfig, premises.id, booking.id)
      expect(deriveBookingHistory).toHaveBeenCalledWith(booking)
    })
  })
})
