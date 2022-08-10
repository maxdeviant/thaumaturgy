import { Realm } from './realm';

/**
 * The global realm.
 *
 * This realm is used for all of the free functions.
 */
const globalRealm = new Realm();

const { define, manifest, persist } = globalRealm;

export { define, manifest, persist };
