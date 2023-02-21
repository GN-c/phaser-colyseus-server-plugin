/**
 * Lets you set/get/delete value of object's unique property
 * @param symbolDescriptor string | number
 */
export default function createUniqueProperty<T extends object = object>(
  symbolDescriptor?: string | number
) {
  /** Create unique symbol */
  const symbol = Symbol(symbolDescriptor);

  return {
    set(target: Object, value: T) {
      Object.defineProperty(target, symbol, {
        value,
        enumerable: false,
        configurable: true,
      });
    },
    get(target: Object): T | undefined {
      return target[symbol];
    },
    delete(target: Object) {
      delete target[symbol];
    },
  };
}
