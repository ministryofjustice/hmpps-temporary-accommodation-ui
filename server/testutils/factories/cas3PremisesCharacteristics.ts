import { Factory } from 'fishery'
import { Cas3PremisesCharacteristic } from '@approved-premises/api'
import { faker } from '@faker-js/faker'
import premisesCharacteristicsJson from '../stubs/premisesCharacteristics.json'
import { camelCase } from '../../utils/utils'

class Cas3PremisesCharacteristicFactory extends Factory<Cas3PremisesCharacteristic> {
  byDescription(description: string): Cas3PremisesCharacteristic {
    return premisesCharacteristicsJson.find(c => c.description === description)
  }
}

export default Cas3PremisesCharacteristicFactory.define(({ params }) => {
  if (!Object.keys(params).length) return faker.helpers.arrayElement(premisesCharacteristicsJson)

  const description = faker.word.words(3)

  return {
    id: faker.string.uuid(),
    description,
    name: camelCase(description),
  }
})
