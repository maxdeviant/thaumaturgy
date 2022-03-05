import {
  ManifesterNotFoundError,
  PersisterNotFoundError,
  RealmStorage,
} from './realm-storage';

describe('RealmStorage', () => {
  describe('registerManifester', () => {
    it('registers the persister in the realm storage', () => {
      const storage = new RealmStorage();

      const persister = jest.fn();

      storage.registerManifester('User', persister);

      const registeredManifester = storage.findManifester('User');

      expect(registeredManifester).toBe(persister);
    });
  });

  describe('findManifester', () => {
    describe('when a persister is registered under the given name', () => {
      it('returns the persister', () => {
        const storage = new RealmStorage();

        const persister = jest.fn();

        storage.registerManifester('User', persister);

        const registeredManifester = storage.findManifester('User');

        expect(registeredManifester).toBe(persister);
      });
    });

    describe('when a persister is not registered under the given name', () => {
      it('throws a `ManifesterNotFoundError`', () => {
        const storage = new RealmStorage();

        expect(() => storage.findManifester('DoesNotExist')).toThrow(
          new ManifesterNotFoundError('DoesNotExist')
        );
      });
    });
  });

  describe('registerPersister', () => {
    it('registers the persister in the realm storage', () => {
      const storage = new RealmStorage();

      const persister = jest.fn();

      storage.registerPersister('User', persister);

      const registeredPersister = storage.findPersister('User');

      expect(registeredPersister).toBe(persister);
    });
  });

  describe('findPersister', () => {
    describe('when a persister is registered under the given name', () => {
      it('returns the persister', () => {
        const storage = new RealmStorage();

        const persister = jest.fn();

        storage.registerPersister('User', persister);

        const registeredPersister = storage.findPersister('User');

        expect(registeredPersister).toBe(persister);
      });
    });

    describe('when a persister is not registered under the given name', () => {
      it('throws a `PersisterNotFoundError`', () => {
        const storage = new RealmStorage();

        expect(() => storage.findPersister('DoesNotExist')).toThrow(
          new PersisterNotFoundError('DoesNotExist')
        );
      });
    });
  });

  describe('clear', () => {
    it('clears the registered manifesters', () => {
      const storage = new RealmStorage();

      storage.registerManifester('User', jest.fn());

      expect(() => storage.findManifester('User')).not.toThrow();

      storage.clear();

      expect(() => storage.findManifester('User')).toThrow();
    });

    it('clears the registered persisters', () => {
      const storage = new RealmStorage();

      storage.registerPersister('User', jest.fn());

      expect(() => storage.findPersister('User')).not.toThrow();

      storage.clear();

      expect(() => storage.findPersister('User')).toThrow();
    });
  });
});
