import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'
import { convertKeyValuePairToCheckBoxItems } from '../../../utils/formUtils'

import EsapPlacementScreening, { esapReasons, esapFactors } from './esapPlacementScreening'
import applicationFactory from '../../../testutils/factories/application'
import personFactory from '../../../testutils/factories/person'

jest.mock('../../../utils/formUtils')

describe('EsapPlacementScreening', () => {
  let application = applicationFactory.build()

  describe('title', () => {
    it('shold add the name of the person', () => {
      const person = personFactory.build({ name: 'John Wayne' })
      application = applicationFactory.build({ person })

      const page = new EsapPlacementScreening({}, application)

      expect(page.title).toEqual('Why does John Wayne require an enhanced security placement?')
    })
  })

  describe('body', () => {
    it('should strip unknown attributes from the body', () => {
      const page = new EsapPlacementScreening(
        { esapReasons: ['secreting'], esapFactors: ['neurodiverse'], something: 'else' },
        application,
      )

      expect(page.body).toEqual({ esapReasons: ['secreting'], esapFactors: ['neurodiverse'] })
    })
  })

  itShouldHavePreviousValue(new EsapPlacementScreening({}, application), 'ap-type')

  describe('next', () => {
    describe('when esapReasons includes `secreting`', () => {
      itShouldHaveNextValue(
        new EsapPlacementScreening({ esapReasons: ['secreting'] }, application),
        'esap-placement-secreting',
      )
    })

    describe('when esapReasons includes `cctv`', () => {
      itShouldHaveNextValue(new EsapPlacementScreening({ esapReasons: ['cctv'] }, application), 'esap-placement-cctv')
    })

    describe('when esapReasons includes `cctv` and `secreting`', () => {
      itShouldHaveNextValue(
        new EsapPlacementScreening({ esapReasons: ['secreting', 'cctv'] }, application),
        'esap-placement-secreting',
      )
    })
  })

  describe('response', () => {
    it('should translate the response correctly', () => {
      const page = new EsapPlacementScreening(
        { esapReasons: ['secreting', 'cctv'], esapFactors: ['neurodiverse', 'complexPersonality'], something: 'else' },
        application,
      )

      expect(page.response()).toEqual({
        'Why does John Wayne require an enhanced security placement?': [
          'History of secreting items relevant to risk and re-offending in their room - requires enhanced room search through the use of body worn technology',
          'History of engaging in behaviours which are most effectively monitored via enhanced CCTV technology - requires enhanced CCTV provision',
        ],
        'Do any of the following factors also apply?': [
          'A diagnosis of autism or neurodiverse traits',
          'A complex personality presentation which has created challenges in the prison and where an AP PIPE is deemed unsuitable',
        ],
      })
    })

    it('should cope with missing factors', () => {
      const page = new EsapPlacementScreening({ esapReasons: ['secreting', 'cctv'] }, application)

      expect(page.response()).toEqual({
        'Why does John Wayne require an enhanced security placement?': [
          'History of secreting items relevant to risk and re-offending in their room - requires enhanced room search through the use of body worn technology',
          'History of engaging in behaviours which are most effectively monitored via enhanced CCTV technology - requires enhanced CCTV provision',
        ],
      })
    })
  })

  describe('errors', () => {
    it('should return an empty object when `esapReasons` is defined', () => {
      const page = new EsapPlacementScreening({ esapReasons: ['secreting', 'cctv'] }, application)
      expect(page.errors()).toEqual({})
    })

    it('should return an error message when `esapReasons` is undefined', () => {
      const page = new EsapPlacementScreening({}, application)
      expect(page.errors()).toEqual({
        esapReasons: 'You must specify why John Wayne requires an enhanced security placement',
      })
    })

    it('should return an error message when `esapReasons` is empty', () => {
      const page = new EsapPlacementScreening({ esapReasons: [] }, application)
      expect(page.errors()).toEqual({
        esapReasons: 'You must specify why John Wayne requires an enhanced security placement',
      })
    })
  })

  describe('reasons', () => {
    it('it calls convertKeyValuePairToCheckBoxItems with the correct values', () => {
      const page = new EsapPlacementScreening(
        { esapReasons: ['secreting', 'cctv'], esapFactors: ['neurodiverse', 'complexPersonality'] },
        application,
      )
      page.reasons()

      expect(convertKeyValuePairToCheckBoxItems).toHaveBeenCalledWith(esapReasons, page.body.esapReasons)
    })
  })

  describe('factors', () => {
    it('it calls convertKeyValuePairToCheckBoxItems with the correct values', () => {
      const page = new EsapPlacementScreening(
        { esapReasons: ['secreting', 'cctv'], esapFactors: ['neurodiverse', 'complexPersonality'] },
        application,
      )
      page.factors()

      expect(convertKeyValuePairToCheckBoxItems).toHaveBeenCalledWith(esapFactors, page.body.esapFactors)
    })
  })
})
