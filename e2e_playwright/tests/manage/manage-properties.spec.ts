import { Property } from '@temporary-accommodation-ui/e2e'
import { fakerEN_GB as faker } from '@faker-js/faker'
import { test } from '../../test'
import { signIn } from '../../steps/signIn'
import {
  checkAllEntriesMatchPostcodeOrAddress,
  checkNewPropertyIsListedAndClickManageLink,
  checkViewPropertyPageHasExpectedPropertyDetails,
  createProperty,
  editPropertyAndCheckSavedSuccessfully,
  gotoEditPropertyPageAndCheckDetails,
  searchPropertiesByPostcodeOrAddress,
  visitManagePropertiesPage,
} from '../../steps/manage'

test('Create and edit property', async ({ page, assessor }) => {
  const property = getProperty()

  await signIn(page, assessor)
  await visitManagePropertiesPage(page)
  await createProperty(page, property)
  await gotoEditPropertyPageAndCheckDetails(page, property)
  await editPropertyAndCheckSavedSuccessfully(page, property)
})

test('Create, check listed and view property', async ({ page, assessor }) => {
  const property = getProperty()

  await signIn(page, assessor)
  await visitManagePropertiesPage(page)
  await createProperty(page, property)
  await visitManagePropertiesPage(page)
  await checkNewPropertyIsListedAndClickManageLink(page, property)
  await checkViewPropertyPageHasExpectedPropertyDetails(page, property)
})

test('Check created property appears in postcode/address search', async ({ page, assessor }) => {
  const property = getProperty()

  await signIn(page, assessor)
  await visitManagePropertiesPage(page)
  await createProperty(page, property)
  await visitManagePropertiesPage(page)
  await searchPropertiesByPostcodeOrAddress(page, property.postcode)
  await checkAllEntriesMatchPostcodeOrAddress(page, property.postcode)
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
    status: undefined,
  }
}
