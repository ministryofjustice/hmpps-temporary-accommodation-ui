import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { BespokeError } from '../../../@types/ui'
import { CallConfig } from '../../../data/restClient'
import paths from '../../../paths/temporary-accommodation/manage'
import { AssessmentsService, BookingService, PersonService, PremisesService } from '../../../services'
import BedspaceService from '../../../services/bedspaceService'
import {
  applicationFactory,
  assessmentFactory,
  assessmentSummaryFactory,
  bookingFactory,
  newBookingFactory,
  personFactory,
  placeContextFactory,
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
import { clearPlaceContext, preservePlaceContext } from '../../../utils/placeUtils'
import extractCallConfig from '../../../utils/restUtils'
import { isApplyEnabledForUser } from '../../../utils/userUtils'
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
jest.mock('../../../utils/userUtils')
jest.mock('../../../utils/placeUtils')

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
    ;(preservePlaceContext as jest.MockedFunction<typeof preservePlaceContext>).mockReset()

    request = createMock<Request>()
    ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)
    ;(isApplyEnabledForUser as jest.MockedFn<typeof isApplyEnabledForUser>).mockReturnValue(true)
  })

  describe('index', () => {
    it('redirects to provisional bookings', async () => {
      const requestHandler = bookingsController.index()
      await requestHandler(request, response, next)

      expect(response.redirect).toHaveBeenCalledWith(301, paths.bookings.search.provisional.index({}))
    })
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
      expect(preservePlaceContext).toHaveBeenCalledWith(request, response, assessmentService)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/bookings/new', {
        premises,
        room,
        bedspaceStatus: {
          rows: [
            {
              key: 'Bedspace status',
              value: {
                html: '<span class="govuk-tag govuk-tag--green">Online</span>',
              },
            },
            {
              key: 'Bedspace end date',
              value: {
                text: DateFormats.isoDateToUIDate(room.beds[0].bedEndDate),
              },
            },
          ],
        },
        errors: {},
        errorSummary: [],
        crn: 'some-crn',
      })
    })

    it('prefills the arrival date and CRN if present in a place context', async () => {
      request.params = {
        premisesId,
        roomId,
      }
      request.query = {}

      const premises = premisesFactory.build()
      const room = roomFactory.build()
      const placeContext = placeContextFactory.build({
        arrivalDate: '2024-02-01',
        assessment: assessmentFactory.build({
          application: applicationFactory.build({
            person: personFactory.build({ crn: 'some-crn' }),
          }),
        }),
      })

      premisesService.getPremises.mockResolvedValue(premises)
      bedspaceService.getRoom.mockResolvedValue(room)
      ;(preservePlaceContext as jest.MockedFunction<typeof preservePlaceContext>).mockResolvedValue(placeContext)

      const requestHandler = bookingsController.new()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [] })

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'temporary-accommodation/bookings/new',
        expect.objectContaining({
          crn: 'some-crn',
          ...DateFormats.isoToDateAndTimeInputs('2024-02-01', 'arrivalDate'),
        }),
      )
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
      expect(preservePlaceContext).toHaveBeenCalledWith(request, response, assessmentService)
      expect(appendQueryString).toHaveBeenCalledWith(paths.bookings.new({ premisesId, roomId }), request.query)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/bookings/selectAssessment', {
        premisesId,
        roomId,
        applyDisabled: false,
        assessmentRadioItems: radioItems,
        crn: newBooking.crn,
        ...DateFormats.isoToDateAndTimeInputs(newBooking.arrivalDate, 'arrivalDate'),
        ...DateFormats.isoToDateAndTimeInputs(newBooking.departureDate, 'departureDate'),
        errors: {},
        errorSummary: [],
        backLink,
      })
    })

    it('renders the select with a "no assessment" assessment ID if the Apply feature is disabled', async () => {
      const newBooking = newBookingFactory.build()
      const person = personFactory.build()
      const assessmentSummaries = assessmentSummaryFactory.buildList(5)

      ;(isApplyEnabledForUser as jest.MockedFn<typeof isApplyEnabledForUser>).mockReturnValue(false)

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
        applyDisabled: true,
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

    it('renders the select with a "no assessment" assessment ID if there are no assessments for the given CRN', async () => {
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
        applyDisabled: false,
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

    it('prefills the asssessment ID if present in a place context', async () => {
      const newBooking = newBookingFactory.build()
      const person = personFactory.build({
        crn: newBooking.crn,
      })
      const assessmentSummaries = assessmentSummaryFactory.buildList(5)
      const placeContext = placeContextFactory.build({
        assessment: assessmentFactory.build({
          id: 'some-assessment-id',
          application: applicationFactory.build({ person }),
        }),
      })

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
      ;(preservePlaceContext as jest.MockedFunction<typeof preservePlaceContext>).mockResolvedValue(placeContext)
      ;(appendQueryString as jest.MockedFunction<typeof appendQueryString>).mockReturnValue(backLink)

      const requestHandler = bookingsController.selectAssessment()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [] })

      await requestHandler(request, response, next)

      expect(response.render).toHaveBeenCalledWith(
        'temporary-accommodation/bookings/selectAssessment',
        expect.objectContaining({
          assessmentId: 'some-assessment-id',
        }),
      )
    })

    it.each([
      [
        'crn is empty',
        {
          crn: '',
          ...DateFormats.isoToDateAndTimeInputs(newBookingFactory.build().arrivalDate, 'arrivalDate'),
          ...DateFormats.isoToDateAndTimeInputs(newBookingFactory.build().departureDate, 'departureDate'),
        },
        'crn',
        'empty',
      ],
      [
        'arrival date is empty',
        {
          crn: 'some-crn',
          ...DateFormats.isoToDateAndTimeInputs(newBookingFactory.build().departureDate, 'departureDate'),
        },
        'arrivalDate',
        'empty',
      ],
      [
        'arrival date is invalid',
        {
          crn: 'some-crn',
          ...DateFormats.isoToDateAndTimeInputs(newBookingFactory.build().arrivalDate, 'arrivalDate'),
          ...DateFormats.isoToDateAndTimeInputs(newBookingFactory.build().departureDate, 'departureDate'),
          'arrivalDate-day': 'not-a-number',
        },
        'arrivalDate',
        'invalid',
      ],
      [
        'departure date is empty',
        {
          crn: 'some-crn',
          ...DateFormats.isoToDateAndTimeInputs(newBookingFactory.build().departureDate, 'arrivalDate'),
        },
        'departureDate',
        'empty',
      ],
      [
        'departure date is empty',
        {
          crn: 'some-crn',
          ...DateFormats.isoToDateAndTimeInputs(newBookingFactory.build().arrivalDate, 'arrivalDate'),
          ...DateFormats.isoToDateAndTimeInputs(newBookingFactory.build().departureDate, 'departureDate'),
          'departureDate-day': 'not-a-number',
        },
        'departureDate',
        'invalid',
      ],
    ])(
      'renders with an error if the %s',
      async (_: string, query: Record<string, string>, errorProperty: string, errorType: string) => {
        const person = personFactory.build()

        request.params = {
          premisesId,
          roomId,
        }
        request.query = query

        personService.findByCrn.mockResolvedValue(person)
        ;(appendQueryString as jest.MockedFunction<typeof appendQueryString>).mockReturnValue(backLink)

        const requestHandler = bookingsController.selectAssessment()
        ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [] })

        await requestHandler(request, response, next)

        expect(appendQueryString).toHaveBeenCalledWith(paths.bookings.new({ premisesId, roomId }), request.query)
        expect(insertGenericError).toHaveBeenCalledWith(new Error(), errorProperty, errorType)
        expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(request, response, new Error(), backLink)
      },
    )

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

    it('clears any place context if the received CRN differs from that in the place context', async () => {
      const newBooking = newBookingFactory.build()
      const person = personFactory.build({})
      const placeContext = placeContextFactory.build({
        assessment: assessmentFactory.build({
          application: applicationFactory.build({ person: personFactory.build({ crn: 'some-crn' }) }),
        }),
      })

      request.params = {
        premisesId,
        roomId,
      }
      request.query = {
        crn: 'some-other-crn',
        ...DateFormats.isoToDateAndTimeInputs(newBooking.arrivalDate, 'arrivalDate'),
        ...DateFormats.isoToDateAndTimeInputs(newBooking.departureDate, 'departureDate'),
      }

      personService.findByCrn.mockResolvedValue(person)
      assessmentService.getReadyToPlaceForCrn.mockResolvedValue([])
      ;(assessmentRadioItems as jest.MockedFunction<typeof assessmentRadioItems>).mockReturnValue(radioItems)
      ;(preservePlaceContext as jest.MockedFunction<typeof preservePlaceContext>).mockResolvedValue(placeContext)
      ;(appendQueryString as jest.MockedFunction<typeof appendQueryString>).mockReturnValue(backLink)

      const requestHandler = bookingsController.selectAssessment()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [] })

      await requestHandler(request, response, next)

      expect(clearPlaceContext).toHaveBeenCalledWith(request, response)
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
      expect(preservePlaceContext).toHaveBeenCalledWith(request, response, assessmentService)
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

    it('clears any place context if the received assessment ID differs from that in the place context', async () => {
      const newBooking = newBookingFactory.build()
      const premises = premisesFactory.build()
      const room = roomFactory.build()
      const person = personFactory.build()
      const placeContext = placeContextFactory.build({
        assessment: assessmentFactory.build({
          id: 'some-id',
        }),
      })

      request.params = {
        premisesId,
        roomId,
      }
      request.query = {
        crn: newBooking.crn,
        ...DateFormats.isoToDateAndTimeInputs(newBooking.arrivalDate, 'arrivalDate'),
        ...DateFormats.isoToDateAndTimeInputs(newBooking.departureDate, 'departureDate'),
        assessmentId: 'some-other-id',
      }

      premisesService.getPremises.mockResolvedValue(premises)
      bedspaceService.getRoom.mockResolvedValue(room)
      personService.findByCrn.mockResolvedValue(person)
      ;(preservePlaceContext as jest.MockedFunction<typeof preservePlaceContext>).mockResolvedValue(placeContext)
      ;(appendQueryString as jest.MockedFunction<typeof appendQueryString>).mockReturnValue(backLink)

      const requestHandler = bookingsController.confirm()
      await requestHandler(request, response, next)

      expect(clearPlaceContext).toHaveBeenCalledWith(request, response)
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

    it('removes empty spaces from the crn before API call', async () => {
      const requestHandler = bookingsController.create()

      const room = roomFactory.build()

      const crn = 'XJKEGDJHEJ'
      const crnWithSpaces = `  ${crn}  `

      const booking = bookingFactory.build()
      const newBooking = newBookingFactory.build({
        ...booking,
        crn: crnWithSpaces,
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
        expect.objectContaining({ crn }),
      )
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
      expect(preservePlaceContext).toHaveBeenCalledWith(request, response, assessmentService)
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
      expect(preservePlaceContext).toHaveBeenCalledWith(request, response, assessmentService)
    })
  })
})
