import { Realm } from './realm';

const globalRealm = new Realm();

const { define, defineTraversal, manifest, persist } = globalRealm;

export { define, defineTraversal, manifest, persist };
