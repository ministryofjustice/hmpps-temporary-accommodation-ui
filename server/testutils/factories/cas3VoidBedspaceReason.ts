import { Factory } from 'fishery'
import { Cas3VoidBedspaceReason } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import lostBedReasonsJson from '../stubs/lost-bed-reasons.json'

export default Factory.define<Cas3VoidBedspaceReason>(() => faker.helpers.arrayElement(lostBedReasonsJson))
