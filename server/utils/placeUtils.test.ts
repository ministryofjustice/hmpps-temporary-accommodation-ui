import { createMock } from '@golevelup/ts-jest'
import { Request, Response } from 'express'
import { CallConfig } from '../data/restClient'
import type { AssessmentsService } from '../services'
import { assessmentFactory, placeContextFactory } from '../testutils/factories'
import {
  addPlaceContext,
  addPlaceContextFromAssessmentId,
  clearPlaceContext,
  createPlaceContext,
  preservePlaceContext,
  updatePlaceContextWithArrivalDate,
} from './placeUtils'
import extractCallConfig from './restUtils'
import { appendQueryString } from './utils'

jest.mock('./utils')
jest.mock('./restUtils')

describe('placeUtils', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('createPlaceContext', () => {
    it('returns a PlaceContext type object', () => {
      const assessment = assessmentFactory.build()

      expect(createPlaceContext(assessment)).toEqual({ assessment })
    })
  })

  describe('updatePlaceContextWithArrivalDate', () => {
    it('updates our PlaceContext', () => {
      const res = createMock<Response>({
        locals: {},
      })

      const placeContext = placeContextFactory.build()

      const result = updatePlaceContextWithArrivalDate(res, placeContext, '2024-03-01')

      expect(result).toEqual({ ...placeContext, arrivalDate: '2024-03-01' })
      expect(res.locals.placeContext).toEqual({ ...placeContext, arrivalDate: '2024-03-01' })
    })
  })

  describe('addPlaceContext', () => {
    it('returns a path with a reference to the given place context', () => {
      const placeContext = placeContextFactory.build({
        assessment: assessmentFactory.build({
          id: 'some-id',
        }),
        arrivalDate: '2024-01-07',
      })

      ;(appendQueryString as jest.MockedFunction<typeof appendQueryString>).mockImplementation(
        path => `${path}?some-query-string`,
      )

      expect(addPlaceContext('/some/path', placeContext)).toEqual('/some/path?some-query-string')
      expect(appendQueryString).toHaveBeenCalledWith('/some/path', {
        placeContextAssessmentId: 'some-id',
        placeContextArrivalDate: '2024-01-07',
      })
    })

    it('returns the original path if the place context is undefinded', () => {
      expect(addPlaceContext('/some/path', undefined)).toEqual('/some/path')
      expect(appendQueryString).not.toHaveBeenCalled()
    })
  })

  describe('addPlaceContextFromAssessmentId', () => {
    it('returns a path with a place context derived from the given assessment ID', () => {
      ;(appendQueryString as jest.MockedFunction<typeof appendQueryString>).mockImplementation(
        path => `${path}?some-query-string`,
      )

      expect(addPlaceContextFromAssessmentId('/some/path', 'some-id')).toEqual('/some/path?some-query-string')
      expect(appendQueryString).toHaveBeenCalledWith('/some/path', {
        placeContextAssessmentId: 'some-id',
      })
    })
  })

  describe('preservePlaceContext', () => {
    it('uses the assessment service to set and return place context data', async () => {
      const callConfig = { token: 'some-call-config-token' } as CallConfig

      ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)

      const assessmentService = createMock<AssessmentsService>()

      const assessment = assessmentFactory.build({ status: 'ready_to_place' })
      assessmentService.findAssessment.mockResolvedValue(assessment)

      const req = createMock<Request>({
        query: { placeContextAssessmentId: 'some-assessment-id', placeContextArrivalDate: '2024-05-01' },
      })
      const res = createMock<Response>({
        locals: {},
      })

      const result = await preservePlaceContext(req, res, assessmentService)

      expect(result).toEqual({ assessment, arrivalDate: '2024-05-01' })
      expect(res.locals.placeContext).toEqual({ assessment, arrivalDate: '2024-05-01' })
      expect(assessmentService.findAssessment).toHaveBeenCalledWith(callConfig, 'some-assessment-id')
    })

    it('returns undefined when the assessment service throws an error', async () => {
      const callConfig = { token: 'some-call-config-token' } as CallConfig

      ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)

      const assessmentService = createMock<AssessmentsService>()

      assessmentService.findAssessment.mockRejectedValue(new Error())

      const req = createMock<Request>({
        query: { placeContextAssessmentId: 'some-assessment-id' },
      })
      const res = createMock<Response>({
        locals: {},
      })

      const result = await preservePlaceContext(req, res, assessmentService)

      expect(result).toEqual(undefined)
      expect(res.locals.placeContext).toEqual(undefined)
      expect(assessmentService.findAssessment).toHaveBeenCalledWith(callConfig, 'some-assessment-id')
    })

    it('returns undefined when the assessment is not ready to place', async () => {
      const callConfig = { token: 'some-call-config-token' } as CallConfig

      ;(extractCallConfig as jest.MockedFn<typeof extractCallConfig>).mockReturnValue(callConfig)

      const assessmentService = createMock<AssessmentsService>()

      const assessment = assessmentFactory.build({ status: 'rejected' })
      assessmentService.findAssessment.mockResolvedValue(assessment)

      const req = createMock<Request>({
        query: { placeContextAssessmentId: 'some-assessment-id', placeContextArrivalDate: '2024-05-01' },
      })
      const res = createMock<Response>({
        locals: {},
      })

      const result = await preservePlaceContext(req, res, assessmentService)

      expect(result).toEqual(undefined)
      expect(res.locals.placeContext).toEqual(undefined)
      expect(assessmentService.findAssessment).toHaveBeenCalledWith(callConfig, 'some-assessment-id')
    })

    it('does nothing when the place context assessment ID is not set in the query parameters', async () => {
      const assessmentService = createMock<AssessmentsService>()

      const req = createMock<Request>({
        query: {},
      })
      const res = createMock<Response>({
        locals: {},
      })

      const result = await preservePlaceContext(req, res, assessmentService)

      expect(result).toEqual(undefined)
      expect(res.locals.placeContext).toEqual(undefined)
      expect(assessmentService.findAssessment).not.toHaveBeenCalled()
    })
  })

  describe('clearPlaceContext', () => {
    it('removes any place context date from our query and our response locals', () => {
      const placeContext = placeContextFactory.build()

      const req = createMock<Request>({
        query: {
          placeContextAssessmentId: 'some-assessment-id',
          placeContextArrivalDate: '2024-07-01',
          'other-field': 'other-value',
        },
      })
      const res = createMock<Response>({
        locals: { placeContext, 'other-field': 'other-value' },
      })

      clearPlaceContext(req, res)

      expect(req.query).toEqual({ 'other-field': 'other-value' })
      expect(res.locals).toEqual({ 'other-field': 'other-value' })
    })
  })
})
