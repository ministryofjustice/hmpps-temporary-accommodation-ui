import { Property } from '@temporary-accommodation-ui/e2e'
import { fakerEN_GB as faker } from '@faker-js/faker'
import { test } from '../../test'
import { signIn } from '../../steps/signIn'
import {
  createProperty,
  editProperty,
  navigateToProperty,
  searchForProperty,
  visitListPropertiesPage,
} from '../../steps/v2/manage'

test('Create a property', async ({ page, assessor }) => {
  const property = getProperty()

  await signIn(page, assessor)
  await visitListPropertiesPage(page)
  await createProperty(page, property)
})

test('Show a property', async ({ page, assessor }) => {
  const property = getProperty()

  await signIn(page, assessor)
  await visitListPropertiesPage(page)
  await createProperty(page, property)
  await visitListPropertiesPage(page)
  await searchForProperty(page, property.postcode)
  await navigateToProperty(page, property)
})

test('Edit a property', async ({ page, assessor }) => {
  const property = getProperty()
  const updatedProperty = getProperty()

  await signIn(page, assessor)
  await visitListPropertiesPage(page)
  await createProperty(page, property)
  await editProperty(page, property, updatedProperty)
  // await showProperty(page, updatedProperty)
})

function getProperty(): Property {
  return {
    name: `${faker.word.adjective()} ${faker.word.adverb()} ${faker.word.noun()}`,
    addressLine1: faker.location.streetAddress(),
    addressLine2: faker.location.secondaryAddress(),
    town: faker.location.city(),
    postcode: faker.location.zipCode(),
    notes: faker.lorem.lines(5),
    turnaroundWorkingDayCount: faker.number.int({ min: 1, max: 5 }),
    localAuthority: undefined,
    probationRegion: undefined,
    pdu: undefined,
    propertyAttributesValues: [],
    status: 'online',
  }
}
