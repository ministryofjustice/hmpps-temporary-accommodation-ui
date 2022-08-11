import { Request, Response } from 'express'
import { createMock } from '@golevelup/ts-jest'

import type { ErrorMessages, ErrorSummary } from 'approved-premises'
import { SanitisedError } from '../sanitisedError'
import { catchValidationErrorOrPropogate, fetchErrorsAndUserInput } from './validation'
import errorLookups from '../i18n/en/errors.json'

jest.mock('../i18n/en/errors.json', () => {
  return {
    CRN: {
      blank: 'You must enter a CRN',
    },
    arrivalDate: {
      blank: 'You must enter a valid arrival date',
    },
  }
})

describe('catchValidationErrorOrPropogate', () => {
  const request = createMock<Request>({})
  const response = createMock<Response>()
  const error = createMock<SanitisedError>({
    data: {
      'invalid-params': [
        {
          propertyName: 'CRN',
          errorType: 'blank',
        },
        {
          propertyName: 'arrivalDate',
          errorType: 'blank',
        },
      ],
    },
  })

  const expectedErrors = {
    CRN: { text: errorLookups.CRN.blank, attributes: { 'data-cy-error-CRN': true } },
    arrivalDate: { text: errorLookups.arrivalDate.blank, attributes: { 'data-cy-error-arrivalDate': true } },
  }

  const expectedErrorSummary = [
    { text: errorLookups.CRN.blank, href: '#CRN' },
    { text: errorLookups.arrivalDate.blank, href: '#arrivalDate' },
  ]

  it('sets the errors and request body as flash messages and redirects back to the form', () => {
    request.body = {
      some: 'field',
    }

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
