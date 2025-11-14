export type Validators = Record<string, RegExp>

const validators: Validators = {
  uuid: /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
  task: /^[a-z-]+$/,
  page: /^[a-z-]+$/,
  status: /^[a-z_]+$/,
  crn: /^[A-Z][0-9]{6}$/,
}

export const fieldValidators: Validators = {
  id: validators.uuid,
  task: validators.task,
  page: validators.page,
  crn: validators.crn,
  bedspaceId: validators.uuid,
  premisesId: validators.uuid,
  bookingId: validators.uuid,
  lostBedId: validators.uuid,
  status: validators.status,
}
