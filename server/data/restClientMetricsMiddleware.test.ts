import superagent from 'superagent'
import nock from 'nock'
import { restClientMetricsMiddleware, normalizePath, requestHistogram } from './restClientMetricsMiddleware'

describe('restClientMetricsMiddleware', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('normalizePath', () => {
    it('removes the query params from the URL path', () => {
      const result = normalizePath('https://httpbin.org/?foo=bar')
      expect(result).toBe('/')
    })

    it('normalises recall ids', () => {
      const result = normalizePath(
        'https://manage-recalls-dev.hmpps.service.justice.gov.uk/recalls/15e4cccf-cc7b-4946-aa22-a82086735ec2/view-recall',
      )
      expect(result).toBe('/recalls/#val/view-recall')
    })

    it('normalises nomis ids', () => {
      const result = normalizePath('https://manage-recalls-dev.hmpps.service.justice.gov.uk/prisoner/A7826DY')
      expect(result).toBe('/prisoner/#val')
    })
  })

  describe('request timers', () => {
    it('times the whole request', async () => {
      const fakeApi = nock('https://httpbin.org/')
      fakeApi.get('/', '').reply(200)
      const requestHistogramLabelsSpy = jest.spyOn(requestHistogram, 'labels').mockReturnValue(requestHistogram)
      const requestHistogramStartSpy = jest.spyOn(requestHistogram, 'observe')

      let code: number

      await superagent
        .get('https://httpbin.org/')
        .use(restClientMetricsMiddleware)
        .set('accept', 'json')
        .then(res => {
          code = res.statusCode
        })

      expect(code).toBe(200)
      expect(requestHistogramLabelsSpy).toHaveBeenCalledTimes(1)
      expect(requestHistogramLabelsSpy).toHaveBeenCalledWith('httpbin.org', 'GET', '/', '200')
      expect(requestHistogramStartSpy).toHaveBeenCalledTimes(1)
      nock.cleanAll()
    })
  })
})
