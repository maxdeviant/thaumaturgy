import faker from '@faker-js/faker';
import * as t from 'io-ts';
import { clearRegisteredFactories, define, manifest } from './factory';

describe('API', () => {
  const User = t.type({
    firstName: t.string,
    lastName: t.string,
  });

  define(User, faker =>
    User.encode({
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
    })
  );

  it('works', () => {
    console.log(User);

    const user = User.encode({
      firstName: 'Peter',
      lastName: 'Gibbons',
    });

    console.log(user);

    const otherUser = manifest(User);

    console.log(otherUser);

    const anotherUser = manifest(User, {
      firstName: 'First Name Override',
    });

    console.log(anotherUser);
  });
});

describe('define', () => {
  const Movie = t.type({
    title: t.string,
    year: t.Int,
  });

  beforeEach(() => {
    clearRegisteredFactories();
  });

  describe('when `manifest` is invoked', () => {
    it('calls the manifestation function', () => {
      const manifester = jest.fn();

      define(Movie, manifester);

      manifest(Movie);

      expect(manifester).toHaveBeenCalledTimes(1);
    });

    it('passes a Faker instance to the manifestation function', () => {
      const manifester = jest.fn();

      define(Movie, manifester);

      manifest(Movie);

      expect(manifester).toHaveBeenCalledWith(faker);
    });
  });
});

describe('manifest', () => {
  describe('for a `type` codec', () => {
    const Car = t.type({
      make: t.string,
      model: t.string,
    });

    beforeAll(() => {
      clearRegisteredFactories();

      define(Car, () =>
        Car.encode({
          make: 'Honda',
          model: 'Civic',
        })
      );
    });

    describe('with no overrides', () => {
      it('manifests an instance of the provided type', () => {
        const manifested = manifest(Car);

        expect(manifested).toEqual(
          Car.encode({
            make: 'Honda',
            model: 'Civic',
          })
        );
      });
    });

    describe('with overrides', () => {
      it('manifests an instance of the provided type with the overrides applied', () => {
        const manifested = manifest(Car, {
          model: 'CRV',
        });

        expect(manifested).toEqual(
          Car.encode({
            make: 'Honda',
            model: 'CRV',
          })
        );
      });
    });
  });

  describe('for a `strict` codec', () => {
    const Car = t.strict({
      make: t.string,
      model: t.string,
    });

    beforeAll(() => {
      clearRegisteredFactories();

      define(Car, () =>
        Car.encode({
          make: 'Honda',
          model: 'Civic',
        })
      );
    });

    describe('with no overrides', () => {
      it('manifests an instance of the provided type', () => {
        const manifested = manifest(Car);

        expect(manifested).toEqual(
          Car.encode({
            make: 'Honda',
            model: 'Civic',
          })
        );
      });
    });

    describe('with overrides', () => {
      it('manifests an instance of the provided type with the overrides applied', () => {
        const manifested = manifest(Car, {
          model: 'CRV',
        });

        expect(manifested).toEqual(
          Car.encode({
            make: 'Honda',
            model: 'CRV',
          })
        );
      });
    });
  });
});
