export function isNullOrUndefined(variable) {
  return variable === null || variable === undefined;
}

export function isEmptyObject(obj) {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
}
