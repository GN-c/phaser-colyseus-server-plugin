import createUniqueProperty from "../../utils/createUniqueProperty";

/**
 * Define Unique Property for saving `sync` related data
 */
export const SYNCABLES_PROPERTY = createUniqueProperty<SyncableData[]>();

export type InterpolationFunction<T extends any = any> = (
  a: T,
  b: T,
  t: number
) => T;

export type SyncableData = {
  propertyKey: string | symbol;
  schemaKey: string;
  interpolationFunction: InterpolationFunction;
};

/**
 * Synchronize primitive property with Colyseus Schema's property
 *
 * @param schemaKey string
 * @param interpolationFunction function for interpolation between two latest states by t
 */
export function sync<type extends any = number>(
  schemaKey: string,
  interpolationFunction: InterpolationFunction<type>
): PropertyDecorator {
  return (target, propertyKey) => {
    /**
     * Retrieve array of syncable properties
     */
    const syncables = SYNCABLES_PROPERTY.get(target) || [];

    /**
     * Add data about new syncable property
     */
    syncables.push({ propertyKey, schemaKey, interpolationFunction });

    /**
     * Save back
     */
    SYNCABLES_PROPERTY.set(target, syncables);
  };
}

/**
 * Shortcut way of syncing number with linear interpolation
 * @param schemaKey string
 */
export function syncNumber(schemaKey: string) {
  return sync<number>(schemaKey, Phaser.Math.Linear);
}

/**
 * Shortcut way of syncing angle(in radians) with linear interpolation
 * @param schemaKey string
 */
export function syncRotation(schemaKey: string) {
  return sync<number>(schemaKey, Phaser.Math.Angle.RotateTo);
}

/**
 * Shortcut way of syncing boolean value
 * @param schemaKey string
 * @returns
 */
export function syncBoolean(schemaKey: string) {
  return sync<boolean>(schemaKey, (_, b) => b);
}
