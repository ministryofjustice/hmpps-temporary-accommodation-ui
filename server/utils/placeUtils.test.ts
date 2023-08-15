import { assessmentFactory, placeContextFactory } from '../testutils/factories'
import { addPlaceContext, createPlaceContext } from './placeUtils'
import { appendQueryString } from './utils'

jest.mock('./utils')

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

  describe('addPlaceContext', () => {
    it('returns a path with a reference to the given place context', () => {
      const placeContext = placeContextFactory.build({
        assessment: assessmentFactory.build({
          id: 'some-id',
        }),
      })

      ;(appendQueryString as jest.MockedFunction<typeof appendQueryString>).mockImplementation(
        path => `${path}?some-query-string`,
      )

      expect(addPlaceContext('/some/path', placeContext)).toEqual('/some/path?some-query-string')
      expect(appendQueryString).toHaveBeenCalledWith('/some/path', { placeContextAssessmentId: 'some-id' })
    })

    it('returns the original path if the place context is undefinded', () => {
      expect(addPlaceContext('/some/path', undefined)).toEqual('/some/path')
      expect(appendQueryString).not.toHaveBeenCalled()
    })
  })
})
