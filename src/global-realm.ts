import { Realm } from './realm';

const globalRealm = new Realm();

const { define, manifest, persist } = globalRealm;

export { define, manifest, persist };
