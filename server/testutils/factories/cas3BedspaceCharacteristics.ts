import { Factory } from 'fishery'
import { Cas3BedspaceCharacteristic } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import bedspaceCharacteristicsJson from '../stubs/bedspaceCharacteristics.json'
import { camelCase } from '../../utils/utils'

class Cas3BedspaceCharacteristicFactory extends Factory<Cas3BedspaceCharacteristic> {
  byDescription(description: string): Cas3BedspaceCharacteristic {
    return bedspaceCharacteristicsJson.find(c => c.description === description)
  }
}

export default Cas3BedspaceCharacteristicFactory.define(({ params }) => {
  if (!Object.keys(params).length) return faker.helpers.arrayElement(bedspaceCharacteristicsJson)

  const description = faker.word.words(3)

  return {
    id: faker.string.uuid(),
    description,
    name: camelCase(description),
  }
})
