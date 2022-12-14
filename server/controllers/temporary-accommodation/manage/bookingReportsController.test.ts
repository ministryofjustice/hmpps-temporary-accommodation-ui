import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'
import paths from '../../../paths/temporary-accommodation/manage'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from '../../../utils/validation'
import { BookingReportsController } from '.'
import BookingReportService from '../../../services/bookingReportService'

jest.mock('../../../utils/validation')

describe('BookingReportsController', () => {
  const token = 'SOME_TOKEN'

  let request: DeepMocked<Request>

  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const bookingReportService = createMock<BookingReportService>({})

  const bookingReportsController = new BookingReportsController(bookingReportService)

  beforeEach(() => {
    request = createMock<Request>({ user: { token } })
  })

  describe('new', () => {
    it('renders the form', async () => {
      bookingReportService.getReferenceData.mockResolvedValue({ probationRegions: [] })

      const requestHandler = bookingReportsController.new()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      await requestHandler(request, response, next)

      expect(bookingReportService.getReferenceData).toHaveBeenCalledWith(token)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/reports/bookings/new', {
        allProbationRegions: [],
        errors: {},
        errorSummary: [],
      })
    })
  })

  describe('create', () => {
    it('when the probationRegionId is empty, creates a booking report and pipes it into the express response', async () => {
      const requestHandler = bookingReportsController.create()

      request.body = {
        probationRegionId: '',
      }

      await requestHandler(request, response, next)

      expect(bookingReportService.pipeBookings).toHaveBeenCalledWith(token, response)
    })

    it('when the probationRegionId is not empty, creates a booking report for the probation region and pipes it into the express response', async () => {
      const requestHandler = bookingReportsController.create()

      request.body = {
        probationRegionId: 'probation-region',
      }

      await requestHandler(request, response, next)

      expect(bookingReportService.pipeBookingsForProbationRegion).toHaveBeenCalledWith(
        token,
        response,
        'probation-region',
      )
    })

    it('renders with errors if the API returns an error', async () => {
      const requestHandler = bookingReportsController.create()

      request.body = {
        probationRegionId: '',
      }

      const err = new Error()
      bookingReportService.pipeBookings.mockImplementation(() => {
        throw err
      })

      await requestHandler(request, response, next)

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        err,
        paths.reports.bookings.new({}),
      )
    })
  })
})
