import * as t from 'io-ts';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { Realm } from '../realm';
import { Ref } from '../ref';
import { Sequence } from '../sequence';

describe('Realm', () => {
  describe('persist', () => {
    const setupDatabase = async () => {
      const db = await open({
        filename: ':memory:',
        driver: sqlite3.Database,
      });

      return { db };
    };

    const Car = t.type({
      make: t.string,
      model: t.string,
    });

    const performSetup = async () => {
      const { db } = await setupDatabase();

      await db.exec('create table car (make text, model text)');

      const realm = new Realm();

      realm.define(Car, {
        manifest: () => ({
          make: 'Honda',
          model: 'Civic',
        }),
        persist: async car => {
          await db.run('insert into car values (?, ?)', car.make, car.model);

          return car;
        },
      });

      return { db, realm };
    };

    describe('with no overrides', () => {
      it('persists an instance of the provided type', async () => {
        const { db, realm } = await performSetup();

        const persisted = await realm.persist(Car);

        expect(persisted).toEqual({
          make: 'Honda',
          model: 'Civic',
        });

        const carFromDatabase = await db.get('select make, model from car');

        expect(carFromDatabase).toEqual(persisted);
      });
    });

    describe('with overrides', () => {
      it('persists an instance of the provided type with the overrides applied', async () => {
        const { db, realm } = await performSetup();

        const persisted = await realm.persist(Car, {
          model: 'CRV',
        });

        expect(persisted).toEqual({
          make: 'Honda',
          model: 'CRV',
        });

        const carFromDatabase = await db.get('select make, model from car');

        expect(carFromDatabase).toEqual(persisted);
      });
    });

    describe('for an entity hierarchy', () => {
      const Kingdom = t.type({ name: t.string });

      const Phylum = t.type({ kingdom: t.string, name: t.string });

      const Class = t.type({ phylum: t.string, name: t.string });

      const performSetup = async () => {
        const { db } = await setupDatabase();

        await db.exec('pragma foreign_keys = on');
        await db.exec('create table kingdom (name text primary key)');
        await db.exec(
          'create table phylum (kingdom text, name text primary key, foreign key(kingdom) references kingdom(name))'
        );
        await db.exec(
          'create table class (phylum text, name text primary key, foreign key(phylum) references phylum(name))'
        );

        const realm = new Realm();

        realm.define(Kingdom, {
          manifest: () => ({ name: 'Animalia' }),
          persist: async kingdom => {
            await db.run('insert into kingdom values (?)', kingdom.name);

            return kingdom;
          },
        });

        realm.define(Phylum, {
          manifest: () => ({
            kingdom: Ref.to(Kingdom).through(kingdom => kingdom.name),
            name: 'Chordata',
          }),
          persist: async phylum => {
            await db.run(
              'insert into phylum values (?, ?)',
              phylum.kingdom,
              phylum.name
            );

            return phylum;
          },
        });

        realm.define(Class, {
          manifest: () => ({
            phylum: Ref.to(Phylum).through(phylum => phylum.name),
            name: 'Mammalia',
          }),
          persist: async class_ => {
            await db.run(
              'insert into class values (?, ?)',
              class_.phylum,
              class_.name
            );

            return class_;
          },
        });

        return { db, realm };
      };

      it('persists an instance of each entity in the hierarchy', async () => {
        const { db, realm } = await performSetup();

        const persisted = await realm.persist(Class);

        expect(persisted).toEqual({
          phylum: 'Chordata',
          name: 'Mammalia',
        });

        const classFromDatabase = await db.get(
          'select phylum, name from class'
        );

        expect(classFromDatabase).toEqual(persisted);

        const phylumFromDatabase = await db.get(
          'select kingdom, name from phylum'
        );

        expect(phylumFromDatabase).toEqual({
          kingdom: 'Animalia',
          name: 'Chordata',
        });

        const kingdomFromDatabase = await db.get('select name from kingdom');

        expect(kingdomFromDatabase).toEqual({ name: 'Animalia' });
      });
    });

    describe('for an entity hierarchy with randomly-generated IDs', () => {
      const Author = t.type({ id: t.string, name: t.string }, 'Author');

      const Post = t.type(
        {
          id: t.string,
          authorId: t.string,
          title: t.string,
        },
        'Post'
      );

      const Comment = t.type(
        {
          id: t.string,
          postId: t.string,
          username: t.string,
        },
        'Comment'
      );

      const performSetup = async () => {
        const { db } = await setupDatabase();

        await db.exec('pragma foreign_keys = on');
        await db.exec(
          'create table author (id text primary key, name text not null)'
        );
        await db.exec(
          'create table post (id text primary key, author_id text not null, title text not null, foreign key(author_id) references author(id))'
        );
        await db.exec(
          'create table comment (id text primary key, post_id text not null, username text not null, foreign key(post_id) references post(id))'
        );

        const realm = new Realm();

        realm.define(Author, {
          sequences: {
            names: new Sequence(n => `Author ${n}` as const),
          },
          manifest: ({ uuid, sequences }) => ({
            id: uuid(),
            name: sequences.names.next(),
          }),
          persist: async author => {
            await db.run(
              'insert into author (id, name) values (?, ?)',
              author.id,
              author.name
            );

            return author;
          },
        });

        realm.define(Post, {
          sequences: {
            titles: new Sequence(n => `Post ${n}` as const),
          },
          manifest: ({ uuid, sequences }) => ({
            id: uuid(),
            authorId: Ref.to(Author).through(author => author.id),
            title: sequences.titles.next(),
          }),
          persist: async post => {
            await db.run(
              'insert into post (id, author_id, title) values (?, ?, ?)',
              post.id,
              post.authorId,
              post.title
            );

            return post;
          },
        });

        realm.define(Comment, {
          sequences: {
            usernames: new Sequence(n => `user${n}` as const),
          },
          manifest: ({ uuid, sequences }) => ({
            id: uuid(),
            postId: Ref.to(Post).through(post => post.id),
            username: sequences.usernames.next(),
          }),
          persist: async comment => {
            await db.run(
              'insert into comment (id, post_id, username) values (?, ?, ?)',
              comment.id,
              comment.postId,
              comment.username
            );

            return comment;
          },
        });

        return { db, realm };
      };

      it('persists an instance of each entity in the hierarchy', async () => {
        const { db, realm } = await performSetup();

        const comment = await realm.persist(Comment);

        const commentsInDatabase = await db.all('select * from comment');

        expect(commentsInDatabase).toEqual([
          {
            id: comment.id,
            post_id: comment.postId,
            username: comment.username,
          },
        ]);

        const postsInDatabase = await db.all('select * from post');

        expect(postsInDatabase).toEqual([
          {
            id: comment.postId,
            author_id: expect.any(String),
            title: expect.any(String),
          },
        ]);

        const authorsInDatabase = await db.all('select * from author');

        expect(authorsInDatabase).toEqual([
          { id: postsInDatabase[0].author_id, name: expect.any(String) },
        ]);
      });
    });
  });

  describe('persistAll', () => {
    const setupDatabase = async () => {
      const db = await open({
        filename: ':memory:',
        driver: sqlite3.Database,
      });

      return { db };
    };

    describe('for an entity hierarchy with randomly-generated IDs', () => {
      const Author = t.type({ id: t.string, name: t.string }, 'Author');

      const Post = t.type(
        {
          id: t.string,
          authorId: t.string,
          title: t.string,
        },
        'Post'
      );

      const Comment = t.type(
        {
          id: t.string,
          postId: t.string,
          username: t.string,
        },
        'Comment'
      );

      const performSetup = async () => {
        const { db } = await setupDatabase();

        await db.exec('pragma foreign_keys = on');
        await db.exec(
          'create table author (id text primary key, name text not null)'
        );
        await db.exec(
          'create table post (id text primary key, author_id text not null, title text not null, foreign key(author_id) references author(id))'
        );
        await db.exec(
          'create table comment (id text primary key, post_id text not null, username text not null, foreign key(post_id) references post(id))'
        );

        const realm = new Realm();

        realm.define(Author, {
          sequences: {
            names: new Sequence(n => `Author ${n}` as const),
          },
          manifest: ({ uuid, sequences }) => ({
            id: uuid(),
            name: sequences.names.next(),
          }),
          persist: async author => {
            await db.run(
              'insert into author (id, name) values (?, ?)',
              author.id,
              author.name
            );

            return author;
          },
        });

        realm.define(Post, {
          sequences: {
            titles: new Sequence(n => `Post ${n}` as const),
          },
          manifest: ({ uuid, sequences }) => ({
            id: uuid(),
            authorId: Ref.to(Author).through(author => author.id),
            title: sequences.titles.next(),
          }),
          persist: async post => {
            await db.run(
              'insert into post (id, author_id, title) values (?, ?, ?)',
              post.id,
              post.authorId,
              post.title
            );

            return post;
          },
        });

        realm.define(Comment, {
          sequences: {
            usernames: new Sequence(n => `user${n}` as const),
          },
          manifest: ({ uuid, sequences }) => ({
            id: uuid(),
            postId: Ref.to(Post).through(post => post.id),
            username: sequences.usernames.next(),
          }),
          persist: async comment => {
            await db.run(
              'insert into comment (id, post_id, username) values (?, ?, ?)',
              comment.id,
              comment.postId,
              comment.username
            );

            return comment;
          },
        });

        return { db, realm };
      };

      it('persists an instance of each entity in the hierarchy', async () => {
        const { db, realm } = await performSetup();

        const leaves = await realm.persistLeaves();

        const authorsInDatabase = await db.all('select * from author');

        expect(authorsInDatabase).toEqual([
          {
            id: expect.any(String),
            name: 'Author 1',
          },
        ]);

        const postsInDatabase = await db.all('select * from post');

        expect(postsInDatabase).toEqual([
          {
            id: expect.any(String),
            author_id: authorsInDatabase[0].id,
            title: 'Post 1',
          },
        ]);

        const commentsInDatabase = await db.all('select * from comment');

        expect(commentsInDatabase).toEqual([
          {
            id: expect.any(String),
            post_id: postsInDatabase[0].id,
            username: 'user1',
          },
        ]);
      });
    });
  });
});
