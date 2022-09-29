import type { Task } from '@approved-premises/ui'

import { createMock } from '@golevelup/ts-jest'
import { Request } from 'express'
import applicationFactory from '../testutils/factories/application'
import config from '../config'
import paths from '../paths/apply'
import { taskLink, getTaskStatus, getCompleteSectionCount, getService } from './applicationUtils'

jest.mock('../config')

describe('applicationUtils', () => {
  const task = {
    id: 'type-of-ap',
    title: 'Type of Approved Premises required',
    pages: { foo: 'bar', bar: 'baz' },
  } as Task

  describe('getTaskStatus', () => {
    it('returns a not started tag when the task is incomplete', () => {
      const application = applicationFactory.build()
      expect(getTaskStatus(task, application)).toEqual(
        '<strong class="govuk-tag govuk-tag--grey app-task-list__tag" id="type-of-ap-status">Not started</strong>',
      )
    })

    it('returns a completed tag when the task is complete', () => {
      const application = applicationFactory.build({ data: { 'type-of-ap': { foo: 'bar' } } })

      expect(getTaskStatus(task, application)).toEqual(
        '<strong class="govuk-tag app-task-list__tag" id="type-of-ap-status">Completed</strong>',
      )
    })
  })

  describe('taskLink', () => {
    it('should return a link to a task', () => {
      expect(taskLink(task, 'some-uuid')).toEqual(
        `<a href="${paths.applications.pages.show({
          id: 'some-uuid',
          task: 'type-of-ap',
          page: 'foo',
        })}" aria-describedby="eligibility-type-of-ap" data-cy-task-name="type-of-ap">Type of Approved Premises required</a>`,
      )
    })
  })

  describe('getCompleteSectionCount', () => {
    const sections = [
      {
        title: 'Section 1',
        tasks: [
          {
            id: 'basic-information',
            title: 'Basic Information',
            pages: { foo: 'bar', bar: 'baz' },
          },
          task,
        ],
      },
      {
        title: 'Section 2',
        tasks: [
          {
            id: 'something-else',
            title: 'Something Else',
            pages: { foo: 'bar', bar: 'baz' },
          },
        ],
      },
    ]

    it('returns zero when no sections are completed', () => {
      const application = applicationFactory.build()

      expect(getCompleteSectionCount(sections, application)).toEqual(0)
    })

    it('returns zero when a section is part completed', () => {
      const application = applicationFactory.build({ data: { 'type-of-ap': { foo: 'bar' } } })

      expect(getCompleteSectionCount(sections, application)).toEqual(0)
    })

    it('returns 1 when a section is complete', () => {
      const application = applicationFactory.build({
        data: { 'type-of-ap': { foo: 'bar' }, 'basic-information': { foo: 'baz' } },
      })

      expect(getCompleteSectionCount(sections, application)).toEqual(1)
    })

    it('returns 2 when a both sections are complete', () => {
      const application = applicationFactory.build({
        data: {
          'type-of-ap': { foo: 'bar' },
          'basic-information': { foo: 'baz' },
          'something-else': { foo: 'baz' },
        },
      })

      expect(getCompleteSectionCount(sections, application)).toEqual(2)
    })
  })

  describe('getService', () => {
    beforeAll(() => {
      config.approvedPremisesRootPath = 'approved-premises-root-path'
      config.temporaryAccommodationRootPath = 'temporary-accommodation-root-path'
      config.approvedPremisesSubdomain = 'approved-premises-subdomain'
      config.temporaryAccommodationSubdomain = 'temporary-accommodation-subdomain'
    })

    describe('when the app is configured for approved premises only', () => {
      it("returns 'approved-premises'", () => {
        const request = createMock<Request>()
        config.serviceSignifier = 'approved-premises-only'

        expect(getService(request)).toEqual('approved-premises')
      })
    })

    describe('when the app is configured for temporary accommodation only', () => {
      it("returns 'temporary-accommodation'", () => {
        const request = createMock<Request>()
        config.serviceSignifier = 'temporary-accommodation-only'

        expect(getService(request)).toEqual('temporary-accommodation')
      })
    })

    describe('when the app is configured to use the subdomain as the service signifier', () => {
      it("returns 'approved-premises' when the subdomain matches the approved premises subdomain", () => {
        const request = createMock<Request>()
        request.subdomains = ['approved-premises-subdomain']

        config.serviceSignifier = 'domain'

        expect(getService(request)).toEqual('approved-premises')
      })

      it("returns 'temporary-accommodation' when the subdomain matches the temporary accommodation subdomain", () => {
        const request = createMock<Request>()
        request.subdomains = ['temporary-accommodation-subdomain']

        config.serviceSignifier = 'domain'

        expect(getService(request)).toEqual('temporary-accommodation')
      })
    })

    describe('when the app is configured to use the path as the service signifier', () => {
      it("returns 'approved-premises' when the path matches the approved premises root path", () => {
        const request = createMock<Request>()
        request.path = '/approved-premises-root-path/some-path'

        config.serviceSignifier = 'path'

        expect(getService(request)).toEqual('approved-premises')
      })

      it("returns 'temporary-accommodation' when the subdomain matches the temporary accommodation root path", () => {
        const request = createMock<Request>()
        request.path = '/temporary-accommodation-root-path/some-path'

        config.serviceSignifier = 'path'

        expect(getService(request)).toEqual('temporary-accommodation')
      })
    })
  })
})
