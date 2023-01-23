import { createMock } from '@golevelup/ts-jest'
import { Request } from 'express'
import { ProbationRegion } from '../@types/shared'
import probationRegionFactory from './factories/probationRegion'

export type MockRequest = Omit<Request, 'flash'> & { flash: jest.MockedFunction<Request['flash']> }

export function createMockRequest() {
  return {
    user: { token: 'some-token' },
    session: { actingUserProbationRegion: probationRegionFactory.build() as ProbationRegion },
    flash: jest.fn() as jest.MockedFunction<Request['flash']>,
    params: createMock(),
  } as MockRequest
}
