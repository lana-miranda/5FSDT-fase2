import { IPost } from '@src/models/Post';
import { getRandomInt } from '@src/common/util/misc';

import orm from './MockOrm';

/******************************************************************************
                                Functions
******************************************************************************/

/**
 * Get one post.
 */
async function getOne(id: number): Promise<IPost | null> {
  const db = await orm.openDb();
  for (const post of db.posts) {
    if (post.id === id) {
      return post;
    }
  }
  return null;
}

/**
 * See if a post with the given id exists.
 */
async function persists(id: number): Promise<boolean> {
  const db = await orm.openDb();
  for (const post of db.posts) {
    if (post.id === id) {
      return true;
    }
  }
  return false;
}

/**
 * Get all posts.
 */
async function getAll(): Promise<IPost[]> {
  const db = await orm.openDb();
  return db.posts;
}

/**
 * Add one post.
 */
async function add(post: IPost): Promise<void> {
  const db = await orm.openDb();
  post.id = getRandomInt();
  db.posts.push(post);
  return orm.saveDb(db);
}

/**
 * Update a post.
 */
async function update(post: IPost): Promise<void> {
  const db = await orm.openDb();
  for (let i = 0; i < db.posts.length; i++) {
    if (db.posts[i].id === post.id) {
      const dbPost = db.posts[i];
      db.posts[i] = {
        ...dbPost,
        title: post.title,
        summary: post.summary,
        content: post.content,
        teacherId: post.teacherId,
      };
      return orm.saveDb(db);
    }
  }
}

/**
 * Delete one post.
 */
async function delete_(id: number): Promise<void> {
  const db = await orm.openDb();
  for (let i = 0; i < db.posts.length; i++) {
    if (db.posts[i].id === id) {
      db.posts.splice(i, 1);
      return orm.saveDb(db);
    }
  }
}

/**
 * Search posts by title or summary.
 */
async function search(query: string): Promise<IPost[]> {
  const db = await orm.openDb();
  return db.posts.filter(
    (post) => post.title.includes(query) || post.summary.includes(query)
  );
}

// **** Unit-Tests Only **** //

/**
 * Delete every post record.
 */
async function deleteAllPosts(): Promise<void> {
  const db = await orm.openDb();
  db.posts = [];
  return orm.saveDb(db);
}

/**
 * Insert multiple posts. Can't do multiple at once cause using a plain file
 * for nmow.
 */
async function insertMult(posts: IPost[] | readonly IPost[]): Promise<IPost[]> {
  const db = await orm.openDb(),
    postsF = [...posts];
  for (const post of postsF) {
    post.id = getRandomInt();
    post.createdAt = new Date();
  }
  db.posts = [...db.posts, ...posts];
  await orm.saveDb(db);
  return postsF;
}

/******************************************************************************
                                Export default
******************************************************************************/

export default {
  getOne,
  persists,
  getAll,
  add,
  update,
  delete: delete_,
  search,
  deleteAllPosts,
  insertMult,
} as const;
