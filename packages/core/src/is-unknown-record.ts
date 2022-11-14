export const isUnknownRecord = (
  value: unknown
): value is Record<string, unknown> => {
  const stringRepr = Object.prototype.toString.call(value);

  return stringRepr === '[object Object]' || stringRepr === '[object Window]';
};
