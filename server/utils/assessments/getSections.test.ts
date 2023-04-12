import { assessmentFactory } from '../../testutils/factories'
import getSections from './getSections'

describe('getSections', () => {
  const assessment = assessmentFactory.build({ status: 'awaiting_response' })

  it('returns an empty array', () => {
    const sections = getSections(assessment)

    expect(sections).toEqual([])
  })
})
