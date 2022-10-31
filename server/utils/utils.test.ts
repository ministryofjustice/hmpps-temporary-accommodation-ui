import type { SummaryListItem } from '@approved-premises/ui'
import { SessionDataError } from './errors'
import applicationFactory from '../testutils/factories/application'
import {
  convertToTitleCase,
  initialiseName,
  retrieveQuestionResponseFromApplication,
  removeBlankSummaryListItems,
  mapApiPersonRisksForUi,
  unique,
} from './utils'
import risksFactory from '../testutils/factories/risks'
import { DateFormats } from './dateUtils'

describe('convert to title case', () => {
  it.each([
    [null, null, ''],
    ['empty string', '', ''],
    ['Lower case', 'robert', 'Robert'],
    ['Upper case', 'ROBERT', 'Robert'],
    ['Mixed case', 'RoBErT', 'Robert'],
    ['Multiple words', 'RobeRT SMiTH', 'Robert Smith'],
    ['Leading spaces', '  RobeRT', '  Robert'],
    ['Trailing spaces', 'RobeRT  ', 'Robert  '],
    ['Hyphenated', 'Robert-John SmiTH-jONes-WILSON', 'Robert-John Smith-Jones-Wilson'],
  ])('%s convertToTitleCase(%s, %s)', (_: string, a: string, expected: string) => {
    expect(convertToTitleCase(a)).toEqual(expected)
  })
})

describe('initialise name', () => {
  it.each([
    [null, null, null],
    ['Empty string', '', null],
    ['One word', 'robert', 'r. robert'],
    ['Two words', 'Robert James', 'R. James'],
    ['Three words', 'Robert James Smith', 'R. Smith'],
    ['Double barrelled', 'Robert-John Smith-Jones-Wilson', 'R. Smith-Jones-Wilson'],
  ])('%s initialiseName(%s, %s)', (_: string, a: string, expected: string) => {
    expect(initialiseName(a)).toEqual(expected)
  })
})

describe('retrieveQuestionResponseFromApplication', () => {
  it("throws a SessionDataError if the property doesn't exist", () => {
    const application = applicationFactory.build()
    expect(() => retrieveQuestionResponseFromApplication(application, 'basic-information', '')).toThrow(
      SessionDataError,
    )
  })

  it('returns the property if it does exist and a question is not provided', () => {
    const application = applicationFactory.build({
      data: {
        'basic-information': { 'my-page': { myPage: 'no' } },
      },
    })

    const questionResponse = retrieveQuestionResponseFromApplication(application, 'basic-information', 'myPage')
    expect(questionResponse).toBe('no')
  })

  it('returns the property if it does exist and a question is provided', () => {
    const application = applicationFactory.build({
      data: {
        'basic-information': { 'my-page': { questionResponse: 'no' } },
      },
    })

    const questionResponse = retrieveQuestionResponseFromApplication(
      application,
      'basic-information',
      'myPage',
      'questionResponse',
    )
    expect(questionResponse).toBe('no')
  })
})

describe('removeBlankSummaryListItems', () => {
  it('removes all blank and undefined items', () => {
    const items = [
      {
        key: {
          text: 'Names',
        },
        value: {
          text: 'Name',
        },
      },
      {
        key: {
          text: 'CRN',
        },
        value: {
          text: '',
        },
      },
      {
        key: {
          text: 'Date of Birth',
        },
        value: {
          text: undefined,
        },
      },
      {
        key: {
          text: 'NOMS Number',
        },
        value: {
          html: '<strong>Some HTML</strong>',
        },
      },
      {
        key: {
          text: 'Nationality',
        },
        value: {
          html: undefined,
        },
      },
      {
        key: {
          text: 'Religion',
        },
        value: {
          html: '',
        },
      },
    ] as Array<SummaryListItem>

    expect(removeBlankSummaryListItems(items)).toEqual([
      {
        key: {
          text: 'Names',
        },
        value: {
          text: 'Name',
        },
      },
      {
        key: {
          text: 'NOMS Number',
        },
        value: {
          html: '<strong>Some HTML</strong>',
        },
      },
    ])
  })
})

describe('mapApiPersonRiskForUI', () => {
  it('maps the PersonRisks from the API into a shape thats useful for the UI', () => {
    const risks = risksFactory.build()
    const actual = mapApiPersonRisksForUi(risks)
    expect(actual).toEqual({
      crn: risks.crn,
      flags: risks.flags.value,
      mappa: {
        lastUpdated: DateFormats.isoDateToUIDate(risks.mappa.value.lastUpdated),
        level: 'CAT 2 / LEVEL 1',
      },
      roshRisks: {
        lastUpdated: DateFormats.isoDateToUIDate(risks.roshRisks.value.lastUpdated),
        overallRisk: risks.roshRisks.value.overallRisk,
        riskToChildren: risks.roshRisks.value.riskToChildren,
        riskToKnownAdult: risks.roshRisks.value.riskToKnownAdult,
        riskToPublic: risks.roshRisks.value.riskToPublic,
        riskToStaff: risks.roshRisks.value.riskToStaff,
      },
      tier: {
        lastUpdated: DateFormats.isoDateToUIDate(risks.tier.value.lastUpdated),
        level: risks.tier.value.level,
      },
    })
  })

  it('handles the case where roshRisks lastUpdated is null', () => {
    const risks = risksFactory.build()
    risks.roshRisks.value.lastUpdated = null

    const actual = mapApiPersonRisksForUi(risks)

    expect(actual).toEqual({
      crn: risks.crn,
      flags: risks.flags.value,
      mappa: {
        lastUpdated: DateFormats.isoDateToUIDate(risks.mappa.value.lastUpdated),
        level: 'CAT 2 / LEVEL 1',
      },
      roshRisks: {
        lastUpdated: '',
        overallRisk: risks.roshRisks.value.overallRisk,
        riskToChildren: risks.roshRisks.value.riskToChildren,
        riskToKnownAdult: risks.roshRisks.value.riskToKnownAdult,
        riskToPublic: risks.roshRisks.value.riskToPublic,
        riskToStaff: risks.roshRisks.value.riskToStaff,
      },
      tier: {
        lastUpdated: DateFormats.isoDateToUIDate(risks.tier.value.lastUpdated),
        level: risks.tier.value.level,
      },
    })
  })
})

describe('unique', () => {
  it('returns unique elements of an array, compared by ID', () => {
    const input = [
      {
        id: 'abc',
      },
      {
        id: 'xyz',
      },
      {
        id: 'abc',
      },
      {
        id: 'xyz',
      },
      {
        id: 'xyz',
      },
      {
        id: 'efg',
      },
    ]

    expect(unique(input)).toEqual([
      {
        id: 'abc',
      },
      {
        id: 'xyz',
      },
      {
        id: 'efg',
      },
    ])
  })
})
