import { createMock } from '@golevelup/ts-jest'
import { Request, Response } from 'express'

import type { BespokeError, ErrorMessages, ErrorSummary } from '@approved-premises/ui'
import type TaskListPage from '../form-pages/tasklistPage'
import errorLookups from '../i18n/en/errors.json'
import { SanitisedError } from '../sanitisedError'
import { TasklistAPIError, ValidationError } from './errors'
import {
  InvalidParams,
  addValidationErrorsAndRedirect,
  catchAPIErrorOrPropogate,
  catchValidationErrorOrPropogate,
  clearUserInput,
  fetchErrorsAndUserInput,
  generateMergeParameters,
  insertBespokeError,
  insertGenericError,
  setUserInput,
  transformErrors,
  isValidEmail,
} from './validation'
import { DateFormats } from './dateUtils'

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
    premisesArchive: {
      endDate: {
        existingUpcomingBedspace: 'Earliest archive date is :earliestDate because of an upcoming bedspace',
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

  it('successfully gets dynamic errors using merge parameters', () => {
    const error = createMock<SanitisedError>({
      data: {
        title: 'Bad Request',
        status: 400,
        'invalid-params': [
          {
            propertyName: '$.endDate',
            errorType: 'existingUpcomingBedspace',
            entityId: '1094a15b-5ead-4c99-a20b-77aa15eb9ce6',
            value: '2025-02-01',
          },
        ],
      },
    })

    const context = 'premisesArchive'
    const mergeVariables = { existingUpcomingBedspace: { earliestDate: '1 February 2025' } }

    catchValidationErrorOrPropogate(request, response, error, 'some/url', context, mergeVariables)

    expect(request.flash).toHaveBeenCalledWith('errors', {
      endDate: {
        text: 'Earliest archive date is 1 February 2025 because of an upcoming bedspace',
        attributes: { 'data-cy-error-endDate': true },
      },
    })
    expect(request.flash).toHaveBeenCalledWith('errorSummary', [
      {
        text: 'Earliest archive date is 1 February 2025 because of an upcoming bedspace',
        href: '#endDate',
      },
    ])
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

describe('addValidationErrorsAndRedirect', () => {
  const request = createMock<Request>({ body: { field: 'hello' } })
  const response = createMock<Response>()

  const errors: Record<string, string> = {
    first: 'This is the first error',
    second: 'This is the second error',
  }

  it('should return the errors to the user and redirect to the redirectUrl', () => {
    addValidationErrorsAndRedirect(request, response, errors, '/path/for/redirect')

    expect(request.flash).toHaveBeenCalledWith('errors', {
      first: { text: 'This is the first error', attributes: { 'data-cy-error-first': true } },
      second: { text: 'This is the second error', attributes: { 'data-cy-error-second': true } },
    })
    expect(request.flash).toHaveBeenCalledWith('errorSummary', [
      { text: 'This is the first error', href: '#first' },
      { text: 'This is the second error', href: '#second' },
    ])
    expect(request.flash).toHaveBeenCalledWith('userInput', { field: 'hello' })
    expect(response.redirect).toHaveBeenCalledWith('/path/for/redirect')
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

describe('generateMergeParameters', () => {
  it('should get merge parameters for each transform in an error', () => {
    const error = createMock<SanitisedError>({
      data: {
        title: 'Bad Request',
        status: 400,
        'invalid-params': [
          {
            propertyName: '$.endDate',
            errorType: 'existingUpcomingBedspace',
            entityId: '1094a15b-5ead-4c99-a20b-77aa15eb9ce6',
            value: '2025-02-01',
          },
          {
            propertyName: '$.startDate',
            errorType: 'invalidStartDateInThePast',
            entityId: '23b3596e-f3be-46e6-9f73-55623aafe916',
            value: '2025-03-02',
          },
          {
            propertyName: '$.invalidProperty',
            errorType: 'invalidErrorType',
            entityId: '344171f8-cff6-4c58-8eac-edfd46485858',
            value: '2025-04-03',
          },
        ],
      },
    })

    const toUiDateTransform = (params: InvalidParams) => ({
      earliestDate: DateFormats.isoDateToUIDate(params.value),
    })

    const toIsoDatetimeTransform = (params: InvalidParams) => ({
      latestDate: DateFormats.dateObjToIsoDateTime(DateFormats.isoToDateObj(params.value)),
    })

    const mergeVariables = generateMergeParameters(error, [
      { errorType: 'existingUpcomingBedspace', transform: toUiDateTransform },
      { errorType: 'invalidStartDateInThePast', transform: toIsoDatetimeTransform },
    ])

    expect(mergeVariables).toEqual({
      existingUpcomingBedspace: { earliestDate: '1 February 2025' },
      invalidStartDateInThePast: { latestDate: '2025-03-02T00:00:00.000Z' },
    })
  })

  it("should return undefined when the error isn't an annotated error", () => {
    const error: SanitisedError = {
      stack: 'stack',
      message: 'message',
    }
    const result = generateMergeParameters(error, [])
    expect(result).toBe(undefined)
  })
})

describe('isValidEmail', () => {
  it.each([
    'invalid-email',
    'test@example.com',
    'test@gmail.com',
    '@justice.gov.uk',
    'http://justice.co.uk',
    'http://yahoo.com',
    'test@justice.go.uk',
    'test@justice.gov.ykj',
    'test@.gov.uk',
    'test @justice.gov.uk',
    'test@justice.gove.com',
    'test@justice .gov.uk',
    'test@ justice.gov.uk',
    'test@gov.uk',
  ])('should return false for invalid email: %s', email => {
    expect(isValidEmail(email)).toBe(false)
  })

  it.each(['test@justice.gov.uk', 'name@example.gov.uk', 'backup-name@example.gov.uk'])(
    'should return true for valid email: %s',
    email => {
      expect(isValidEmail(email)).toBe(true)
    },
  )
})
