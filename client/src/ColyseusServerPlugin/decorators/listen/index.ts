import createUniqueProperty from "../../utils/createUniqueProperty";

/**
 * Define Unique Property for saving listeners
 */
export const LISTENERS_PROPERTY =
  createUniqueProperty<Record<string, ListenCallbackType[]>>();

export type ListenCallbackType<T extends any = any> = (
  previousValue: T,
  currentValue: T
) => void;

/**
 * Listen For single property change on schema
 *
 * executes decorated method - `<T>(previousValue: T, currentValue: T) => void`
 *
 * should be linked to schema using `colyseusServerPlugin.linkSchema`
 *
 * see https://docs.colyseus.io/colyseus/state/schema/#listenprop-callback
 * @param schemaKey string
 */
export function listen(schemaKey: string): MethodDecorator {
  return (target, propertyKey) => {
    /**
     * Retrieve array of listeners
     * store callbacks by `schemaKey`
     */
    const listenersRecord = LISTENERS_PROPERTY.get(target) || {};
    const listeners =
      listenersRecord[schemaKey] || (listenersRecord[schemaKey] = []);

    /**
     * Add method as callback in the list
     */
    listeners.push(target[propertyKey]);

    /**
     * Save listeners which will accessed by ColyseusPlugin later
     */
    LISTENERS_PROPERTY.set(target, listenersRecord);
  };
}
