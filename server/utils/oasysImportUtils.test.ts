import { applicationFactory, oasysSelectionFactory, roshSummaryFactory } from '../testutils/factories'
import {
  fetchOptionalOasysSections,
  oasysImportReponse,
  sectionCheckBoxes,
  sortOasysImportSummaries,
  textareas,
} from './oasysImportUtils'
import { sentenceCase } from './utils'

describe('OASysImportUtils', () => {
  describe('textareas', () => {
    it('it returns reoffending needs as textareas', () => {
      const roshSummaries = roshSummaryFactory.buildList(2)
      const sectionName = 'roshAnswers'
      const result = textareas(roshSummaries, sectionName)

      expect(result).toMatchStringIgnoringWhitespace(`
              <div class="govuk-form-group">
              <h3 class="govuk-label-wrapper">
                  <label class="govuk-label govuk-label--m" for=${sectionName}[${roshSummaries[0].questionNumber}]>
                      ${roshSummaries[0].label}
                  </label>
              </h3>
              <textarea class="govuk-textarea" id=${sectionName}[${roshSummaries[0].questionNumber}] name=${sectionName}[${roshSummaries[0].questionNumber}] rows="8">${roshSummaries[0].answer}</textarea>
          </div>
          <hr>
          <div class="govuk-form-group">
          <h3 class="govuk-label-wrapper">
              <label class="govuk-label govuk-label--m" for=${sectionName}[${roshSummaries[1].questionNumber}]>
                  ${roshSummaries[1].label}
              </label>
          </h3>
          <textarea class="govuk-textarea" id=${sectionName}[${roshSummaries[1].questionNumber}] name=${sectionName}[${roshSummaries[1].questionNumber}] rows="8">${roshSummaries[1].answer}</textarea>
      </div>
      <hr>`)
    })
  })

  describe('oasysImportReponse', () => {
    it('returns a human readable response for reach question', () => {
      const answers = ['answer 1', 'answer 2', 'answer 3']
      const summaries = [
        {
          questionNumber: '1',
          label: 'The first question',
          answer: 'Some answer for the first question',
        },
        {
          questionNumber: '2',
          label: 'The second question',
          answer: 'Some answer for the second question',
        },
        {
          questionNumber: '3',
          label: 'The third question',
          answer: 'Some answer for the third question',
        },
      ]
      const result = oasysImportReponse(answers, summaries)

      expect(result).toEqual({
        [`${summaries[0].questionNumber}. ${summaries[0].label}`]: `${answers[0]}`,
        [`${summaries[1].questionNumber}. ${summaries[1].label}`]: `${answers[1]}`,
        [`${summaries[2].questionNumber}. ${summaries[2].label}`]: `${answers[2]}`,
      })
    })

    it('returns no response when there arent any questions', () => {
      const result = oasysImportReponse([], [])

      expect(result).toEqual({})
    })
  })

  describe('fetchOptionalOasysSections', () => {
    it('returns an error if the application doesnt have an OASys section', () => {
      const application = applicationFactory.build()
      expect(() => fetchOptionalOasysSections(application)).toThrow(
        'Oasys supporting information error: Error: No OASys import section',
      )
    })
    it('returns an error if the application doesnt have any optional OASys imports', () => {
      const application = applicationFactory.build({
        data: {
          'oasys-import': {
            'optional-oasys-sections': null,
          },
        },
      })

      expect(() => fetchOptionalOasysSections(application)).toThrow(
        'Oasys supporting information error: Error: No optional OASys imports',
      )
    })

    it('returns the optional OASys sections to import if they exist', () => {
      const application = applicationFactory
        .withOptionalOasysSectionsSelected(
          oasysSelectionFactory.needsLinkedToReoffending().buildList(1, { section: 1 }),
          oasysSelectionFactory.needsNotLinkedToReoffending().buildList(1, { section: 2 }),
        )
        .build()

      expect(fetchOptionalOasysSections(application)).toEqual([1, 2])
    })
  })

  describe('sortOasysImportSummaries', () => {
    it('sorts the imports into order of questions', () => {
      const oasysSummary1 = roshSummaryFactory.build({ questionNumber: '1' })
      const oasysSummary2 = roshSummaryFactory.build({ questionNumber: '2' })
      const oasysSummary3 = roshSummaryFactory.build({ questionNumber: '3' })

      const result = sortOasysImportSummaries([oasysSummary3, oasysSummary2, oasysSummary1])
      expect(result).toEqual([oasysSummary1, oasysSummary2, oasysSummary3])
    })
  })

  describe('sectionCheckBoxes', () => {
    it('it returns needs as checkbox items', () => {
      const needLinkedToReoffendingA = oasysSelectionFactory
        .needsLinkedToReoffending()
        .build({ section: 1, name: 'emotional' })
      const needLinkedToReoffendingB = oasysSelectionFactory.needsLinkedToReoffending().build({ section: 2 })
      const needLinkedToReoffendingC = oasysSelectionFactory.needsLinkedToReoffending().build({ section: 3 })

      const items = sectionCheckBoxes(
        [needLinkedToReoffendingA, needLinkedToReoffendingB, needLinkedToReoffendingC],
        [needLinkedToReoffendingA],
      )

      expect(items).toEqual([
        {
          checked: true,
          text: `1. ${sentenceCase(needLinkedToReoffendingA.name)}`,
          value: '1',
        },
        {
          checked: false,
          text: `2. ${sentenceCase(needLinkedToReoffendingB.name)}`,
          value: '2',
        },
        {
          checked: false,
          text: `3. ${sentenceCase(needLinkedToReoffendingC.name)}`,
          value: '3',
        },
      ])
    })
  })
})
