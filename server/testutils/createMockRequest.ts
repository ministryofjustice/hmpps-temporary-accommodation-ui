import { createMock } from '@golevelup/ts-jest'
import { Request } from 'express'

export type MockRequest = Omit<Request, 'flash'> & { flash: jest.MockedFunction<Request['flash']> }

export function createMockRequest() {
  return {
    user: { token: 'some-token' },
    flash: jest.fn() as jest.MockedFunction<Request['flash']>,
    params: createMock(),
  } as MockRequest
}
