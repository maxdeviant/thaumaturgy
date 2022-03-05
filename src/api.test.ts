import * as t from 'io-ts';
import { define, manifest } from './factory';

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

describe('API', () => {
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
