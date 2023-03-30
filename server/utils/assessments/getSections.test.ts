import { assessmentFactory } from '../../testutils/factories'
import getSections from './getSections'

describe('getSections', () => {
  const assessment = assessmentFactory.build({ status: 'pending' })

  it('returns an empty array', () => {
    const sections = getSections(assessment)

    expect(sections).toEqual([])
  })
})
