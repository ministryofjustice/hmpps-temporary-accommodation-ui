import { createMock } from '@golevelup/ts-jest'
import { Request, Response } from 'express'

import type { BespokeError, ErrorMessages, ErrorSummary } from '@approved-premises/ui'
import type TaskListPage from '../form-pages/tasklistPage'
import errorLookups from '../i18n/en/errors.json'
import { SanitisedError } from '../sanitisedError'
import { TasklistAPIError, ValidationError } from './errors'
import {
  catchAPIErrorOrPropogate,
  catchValidationErrorOrPropogate,
  clearUserInput,
  fetchErrorsAndUserInput,
  insertBespokeError,
  insertGenericError,
  setUserInput,
  transformErrors,
} from './validation'

jest.mock('../i18n/en/errors.json', () => {
  return {
    generic: {
      crn: {
        empty: 'You must enter a CRN',
      },
      arrivalDate: {
        empty: 'You must enter a valid arrival date',
      },
    },
    bookingCancellation: {
      date: {
        empty: 'You must enter a valid cancellation dae',
      },
    },
  }
})

describe('catchValidationErrorOrPropogate', () => {
  const request = createMock<Request>({})
  const response = createMock<Response>()

  const expectedErrors = {
    crn: { text: errorLookups.generic.crn.empty, attributes: { 'data-cy-error-crn': true } },
    arrivalDate: {
      text: errorLookups.generic.arrivalDate.empty,
      attributes: { 'data-cy-error-arrivalDate': true },
    },
  }

  const expectedErrorSummary = [
    { text: errorLookups.generic.crn.empty, href: '#crn' },
    { text: errorLookups.generic.arrivalDate.empty, href: '#arrivalDate' },
  ]

  beforeEach(() => {
    request.body = {
      some: 'field',
    }
  })

  it('sets errors from invalid params data as flash messages and redirects back to the form', () => {
    const error = createMock<SanitisedError>({
      data: {
        'invalid-params': [
          {
            propertyName: '$.crn',
            errorType: 'empty',
          },
          {
            propertyName: '$.arrivalDate',
            errorType: 'empty',
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

  it('sets errors from bespoke error data as flash messages and redirects back to the form', () => {
    const bespokeErrorSummary = [
      {
        text: 'some-error',
        href: '#someLink',
      },
    ]
    const bespokeErrorTitle = 'Some Error Title'

    const error = createMock<SanitisedError>({
      data: {
        bespokeError: {
          errorSummary: bespokeErrorSummary,
          errorTitle: bespokeErrorTitle,
        },
        'invalid-params': [
          {
            propertyName: '$.crn',
            errorType: 'empty',
          },
          {
            propertyName: '$.arrivalDate',
            errorType: 'empty',
          },
        ],
      },
    })

    catchValidationErrorOrPropogate(request, response, error, 'some/url')

    expect(request.flash).toHaveBeenCalledWith('errors', expectedErrors)
    expect(request.flash).toHaveBeenCalledWith('errorSummary', expectedErrorSummary)
    expect(request.flash).toHaveBeenCalledWith('errorTitle', bespokeErrorTitle)
    expect(request.flash).toHaveBeenCalledWith('userInput', request.body)

    expect(response.redirect).toHaveBeenCalledWith('some/url')
  })

  it('using the context parameter when supplied to find error messages in the error lookup', () => {
    const error = createMock<SanitisedError>({
      data: {
        'invalid-params': [
          {
            propertyName: '$.date',
            errorType: 'empty',
          },
        ],
      },
    })

    const context = 'bookingCancellation'

    catchValidationErrorOrPropogate(request, response, error, 'some/url', context)

    expect(request.flash).toHaveBeenCalledWith('errors', {
      date: { text: errorLookups[context].date.empty, attributes: { 'data-cy-error-date': true } },
    })
    expect(request.flash).toHaveBeenCalledWith('errorSummary', [
      {
        text: errorLookups[context].date.empty,
        href: '#date',
      },
    ])
    expect(request.flash).toHaveBeenCalledWith('userInput', request.body)

    expect(response.redirect).toHaveBeenCalledWith('some/url')
  })

  it('gets errors from a ValidationError type', () => {
    const error = new ValidationError<TaskListPage>({
      crn: 'You must enter a valid crn',
      error: 'You must enter a valid arrival date',
    })

    catchValidationErrorOrPropogate(request, response, error, 'some/url')

    expect(request.flash).toHaveBeenCalledWith('errors', expectedErrors)
    expect(request.flash).toHaveBeenCalledWith('errorSummary', expectedErrorSummary)
    expect(request.flash).toHaveBeenCalledWith('userInput', request.body)

    expect(response.redirect).toHaveBeenCalledWith('some/url')
  })

  it('throws the error if the invalid-params array is empty', () => {
    const error = createMock<SanitisedError>({
      data: {
        'invalid-params': [],
      },
    })

    let thrownError = null
    try {
      catchValidationErrorOrPropogate(request, response, error, 'some/url')
    } catch (e) {
      thrownError = e
    }

    expect(thrownError).toEqual(error)
  })

  it('throws the error if the error is not the type we expect', () => {
    const err = new Error()
    expect(() => catchValidationErrorOrPropogate(request, response, err, 'some/url')).toThrowError(err)
  })

  it('throws an error if the property is not found in the error lookup', () => {
    const error = createMock<SanitisedError>({
      data: {
        'invalid-params': [
          {
            propertyName: '$.foo',
            errorType: 'bar',
          },
        ],
      },
    })

    expect(() => catchValidationErrorOrPropogate(request, response, error, 'some/url')).toThrowError(
      'Cannot find a translation for an error at the path $.foo',
    )
  })

  it('throws an error if the error type is not found in the error lookup', () => {
    const error = createMock<SanitisedError>({
      data: {
        'invalid-params': [
          {
            propertyName: '$.crn',
            errorType: 'invalid',
          },
        ],
      },
    })

    expect(() => catchValidationErrorOrPropogate(request, response, error, 'some/url')).toThrowError(
      'Cannot find a translation for an error at the path $.crn with the type invalid',
    )
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
  let errorSummary: ErrorSummary
  let errorTitle: string
  let userInput: Record<string, unknown>

  beforeEach(() => {
    ;(request.flash as jest.Mock).mockImplementation((message: string) => {
      return {
        errors: [errors],
        errorSummary,
        errorTitle: [errorTitle],
        userInput: [userInput],
      }[message]
    })
  })

  it('returns default values if there is nothing present', () => {
    const result = fetchErrorsAndUserInput(request)

    expect(result).toEqual({ errors: {}, errorSummary: [], errorTitle: undefined, userInput: {} })
  })

  it('fetches the values from the flash', () => {
    errors = createMock<ErrorMessages>()
    errorSummary = createMock<ErrorSummary>()
    errorTitle = 'Error title'
    userInput = { foo: 'bar' }

    const result = fetchErrorsAndUserInput(request)

    expect(result).toEqual({ errors, errorSummary, errorTitle, userInput })
  })
})

describe('setUserInput', () => {
  const request = createMock<Request>({})

  it("sets the request body as the user input flash message when the source is given as 'post'", () => {
    request.body = {
      some: 'post-field',
    }

    setUserInput(request, 'post')

    expect(request.flash).toHaveBeenCalledWith('userInput', request.body)
  })

  it("sets the request query as the user input flash message when the source is given as 'get'", () => {
    request.query = {
      some: 'get-field',
    }

    setUserInput(request, 'get')

    expect(request.flash).toHaveBeenCalledWith('userInput', request.query)
  })
})

describe('clearUserInput', () => {
  const request = createMock<Request>({})

  request.flash('userInput', 'text')

  clearUserInput(request)

  expect(request.flash).toHaveBeenCalledWith('userInput', null)
})

describe('insertGenericError', () => {
  it('inserts a property error when the error data is empty', () => {
    const error = {}

    insertGenericError(error as SanitisedError, 'someProperty', 'someErrorType')

    expect(error).toEqual({
      data: {
        'invalid-params': [{ propertyName: '$.someProperty', errorType: 'someErrorType' }],
      },
    })
  })

  it('inserts a property error when the error data is not empty', () => {
    const error = {
      data: {
        'some-other-data': {},
      },
    }

    insertGenericError(error as SanitisedError, 'someProperty', 'someErrorType')

    expect(error).toEqual({
      data: {
        'invalid-params': [{ propertyName: '$.someProperty', errorType: 'someErrorType' }],
        'some-other-data': {},
      },
    })
  })

  it('inserts a property error when there are existing property errors', () => {
    const error = {
      data: {
        'invalid-params': [{ propertyName: '$.someOtherProperty', errorType: 'someOtherErrorType' }],
      },
    }

    insertGenericError(error as SanitisedError, 'someProperty', 'someErrorType')

    expect(error).toEqual({
      data: {
        'invalid-params': [
          { propertyName: '$.someOtherProperty', errorType: 'someOtherErrorType' },
          { propertyName: '$.someProperty', errorType: 'someErrorType' },
        ],
      },
    })
  })
})

describe('insertBespokeError', () => {
  it('inserts a bespoke error when the error data is empty', () => {
    const error = {}
    const bespokeError: BespokeError = {
      errorTitle: 'some-bespoke-error',
      errorSummary: [],
    }

    insertBespokeError(error as SanitisedError, bespokeError)

    expect(error).toEqual({
      data: { bespokeError },
    })
  })

  it('inserts a property error when the error data is not empty', () => {
    const error = {
      data: {
        'some-other-data': {},
      },
    }
    const bespokeError: BespokeError = {
      errorTitle: 'some-bespoke-error',
      errorSummary: [],
    }

    insertBespokeError(error as SanitisedError, bespokeError)

    expect(error).toEqual({
      data: {
        bespokeError,
        'some-other-data': {},
      },
    })
  })
})

describe('transformErrors', () => {
  it('renames a property matching the source parameter to the destination parameter', () => {
    const error = {
      data: {
        'invalid-params': [
          { propertyName: '$.apiProperty', errorType: 'someErrorType' },
          { propertyName: '$.unrelatedProperty', errorType: 'somOtherErrorType' },
        ],
      },
    }

    transformErrors(error as SanitisedError, 'apiProperty', 'uiProperty')

    expect(error).toEqual({
      data: {
        'invalid-params': [
          { propertyName: '$.uiProperty', errorType: 'someErrorType' },
          { propertyName: '$.unrelatedProperty', errorType: 'somOtherErrorType' },
        ],
      },
    })
  })

  it('does nothing if the desination parameter already exists', () => {
    const error = {
      data: {
        'invalid-params': [
          { propertyName: '$.apiProperty', errorType: 'someErrorType' },
          { propertyName: '$.uiProperty', errorType: 'somOtherErrorType' },
        ],
      },
    }

    transformErrors(error as SanitisedError, 'apiProperty', 'uiProperty')

    expect(error).toEqual({
      data: {
        'invalid-params': [
          { propertyName: '$.apiProperty', errorType: 'someErrorType' },
          { propertyName: '$.uiProperty', errorType: 'somOtherErrorType' },
        ],
      },
    })
  })
})
