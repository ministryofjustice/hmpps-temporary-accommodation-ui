import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { addDays } from 'date-fns'
import { BespokeError } from '@approved-premises/ui'
import { CallConfig } from '../../../data/restClient'
import paths from '../../../paths/temporary-accommodation/manage'
import { ArrivalService, BookingService, PremisesService } from '../../../services'
import {
  cas3ArrivalFactory,
  cas3BedspaceFactory,
  cas3BookingFactory,
  cas3ConfirmationFactory,
  cas3PremisesFactory,
  newArrivalFactory,
} from '../../../testutils/factories'
import { generateConflictBespokeError } from '../../../utils/bookingUtils'
import { DateFormats } from '../../../utils/dateUtils'
import extractCallConfig from '../../../utils/restUtils'
import {
  catchValidationErrorOrPropogate,
  fetchErrorsAndUserInput,
  insertBespokeError,
  insertGenericError,
} from '../../../utils/validation'
import ArrivalsController from './arrivalsController'
import config from '../../../config'
import BedspaceService from '../../../services/bedspaceService'

jest.mock('../../../utils/validation')
jest.mock('../../../utils/restUtils')
jest.mock('../../../utils/bookingUtils')

describe('ArrivalsController', () => {
  const callConfig = { token: 'some-call-config-token' } as CallConfig
  const premisesId = 'premisesId'
  const bedspaceId = 'bedspaceId'
  const bookingId = 'bookingId'

  let request: Request

  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const premisesService = createMock<PremisesService>({})
  const bedspaceService = createMock<BedspaceService>({})
  const bookingService = createMock<BookingService>({})
  const arrivalService = createMock<ArrivalService>({})

  const arrivalsController = new ArrivalsController(premisesService, bedspaceService, bookingService, arrivalService)

  beforeEach(() => {
    request = createMock<Request>()
    ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)
  })

  describe('Adding arrival details', () => {
    describe('new', () => {
      it('renders the form prepopulated with the current booking dates', async () => {
        const premises = cas3PremisesFactory.build()
        const bedspace = cas3BedspaceFactory.build()
        const booking = cas3BookingFactory.arrived().build()

        request.params = {
          premisesId: premises.id,
          bedspaceId: bedspace.id,
          bookingId: booking.id,
        }

        premisesService.getSinglePremises.mockResolvedValue(premises)
        bedspaceService.getSingleBedspace.mockResolvedValue(bedspace)
        bookingService.getBooking.mockResolvedValue(booking)

        const requestHandler = arrivalsController.new()
        ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

        await requestHandler(request, response, next)

        expect(premisesService.getSinglePremises).toHaveBeenCalledWith(callConfig, premises.id)
        expect(bedspaceService.getSingleBedspace).toHaveBeenCalledWith(callConfig, premises.id, bedspace.id)
        expect(bookingService.getBooking).toHaveBeenCalledWith(callConfig, premises.id, booking.id)

        expect(response.render).toHaveBeenCalledWith('temporary-accommodation/arrivals/new', {
          premises,
          bedspace,
          booking,
          errors: {},
          errorSummary: [],
          ...DateFormats.isoToDateAndTimeInputs(booking.arrivalDate, 'arrivalDate'),
          ...DateFormats.isoToDateAndTimeInputs(booking.departureDate, 'expectedDepartureDate'),
          nDeliusUpdateMessage: true,
        })
      })
    })

    describe('create', () => {
      it('creates an arrival and redirects to the show booking page', async () => {
        const arrival = cas3ArrivalFactory.build()
        const newArrival = newArrivalFactory.build()

        request.params = {
          premisesId,
          bedspaceId,
          bookingId,
        }
        request.body = {
          notes: newArrival.notes,
          ...DateFormats.isoToDateAndTimeInputs(newArrival.arrivalDate, 'arrivalDate'),
          ...DateFormats.isoToDateAndTimeInputs(newArrival.expectedDepartureDate, 'expectedDepartureDate'),
        }

        arrivalService.createArrival.mockResolvedValue(arrival)

        const requestHandler = arrivalsController.create()
        await requestHandler(request, response, next)

        expect(arrivalService.createArrival).toHaveBeenCalledWith(
          callConfig,
          premisesId,
          bookingId,
          expect.objectContaining(newArrival),
        )

        expect(request.flash).toHaveBeenCalledWith('success', {
          title: 'Booking marked as active',
          text: 'At the moment the CAS3 digital service does not automatically update NDelius. Please continue to record accommodation and address changes directly in NDelius.',
        })
        expect(response.redirect).toHaveBeenCalledWith(paths.bookings.show({ premisesId, bedspaceId, bookingId }))
      })

      it('renders with errors if the API returns an error', async () => {
        const requestHandler = arrivalsController.create()

        const arrival = cas3ConfirmationFactory.build()
        const newArrival = newArrivalFactory.build({
          ...arrival,
        })

        request.params = {
          premisesId,
          bedspaceId,
          bookingId,
        }
        request.body = {
          ...newArrival,
          ...DateFormats.isoToDateAndTimeInputs(newArrival.arrivalDate, 'arrivalDate'),
          ...DateFormats.isoToDateAndTimeInputs(newArrival.expectedDepartureDate, 'expectedDepartureDate'),
        }

        const err = new Error()
        arrivalService.createArrival.mockImplementation(() => {
          throw err
        })

        await requestHandler(request, response, next)

        expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          err,
          paths.bookings.arrivals.new({ premisesId, bedspaceId, bookingId }),
        )
      })

      it('renders with errors if the API returns a 409 Conflict status', async () => {
        const requestHandler = arrivalsController.create()

        const arrival = cas3ConfirmationFactory.build()
        const newArrival = newArrivalFactory.build({
          ...arrival,
        })

        request.params = {
          premisesId,
          bedspaceId,
          bookingId,
        }
        request.body = {
          ...newArrival,
          ...DateFormats.isoToDateAndTimeInputs(newArrival.arrivalDate, 'arrivalDate'),
          ...DateFormats.isoToDateAndTimeInputs(newArrival.expectedDepartureDate, 'expectedDepartureDate'),
        }

        const err = { status: 409 }
        arrivalService.createArrival.mockImplementation(() => {
          throw err
        })
        const bespokeError: BespokeError = {
          errorTitle: 'some-bespoke-error',
          errorSummary: [],
        }
        ;(generateConflictBespokeError as jest.MockedFunction<typeof generateConflictBespokeError>).mockReturnValue(
          bespokeError,
        )

        await requestHandler(request, response, next)

        expect(generateConflictBespokeError).toHaveBeenCalledWith(err, premisesId, bedspaceId, 'plural')
        expect(insertBespokeError).toHaveBeenCalledWith(err, bespokeError)
        expect(insertGenericError).toHaveBeenCalledWith(err, 'arrivalDate', 'conflict')
        expect(insertGenericError).toHaveBeenCalledWith(err, 'expectedDepartureDate', 'conflict')
        expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          err,
          paths.bookings.arrivals.new({ premisesId, bedspaceId, bookingId }),
        )
      })

      it('renders with errors if arrival date is in future', async () => {
        const requestHandler = arrivalsController.create()

        const arrival = cas3ConfirmationFactory.build()
        const newArrival = newArrivalFactory.build({
          ...arrival,
        })

        const currentDate = new Date()
        const futureDate = addDays(currentDate, 7)

        request.params = {
          premisesId,
          bedspaceId,
          bookingId,
        }
        request.body = {
          ...newArrival,
          ...DateFormats.isoToDateAndTimeInputs(DateFormats.dateObjToIsoDate(futureDate), 'arrivalDate'),
          ...DateFormats.isoToDateAndTimeInputs(newArrival.expectedDepartureDate, 'expectedDepartureDate'),
        }

        const err = new Error()
        arrivalService.createArrival.mockImplementation(() => {
          throw err
        })

        await requestHandler(request, response, next)

        expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          err,
          paths.bookings.arrivals.new({ premisesId, bedspaceId, bookingId }),
        )
      })

      it('accepts exactly 84 nights from arrival when crossing BST', async () => {
        jest.useFakeTimers().setSystemTime(new Date('2026-01-08T12:00:00.000Z'))

        const arrivalDate = '2026-01-08'
        const expectedDepartureDate = '2026-04-02'
        const arrival = cas3ArrivalFactory.build()
        const newArrival = newArrivalFactory.build({ arrivalDate, expectedDepartureDate })

        request.params = {
          premisesId,
          bedspaceId,
          bookingId,
        }
        request.body = {
          notes: newArrival.notes,
          ...DateFormats.isoToDateAndTimeInputs(newArrival.arrivalDate, 'arrivalDate'),
          ...DateFormats.isoToDateAndTimeInputs(newArrival.expectedDepartureDate, 'expectedDepartureDate'),
        }

        arrivalService.createArrival.mockResolvedValue(arrival)

        const handler = arrivalsController.create()
        await handler(request, response, next)

        expect(arrivalService.createArrival).toHaveBeenCalledWith(
          callConfig,
          premisesId,
          bookingId,
          expect.objectContaining(newArrival),
        )

        expect(insertGenericError).not.toHaveBeenCalledWith(
          expect.any(Error),
          'expectedDepartureDate',
          'exceedsMaxNights',
        )
        expect(response.redirect).toHaveBeenCalledWith(paths.bookings.show({ premisesId, bedspaceId, bookingId }))

        jest.useRealTimers()
      })
    })
  })

  describe('Amending arrival details', () => {
    describe('edit', () => {
      it('renders the form', async () => {
        const premises = cas3PremisesFactory.build()
        const bedspace = cas3BedspaceFactory.build()
        const booking = cas3BookingFactory.arrived().build()

        request.params = {
          premisesId: premises.id,
          bedspaceId: bedspace.id,
          bookingId: booking.id,
        }

        premisesService.getSinglePremises.mockResolvedValue(premises)
        bedspaceService.getSingleBedspace.mockResolvedValue(bedspace)
        bookingService.getBooking.mockResolvedValue(booking)

        const requestHandler = arrivalsController.edit()
        ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

        await requestHandler(request, response, next)

        expect(premisesService.getSinglePremises).toHaveBeenCalledWith(callConfig, premises.id)
        expect(bedspaceService.getSingleBedspace).toHaveBeenCalledWith(callConfig, premises.id, bedspace.id)
        expect(bookingService.getBooking).toHaveBeenCalledWith(callConfig, premises.id, booking.id)

        expect(response.render).toHaveBeenCalledWith('temporary-accommodation/arrivals/edit', {
          premises,
          bedspace,
          booking,
          errors: {},
          errorSummary: [],
          errorTitle: undefined,
          notes: booking.arrival.notes,
        })
      })
    })

    describe('update', () => {
      it('updates an arrival and redirects to the show booking page', async () => {
        const requestHandler = arrivalsController.update()

        const arrival = cas3ArrivalFactory.build()
        const newArrival = newArrivalFactory.build()
        const booking = cas3BookingFactory.build()
        booking.departureDate = newArrival.expectedDepartureDate
        bookingService.getBooking.mockResolvedValue(booking)

        request.params = {
          premisesId,
          bedspaceId,
          bookingId,
        }
        request.body = {
          notes: newArrival.notes,
          ...DateFormats.isoToDateAndTimeInputs(newArrival.arrivalDate, 'arrivalDate'),
        }

        arrivalService.createArrival.mockResolvedValue(arrival)

        await requestHandler(request, response, next)

        expect(arrivalService.createArrival).toHaveBeenCalledWith(
          callConfig,
          premisesId,
          bookingId,
          expect.objectContaining(newArrival),
        )

        expect(request.flash).toHaveBeenCalledWith('success', 'Arrival updated')
        expect(response.redirect).toHaveBeenCalledWith(paths.bookings.show({ premisesId, bedspaceId, bookingId }))
      })

      it('renders with errors if the API returns an error', async () => {
        const requestHandler = arrivalsController.update()

        const arrival = cas3ConfirmationFactory.build()
        const newArrival = newArrivalFactory.build({
          ...arrival,
        })

        request.params = {
          premisesId,
          bedspaceId,
          bookingId,
        }
        request.body = {
          ...newArrival,
          ...DateFormats.isoToDateAndTimeInputs(newArrival.arrivalDate, 'arrivalDate'),
        }

        const err = new Error()
        arrivalService.createArrival.mockImplementation(() => {
          throw err
        })

        await requestHandler(request, response, next)

        expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          err,
          paths.bookings.arrivals.edit({ premisesId, bedspaceId, bookingId }),
        )
      })

      it('renders with errors if the API returns a 409 Conflict status', async () => {
        const requestHandler = arrivalsController.update()

        const arrival = cas3ConfirmationFactory.build()
        const newArrival = newArrivalFactory.build({
          ...arrival,
        })

        request.params = {
          premisesId,
          bedspaceId,
          bookingId,
        }
        request.body = {
          ...newArrival,
          ...DateFormats.isoToDateAndTimeInputs(newArrival.arrivalDate, 'arrivalDate'),
        }

        const err = { status: 409 }
        arrivalService.createArrival.mockImplementation(() => {
          throw err
        })
        const bespokeError: BespokeError = {
          errorTitle: 'some-bespoke-error',
          errorSummary: [],
        }
        ;(generateConflictBespokeError as jest.MockedFunction<typeof generateConflictBespokeError>).mockReturnValue(
          bespokeError,
        )

        await requestHandler(request, response, next)

        expect(generateConflictBespokeError).toHaveBeenCalledWith(err, premisesId, bedspaceId, 'singular')
        expect(insertBespokeError).toHaveBeenCalledWith(err, bespokeError)
        expect(insertGenericError).toHaveBeenCalledWith(err, 'arrivalDate', 'conflict')
        expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          err,
          paths.bookings.arrivals.edit({ premisesId, bedspaceId, bookingId }),
        )
      })

      it('renders with errors if arrival date is in future', async () => {
        const currentDate = new Date()
        const futureDate = addDays(currentDate, 7)

        const arrival = cas3ConfirmationFactory.build()
        const newArrival = newArrivalFactory.build({
          ...arrival,
        })

        request.params = {
          premisesId,
          bedspaceId,
          bookingId,
        }
        request.body = {
          ...newArrival,
          ...DateFormats.isoToDateAndTimeInputs(DateFormats.dateObjToIsoDate(futureDate), 'arrivalDate'),
        }

        const err = new Error()
        arrivalService.createArrival.mockImplementation(() => {
          throw err
        })

        const requestHandler = arrivalsController.update()
        await requestHandler(request, response, next)

        expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
          request,
          response,
          err,
          paths.bookings.arrivals.edit({ premisesId, bedspaceId, bookingId }),
        )
      })
    })
  })

  describe('if the domainEvent feature flag contains personArrived', () => {
    beforeEach(() => {
      jest.mock('../../../config')
      config.flags.domainEventsEmit = 'personArrived'
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('does not show the NDelius update message when creating', async () => {
      const premises = cas3PremisesFactory.build()
      const bedspace = cas3BedspaceFactory.build()
      const booking = cas3BookingFactory.arrived().build()

      request.params = {
        premisesId: premises.id,
        bedspaceId: bedspace.id,
        bookingId: booking.id,
      }

      premisesService.getSinglePremises.mockResolvedValue(premises)
      bedspaceService.getSingleBedspace.mockResolvedValue(bedspace)
      bookingService.getBooking.mockResolvedValue(booking)

      const requestHandler = arrivalsController.new()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      await requestHandler(request, response, next)

      expect(premisesService.getSinglePremises).toHaveBeenCalledWith(callConfig, premises.id)
      expect(bedspaceService.getSingleBedspace).toHaveBeenCalledWith(callConfig, premises.id, bedspace.id)
      expect(bookingService.getBooking).toHaveBeenCalledWith(callConfig, premises.id, booking.id)

      expect(response.render).toHaveBeenCalledWith(
        'temporary-accommodation/arrivals/new',
        expect.objectContaining({
          nDeliusUpdateMessage: false,
        }),
      )
    })

    it('renders a different success message after creating', async () => {
      const arrival = cas3ArrivalFactory.build()
      const newArrival = newArrivalFactory.build()

      request.params = {
        premisesId,
        bedspaceId,
        bookingId,
      }
      request.body = {
        notes: newArrival.notes,
        ...DateFormats.isoToDateAndTimeInputs(newArrival.arrivalDate, 'arrivalDate'),
        ...DateFormats.isoToDateAndTimeInputs(newArrival.expectedDepartureDate, 'expectedDepartureDate'),
      }

      arrivalService.createArrival.mockResolvedValue(arrival)

      const requestHandler = arrivalsController.create()
      await requestHandler(request, response, next)

      expect(request.flash).toHaveBeenCalledWith('success', {
        title: 'Booking marked as active',
        text: 'You no longer need to update NDelius with this change.',
      })
    })
  })
})
