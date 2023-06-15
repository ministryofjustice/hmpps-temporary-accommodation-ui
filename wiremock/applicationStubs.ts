import { guidRegex } from './index'

import applicationDataJson from '../cypress_shared/fixtures/applicationData.json'
import paths from '../server/paths/api'
import { applicationFactory, documentFactory } from '../server/testutils/factories'

const completeApplications = applicationFactory.params({ data: applicationDataJson }).buildList(20)

const completeApplicationStubs = completeApplications.flatMap(application => [
  {
    request: {
      method: 'GET',
      urlPath: paths.applications.show({ id: application.id }),
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: application,
    },
  },
  {
    request: {
      method: 'PUT',
      urlPath: paths.applications.show({ id: application.id }),
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: application,
    },
  },
])

const genericApplicationSubs = [
  {
    request: {
      method: 'GET',
      url: paths.applications.index({}),
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: completeApplications,
    },
  },
  {
    request: {
      method: 'GET',
      urlPathPattern: paths.applications.show({ id: guidRegex }),
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: applicationFactory.build(),
    },
  },
  {
    request: {
      method: 'POST',
      urlPath: paths.applications.index({}),
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: applicationFactory.build(),
    },
  },
  {
    request: {
      method: 'PUT',
      urlPathPattern: paths.applications.show({ id: guidRegex }),
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: applicationFactory.build(),
    },
  },
  {
    request: {
      method: 'POST',
      urlPathPattern: paths.applications.submission({ id: guidRegex }),
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: {},
    },
  },
  {
    request: {
      method: 'GET',
      urlPathPattern: paths.applications.documents({ id: guidRegex }),
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: documentFactory.buildList(5),
    },
  },
]

export default [...completeApplicationStubs, ...genericApplicationSubs]
