import { personFactory, restrictedPersonFactory } from '../../testutils/factories'
import anonymiseFormContent from './anonymiseFormContent'

describe('anonymiseFormContent', () => {
  it("replaces a person's name with 'the person'", () => {
    const person = personFactory.build()

    expect(anonymiseFormContent(`Please provide information on ${person.name}`, person)).toEqual(
      'Please provide information on the person',
    )
    expect(anonymiseFormContent(`Please provide ${person.name}'s history`, person)).toEqual(
      "Please provide the person's history",
    )
  })

  describe('when the person is an LAO', () => {
    it('returns the text unchanged', () => {
      const person = restrictedPersonFactory.build()

      expect(anonymiseFormContent(`Please provide the person's history`, person)).toEqual(
        "Please provide the person's history",
      )
    })
  })
})
