import { ApprovedPremisesApplication, OASysSection } from '../../../../@types/shared'
import { DataServices } from '../../../../@types/ui'
import { CallConfig } from '../../../../data/restClient'
import { flattenCheckboxInput, isStringOrArrayOfStrings } from '../../../../utils/formUtils'
import { sentenceCase } from '../../../../utils/utils'
import TasklistPage from '../../../tasklistPage'
import { Page } from '../../../utils/decorators'

interface Response {
  needsLinkedToReoffending: Array<string> | string | Array<OASysSection>
  otherNeeds: Array<string> | string | Array<OASysSection>
}

interface Body {
  needsLinkedToReoffending: Array<OASysSection>
  otherNeeds: Array<OASysSection>
}

@Page({
  name: 'optional-oasys-sections',
  bodyProperties: ['needsLinkedToReoffending', 'otherNeeds'],
})
export default class OptionalOasysSections implements TasklistPage {
  title = 'Which of the following sections of OASys do you want to import?'

  needsLinkedToReoffendingHeading = 'Needs linked to reoffending'

  allNeedsLinkedToReoffending: Array<OASysSection>

  otherNeedsHeading = 'Needs not linked to risk of serious harm or reoffending'

  allOtherNeeds: Array<OASysSection>

  constructor(public body: Partial<Body>) {}

  static async initialize(
    body: Partial<Response>,
    application: ApprovedPremisesApplication,
    callConfig: CallConfig,
    dataServices: DataServices,
  ) {
    const oasysSelections = await dataServices.personService.getOasysSelections(callConfig, application.person.crn)

    const allNeedsLinkedToReoffending = oasysSelections.filter(
      section => !section.linkedToHarm && section.linkedToReOffending,
    )
    const allOtherNeeds = oasysSelections.filter(section => !section.linkedToHarm && !section.linkedToReOffending)

    body.needsLinkedToReoffending = OptionalOasysSections.getSelectedNeeds(
      body.needsLinkedToReoffending,
      allNeedsLinkedToReoffending,
    )
    body.otherNeeds = OptionalOasysSections.getSelectedNeeds(body.otherNeeds, allOtherNeeds)

    const page = new OptionalOasysSections(body as Body)

    page.allNeedsLinkedToReoffending = allNeedsLinkedToReoffending
    page.allOtherNeeds = allOtherNeeds

    return page
  }

  private static getSelectedNeeds(
    selectedSections: string | Array<string> | Array<OASysSection>,
    allSections: Array<OASysSection>,
  ): Array<OASysSection> {
    if (!selectedSections) {
      return []
    }

    if (isStringOrArrayOfStrings(selectedSections)) {
      const sectionIds = flattenCheckboxInput(selectedSections as string | Array<string>) || []

      return sectionIds.map((need: string) => allSections.find((n: OASysSection) => need === n.section.toString()))
    }

    return selectedSections as Array<OASysSection>
  }

  previous() {
    return ''
  }

  next() {
    return ''
  }

  response() {
    const response = {}

    if (this.getResponseForTypeOfNeed(this.body.needsLinkedToReoffending))
      response[this.needsLinkedToReoffendingHeading] = this.getResponseForTypeOfNeed(this.body.needsLinkedToReoffending)

    if (this.getResponseForTypeOfNeed(this.body.otherNeeds))
      response[this.otherNeedsHeading] = this.getResponseForTypeOfNeed(this.body.otherNeeds)

    return response
  }

  getResponseForTypeOfNeed(typeOfNeed: Array<OASysSection>) {
    if (Array.isArray(typeOfNeed) && typeOfNeed.length) {
      return typeOfNeed.map(need => `${need.section}. ${sentenceCase(need.name)}`).join(', ')
    }
    return ''
  }

  errors() {
    return {}
  }
}
