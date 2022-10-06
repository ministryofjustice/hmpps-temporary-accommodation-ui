import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'

import type { ErrorsAndUserInput } from 'approved-premises'

import { BookingService, PremisesService, PersonService } from '../../services'
import BookingsController from './bookingsController'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../utils/validation'

import bookingFactory from '../../testutils/factories/booking'
import newBookingFactory from '../../testutils/factories/newBooking'
import personFactory from '../../testutils/factories/person'
import paths from '../../paths/manage'

jest.mock('../../utils/validation')

describe('bookingsController', () => {
  const token = 'SOME_TOKEN'
  const premisesId = 'premisesId'

  let request: DeepMocked<Request> = createMock<Request>({ user: { token } })
  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const bookingService = createMock<BookingService>({})
  const premisesService = createMock<PremisesService>({})
  const personService = createMock<PersonService>({})
  const bookingController = new BookingsController(bookingService, premisesService, personService)

  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('show', () => {
    it('should fetch the booking and render the show page', async () => {
      const booking = bookingFactory.build()
      bookingService.find.mockResolvedValue(booking)

      const requestHandler = bookingController.show()

      await requestHandler({ ...request, params: { premisesId, bookingId: booking.id } }, response, next)

      expect(response.render).toHaveBeenCalledWith('bookings/show', {
        booking,
        premisesId,
        pageHeading: 'Booking details',
      })

      expect(bookingService.find).toHaveBeenCalledWith(token, premisesId, booking.id)
    })
  })

  describe('new', () => {
    describe('If there is a CRN in the flash', () => {
      const person = personFactory.build()

      beforeEach(() => {
        request = createMock<Request>({
          user: { token },
          flash: jest.fn().mockReturnValue([person.crn]),
          params: { premisesId },
        })

        personService.findByCrn.mockResolvedValue(person)
      })

      it('it should render the new booking form', async () => {
        ;(fetchErrorsAndUserInput as jest.Mock).mockImplementation(() => {
          return { errors: {}, errorSummary: [], userInput: {} }
        })

        const requestHandler = bookingController.new()

        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('bookings/new', {
          premisesId,
          pageHeading: 'Make a booking',
          ...person,
          errors: {},
          errorSummary: [],
        })
        expect(personService.findByCrn).toHaveBeenCalledWith(token, person.crn)
        expect(request.flash).toHaveBeenCalledWith('crn')
      })

      it('renders the form with errors and user input if an error has been sent to the flash', async () => {
        const errorsAndUserInput = createMock<ErrorsAndUserInput>()
        ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

        const requestHandler = bookingController.new()

        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('bookings/new', {
          premisesId,
          pageHeading: 'Make a booking',
          ...person,
          errors: errorsAndUserInput.errors,
          errorSummary: errorsAndUserInput.errorSummary,
          ...errorsAndUserInput.userInput,
        })
      })
    })

    describe('if there is a no CRN in the flash', () => {
      beforeEach(() => {
        request = createMock<Request>({
          user: { token },
          flash: jest.fn().mockReturnValue([]),
          params: { premisesId },
        })
      })

      it('it should render the new booking form', async () => {
        ;(fetchErrorsAndUserInput as jest.Mock).mockImplementation(() => {
          return { errors: {}, errorSummary: [], userInput: {} }
        })

        const requestHandler = bookingController.new()

        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('bookings/find', {
          premisesId,
          pageHeading: 'Make a booking - find someone by CRN',
          errors: {},
          errorSummary: [],
        })
      })

      it('renders the form with errors and user input if an error has been sent to the flash', async () => {
        const errorsAndUserInput = createMock<ErrorsAndUserInput>()
        ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue(errorsAndUserInput)

        const requestHandler = bookingController.new()

        await requestHandler(request, response, next)

        expect(response.render).toHaveBeenCalledWith('bookings/find', {
          premisesId,
          pageHeading: 'Make a booking - find someone by CRN',
          errors: errorsAndUserInput.errors,
          errorSummary: errorsAndUserInput.errorSummary,
          ...errorsAndUserInput.userInput,
        })
      })
    })
  })

  describe('create', () => {
    it('given the expected form data, the posting of the booking is successful should redirect to the "confirmation" page', async () => {
      const newBooking = newBookingFactory.build()
      const booking = bookingFactory.build()
      bookingService.create.mockResolvedValue(booking)

      const requestHandler = bookingController.create()

      request = {
        ...request,
        params: { premisesId },
        body: newBooking,
      }

      await requestHandler(request, response, next)

      expect(bookingService.create).toHaveBeenCalledWith(token, premisesId, newBooking)

      expect(response.redirect).toHaveBeenCalledWith(
        paths.bookings.confirm({
          premisesId,
          bookingId: booking.id,
        }),
      )
    })

    it('should render the page with errors when the API returns an error', async () => {
      const booking = bookingFactory.build()
      bookingService.create.mockResolvedValue(booking)
      const flashSpy = jest.fn().mockImplementation(() => ['some-crn'])

      const requestHandler = bookingController.create()

      request = {
        ...request,
        params: { premisesId },
        flash: flashSpy,
      }

      const err = new Error()

      bookingService.create.mockImplementation(() => {
        throw err
      })

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.bookings.new({
          premisesId,
        }),
      )
    })
  })

  describe('confirm', () => {
    it('renders the form with the details from the booking that is requested', async () => {
      const booking = bookingFactory.build({
        arrivalDate: new Date('07/27/22').toISOString(),
        departureDate: new Date('07/28/22').toISOString(),
      })
      const overcapacityMessage = 'The premises is over capacity for the period January 1st 2023 to Feburary 3rd 2023'
      premisesService.getOvercapacityMessage.mockResolvedValue([overcapacityMessage])
      bookingService.find.mockResolvedValue(booking)

      const requestHandler = bookingController.confirm()

      request = {
        ...request,
        params: {
          premisesId,
          bookingId: booking.id,
        },
      }

      await requestHandler(request, response, next)

      expect(bookingService.find).toHaveBeenCalledWith(token, premisesId, booking.id)
      expect(response.render).toHaveBeenCalledWith('bookings/confirm', {
        premisesId,
        pageHeading: 'Booking complete',
        bookingId: booking.id,
        ...booking,
        infoMessages: [overcapacityMessage],
      })
    })
  })
})
