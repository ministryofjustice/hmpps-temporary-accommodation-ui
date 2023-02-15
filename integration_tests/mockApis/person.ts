import { SuperAgentRequest } from 'superagent'
import { readFileSync } from 'fs'
import path from 'path'
import qs from 'qs'

import type {
  Person,
  PersonRisks,
  PrisonCaseNote,
  Adjudication,
  ActiveOffence,
  OASysSection,
  OASysSections,
  Document,
} from '@approved-premises/api'

import { stubFor, getMatchingRequests } from '../../wiremock'

export default {
  stubFindPerson: (args: { person: Person }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: `/people/search?crn=${args.person.crn}`,
      },
      response: {
        status: 201,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.person,
      },
    }),
  stubPersonNotFound: (args: { person: Person }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: `/people/search?crn=${args.person.crn}`,
      },
      response: {
        status: 404,
      },
    }),
  stubPersonRisks: (args: { person: Person; risks: PersonRisks }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: `/people/${args.person.crn}/risks`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.risks,
      },
    }),
  stubPersonOffences: (args: { person: Person; offences: Array<ActiveOffence> }): SuperAgentRequest =>
    stubFor({
      request: {
        method: 'GET',
        url: `/people/${args.person.crn}/offences`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.offences,
      },
    }),
  verifyFindPerson: async (args: { person: Person }) =>
    (
      await getMatchingRequests({
        method: 'GET',
        url: `/people/search?crn=${args.person.crn}`,
      })
    ).body.requests,

  stubPrisonCaseNotes: (args: { person: Person; prisonCaseNotes: Array<PrisonCaseNote> }) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/people/${args.person.crn}/prison-case-notes`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.prisonCaseNotes,
      },
    }),

  stubAdjudications: (args: { person: Person; adjudications: Array<Adjudication> }) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/people/${args.person.crn}/adjudications`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.adjudications,
      },
    }),

  stubOasysSelection: (args: { person: Person; oasysSelection: Array<OASysSection> }) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/people/${args.person.crn}/oasys/selection`,
      },

      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.oasysSelection,
      },
    }),

  stubOasysSections: (args: { person: Person; oasysSections: OASysSections }) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/people/${args.person.crn}/oasys/sections`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.oasysSections,
      },
    }),

  stubOasysSectionsWithSelectedSections: (args: {
    person: Person
    oasysSections: OASysSections
    selectedSections: Array<number>
  }) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/people/${args.person.crn}/oasys/sections?${qs.stringify(
          { 'selected-sections': args.selectedSections },
          { encode: false, indices: false },
        )}`,
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: args.oasysSections,
      },
    }),

  stubPersonDocument: (args: { person: Person; document: Document }) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/documents/${args.person.crn}/${args.document.id}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/octet-stream',
          'content-disposition': `attachment; filename=${args.document.fileName}`,
        },
        base64Body: readFileSync(path.resolve(__dirname, '..', '..', 'cypress_shared', 'fixtures', 'document.pdf'), {
          encoding: 'base64',
        }),
      },
    }),
}
