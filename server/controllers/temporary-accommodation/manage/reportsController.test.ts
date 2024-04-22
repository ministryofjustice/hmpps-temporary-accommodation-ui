import { DeepMocked, createMock } from '@golevelup/ts-jest'
import type { NextFunction, Request, Response } from 'express'
import { ReportsController } from '.'
import { CallConfig } from '../../../data/restClient'
import paths from '../../../paths/temporary-accommodation/manage'
import ReportService from '../../../services/reportService'
import { probationRegionFactory, userFactory } from '../../../testutils/factories'
import extractCallConfig from '../../../utils/restUtils'
import { filterProbationRegions } from '../../../utils/userUtils'
import { getYearsSince, monthsArr } from '../../../utils/dateUtils'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput, insertGenericError } from '../../../utils/validation'

jest.mock('../../../utils/validation')
jest.mock('../../../utils/restUtils')
jest.mock('../../../utils/userUtils', () => {
  const originalUserUtils = jest.requireActual('../../../utils/userUtils')

  return {
    ...originalUserUtils,
    filterProbationRegions: jest.fn(),
  }
})
jest.mock('../../../utils/dateUtils')

describe('ReportsController', () => {
  const callConfig = { token: 'some-call-config-token' } as CallConfig

  let request: Request
  let response: DeepMocked<Response> = createMock<Response>({})

  const next: DeepMocked<NextFunction> = createMock<NextFunction>({})

  const reportService = createMock<ReportService>({})

  const reportsController = new ReportsController(reportService)

  beforeEach(() => {
    jest.clearAllMocks()
    request = createMock<Request>({
      session: {
        probationRegion: probationRegionFactory.build(),
      },
    })
    ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)
  })

  describe('new', () => {
    it('renders the form with filtered regions', async () => {
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

      reportService.getReferenceData.mockResolvedValue({
        probationRegions: unfilteredRegions,
      })
      ;(filterProbationRegions as jest.MockedFunction<typeof filterProbationRegions>).mockReturnValue(filteredRegions)

      const requestHandler = reportsController.new()
      ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })
      ;(getYearsSince as jest.Mock).mockReturnValue([])

      response = createMock<Response>({
        locals: { user: userFactory.build() },
      })

      await requestHandler(request, response, next)

      expect(reportService.getReferenceData).toHaveBeenCalledWith(callConfig)
      expect(filterProbationRegions).toHaveBeenCalledWith(unfilteredRegions, request)

      expect(response.render).toHaveBeenCalledWith('temporary-accommodation/reports/new', {
        allProbationRegions: filteredRegions,
        errors: {},
        errorSummary: [],
        probationRegionId: request.session.probationRegion.id,
        months: monthsArr,
        years: [],
      })
    })

    describe('when the user is a reporter', () => {
      it('renders the form with all reportable regions', async () => {
        const regionsReferenceData = [
          probationRegionFactory.build({
            name: 'region-1',
          }),
          probationRegionFactory.build({
            name: 'region-2',
          }),
          probationRegionFactory.build({
            name: 'National',
          }),
        ]

        reportService.getReferenceData.mockResolvedValue({
          probationRegions: regionsReferenceData,
        })

        const requestHandler = reportsController.new()
        ;(fetchErrorsAndUserInput as jest.Mock).mockReturnValue({ errors: {}, errorSummary: [], userInput: {} })
        ;(getYearsSince as jest.Mock).mockReturnValue([])

        response = createMock<Response>({
          locals: { user: userFactory.build({ roles: ['reporter'] }) },
        })

        await requestHandler(request, response, next)

        expect(reportService.getReferenceData).toHaveBeenCalledWith(callConfig)
        expect(filterProbationRegions).not.toHaveBeenCalled()

        expect(response.render).toHaveBeenCalledWith('temporary-accommodation/reports/new', {
          allProbationRegions: [
            {
              id: 'all',
              name: 'All regions',
            },
            regionsReferenceData[0],
            regionsReferenceData[1],
          ],
          errors: {},
          errorSummary: [],
          probationRegionId: request.session.probationRegion.id,
          months: monthsArr,
          years: [],
        })
      })
    })
  })

  describe('create', () => {
    it('creates a booking report for the probation region and pipes it into the express response', async () => {
      const requestHandler = reportsController.create()

      request.body = {
        probationRegionId: 'probation-region',
        month: '6',
        year: '2024',
        reportType: 'bookings',
      }

      await requestHandler(request, response, next)

      expect(reportService.pipeReportForProbationRegion).toHaveBeenCalledWith(
        callConfig,
        response,
        'probation-region',
        '6',
        '2024',
        'bookings',
      )
    })

    it('renders with errors if the probation region is not specified', async () => {
      const requestHandler = reportsController.create()

      request.body = {
        month: '2',
        year: '2023',
        reportType: 'occupancy',
      }

      await requestHandler(request, response, next)

      expect(insertGenericError).toHaveBeenCalledWith(new Error(), 'probationRegionId', 'empty')
      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        (insertGenericError as jest.MockedFunction<typeof insertGenericError>).mock.lastCall[0],
        paths.reports.new({}),
      )
    })

    it('renders with errors if the month is not specified', async () => {
      const requestHandler = reportsController.create()

      request.body = {
        probationRegionId: 'probation-region',
        year: '2023',
        reportType: 'occupancy',
      }

      await requestHandler(request, response, next)

      expect(insertGenericError).toHaveBeenCalledWith(new Error(), 'month', 'empty')
      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        (insertGenericError as jest.MockedFunction<typeof insertGenericError>).mock.lastCall[0],
        paths.reports.new({}),
      )
    })

    it('renders with errors if the year is not specified', async () => {
      const requestHandler = reportsController.create()

      request.body = {
        probationRegionId: 'probation-region',
        month: '3',
        reportType: 'occupancy',
      }

      await requestHandler(request, response, next)

      expect(insertGenericError).toHaveBeenCalledWith(new Error(), 'year', 'empty')
      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        (insertGenericError as jest.MockedFunction<typeof insertGenericError>).mock.lastCall[0],
        paths.reports.new({}),
      )
    })

    it('renders with all errors if no fields are completed', async () => {
      const requestHandler = reportsController.create()

      request.body = {
        probationRegionId: '',
        month: '',
        year: '',
        reportType: 'occupancy',
      }

      await requestHandler(request, response, next)

      expect(insertGenericError).toHaveBeenCalledTimes(3)
      expect(insertGenericError).toHaveBeenNthCalledWith(1, new Error(), 'probationRegionId', 'empty')
      expect(insertGenericError).toHaveBeenNthCalledWith(2, new Error(), 'month', 'empty')
      expect(insertGenericError).toHaveBeenNthCalledWith(3, new Error(), 'year', 'empty')

      expect(catchValidationErrorOrPropogate).toHaveBeenCalledWith(
        request,
        response,
        (insertGenericError as jest.MockedFunction<typeof insertGenericError>).mock.lastCall[0],
        paths.reports.new({}),
      )
    })
  })
})
