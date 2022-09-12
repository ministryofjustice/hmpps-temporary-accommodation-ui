import { Request, Response } from 'express'
import { createMock } from '@golevelup/ts-jest'

import type { ErrorMessages, ErrorSummary } from 'approved-premises'
import { SanitisedError } from '../sanitisedError'
import { catchValidationErrorOrPropogate, catchAPIErrorOrPropogate, fetchErrorsAndUserInput } from './validation'
import errorLookups from '../i18n/en/errors.json'
import { ValidationError, TasklistAPIError } from './errors'

jest.mock('../i18n/en/errors.json', () => {
  return {
    crn: {
      blank: 'You must enter a CRN',
    },
    expectedArrivalDate: {
      blank: 'You must enter a valid arrival date',
    },
  }
})

describe('catchValidationErrorOrPropogate', () => {
  const request = createMock<Request>({})
  const response = createMock<Response>()

  const expectedErrors = {
    crn: { text: errorLookups.crn.blank, attributes: { 'data-cy-error-crn': true } },
    expectedArrivalDate: {
      text: errorLookups.expectedArrivalDate.blank,
      attributes: { 'data-cy-error-expectedArrivalDate': true },
    },
  }

  const expectedErrorSummary = [
    { text: errorLookups.crn.blank, href: '#crn' },
    { text: errorLookups.expectedArrivalDate.blank, href: '#expectedArrivalDate' },
  ]

  beforeEach(() => {
    request.body = {
      some: 'field',
    }
  })

  it('sets the errors and request body as flash messages and redirects back to the form', () => {
    const error = createMock<SanitisedError>({
      data: {
        'invalid-params': [
          {
            propertyName: 'crn',
            errorType: 'blank',
          },
          {
            propertyName: 'expectedArrivalDate',
            errorType: 'blank',
          },
        ],
      },
    })

    catchValidationErrorOrPropogate(request, response, error, 'some/url')

    expect(request.flash).toHaveBeenCalledWith('errors', expectedErrors)
    expect(request.flash).toHaveBeenCalledWith('errorSummary', expectedErrorSummary)
    expect(request.flash).toHaveBeenCalledWith('userInput', request.body)

    expect(response.redirect).toHaveBeenCalledWith('some/url')
  })

  it('gets errors from a ValidationError type', () => {
    const error = createMock<ValidationError>({
      data: [
        {
          propertyName: 'crn',
          errorType: 'blank',
        },
        {
          propertyName: 'expectedArrivalDate',
          errorType: 'blank',
        },
      ],
    })

    catchValidationErrorOrPropogate(request, response, error, 'some/url')

    expect(request.flash).toHaveBeenCalledWith('errors', expectedErrors)
    expect(request.flash).toHaveBeenCalledWith('errorSummary', expectedErrorSummary)
    expect(request.flash).toHaveBeenCalledWith('userInput', request.body)

    expect(response.redirect).toHaveBeenCalledWith('some/url')
  })

  it('throws the error if the error is not the type we expect', () => {
    const err = new Error()
    expect(() => catchValidationErrorOrPropogate(request, response, err, 'some/url')).toThrowError(err)
  })
})

describe('catchAPIErrorOrPropogate', () => {
  const request = createMock<Request>({ headers: { referer: 'foo/bar' } })
  const response = createMock<Response>()

  it('populates the error and redirects to the previous page if the API finds an error', () => {
    const error = new TasklistAPIError('some message', 'field')

    catchAPIErrorOrPropogate(request, response, error)

    expect(request.flash).toHaveBeenCalledWith('errors', {
      crn: { text: error.message, attributes: { 'data-cy-error-field': true } },
    })
    expect(request.flash).toHaveBeenCalledWith('errorSummary', [
      {
        text: error.message,
        href: `#${error.field}`,
      },
    ])

    expect(response.redirect).toHaveBeenCalledWith(request.headers.referer)
  })
})

describe('fetchErrorsAndUserInput', () => {
  const request = createMock<Request>({})

  let errors: ErrorMessages
  let userInput: Record<string, unknown>
  let errorSummary: ErrorSummary

  beforeEach(() => {
    ;(request.flash as jest.Mock).mockImplementation((message: string) => {
      return {
        errors: [errors],
        userInput: [userInput],
        errorSummary,
      }[message]
    })
  })

  it('returns default values if there is nothing present', () => {
    const result = fetchErrorsAndUserInput(request)

    expect(result).toEqual({ errors: {}, errorSummary: [], userInput: {} })
  })

  it('fetches the values from the flash', () => {
    errors = createMock<ErrorMessages>()
    errorSummary = createMock<ErrorSummary>()
    userInput = { foo: 'bar' }

    const result = fetchErrorsAndUserInput(request)

    expect(result).toEqual({ errors, errorSummary, userInput })
  })
})
