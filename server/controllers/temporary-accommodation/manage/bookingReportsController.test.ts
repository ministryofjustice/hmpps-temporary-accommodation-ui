import type { Request, Response, NextFunction } from 'express'
import { createMock, DeepMocked } from '@golevelup/ts-jest'
import paths from '../../../paths/temporary-accommodation/manage'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput, insertGenericError } from '../../../utils/validation'
import { BookingReportsController } from '.'
import BookingReportService from '../../../services/bookingReportService'
import { CallConfig } from '../../../data/restClient'
import extractCallConfig from '../../../utils/restUtils'
import probationRegionFactory from '../../../testutils/factories/probationRegion'
import filterProbationRegions from '../../../utils/userUtils'

jest.mock('../../../utils/validation')
jest.mock('../../../utils/restUtils')
jest.mock('../../../utils/userUtils')

describe('BookingReportsController', () => {
  const callConfig = { token: 'some-call-config-token' } as CallConfig

  let request: Request

  const response: DeepMocked<Response> = createMock<Response>({})
  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const bookingReportService = createMock<BookingReportService>({})

  const bookingReportsController = new BookingReportsController(bookingReportService)

  beforeEach(() => {
    request = createMock<Request>({
      session: {
        probationRegion: probationRegionFactory.build(),
      },
    })
    ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)
  })

  describe('new', () => {
    it('renders the form', async () => {
      const unfilteredRegions = [
        probationRegionFactory.build({
          name: 'unfiltered-region',
        }),
      ]

      const filteredRegions = [
        probationRegionFactory.build({
          name: 'filtered-region',
        }),
      ]

      bookingReportService.getReferenceData.mockResolvedValue({
        probationRegions: unfilteredRegions,
      })
      ;(filterProbationRegions as jest.MockedFunction<typeof filterProbationRegions>).mockReturnValue(filteredRegions)

      const requestHandler = bookingReportsController.new()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })

      await requestHandler(request, response, next)

      expect(bookingReportService.getReferenceData).toHaveBeenCalledWith(callConfig)
      expect(filterProbationRegions).toHaveBeenCalledWith(unfilteredRegions, request)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/reports/bookings/new', {
        allProbationRegions: filteredRegions,
        errors: {},
        errorSummary: [],
        probationRegionId: request.session.probationRegion.id,
      })
    })
  })

  describe('create', () => {
    it('creates a booking report for the probation region and pipes it into the express response', async () => {
      const requestHandler = bookingReportsController.create()

      request.body = {
        probationRegionId: 'probation-region',
      }

      await requestHandler(request, response, next)

      expect(bookingReportService.pipeBookingsForProbationRegion).toHaveBeenCalledWith(
        callConfig,
        response,
        'probation-region',
      )
    })

    it('renders with errors if the API returns an error', async () => {
      const requestHandler = bookingReportsController.create()

      request.body = {
        probationRegionId: 'some-region',
      }

      const err = new Error()
      bookingReportService.pipeBookingsForProbationRegion.mockImplementation(() => {
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

    it('renders with errors if the probation region is not specified', async () => {
      const requestHandler = bookingReportsController.create()

      request.body = {}

      await requestHandler(request, response, next)

      expect(insertGenericError).toHaveBeenCalledWith(new Error(), 'probationRegionId', 'empty')
      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        (insertGenericError as jest.MockedFunction<typeof insertGenericError>).mock.lastCall[0],
        paths.reports.bookings.new({}),
      )
    })
  })
})
