import { IPost } from '@src/models/Post';

import pg from '@src/repos/pg';

/**
 * Get one post.
 */
async function getOne(id: number): Promise<IPost | null> {
  const db = await pg();
  const sql = 'SELECT * FROM posts WHERE id = $1';
  const found = await db.query<IPost>(sql, [id]);
  return found.rows[0] || null;
}

/**
 * Get all posts.
 */
async function getAll(): Promise<IPost[]> {
  const db = await pg();
  const sql = 'SELECT * FROM posts';
  const result = await db.query<IPost>(sql);
  return result.rows;
}

/**
 * Add one post.
 */
async function add(post: IPost): Promise<void> {
  const db = await pg();
  const sql = `
    INSERT INTO posts (title, summary, content, teacher_id)
    VALUES ($1, $2, $3, $4)
  `;
  await db.query(sql, [post.title, post.summary, post.content, post.teacherId]);
}

/**
 * Update a post.
 */
async function update(post: IPost): Promise<void> {
  const db = await pg();
  const sql = `
    UPDATE posts 
    SET title = $1, summary = $2, content = $3, teacher_id = $4
    WHERE id = $5
  `;
  await db.query(sql, [
    post.title,
    post.summary,
    post.content,
    post.teacherId,
    post.id,
  ]);
}

/**
 * Delete one post.
 */
async function remove(id: number): Promise<void> {
  const db = await pg();
  const sql = 'DELETE FROM posts WHERE id = $1';
  await db.query(sql, [id]);
}

/**
 * Search posts by title or summary.
 */
async function search(query: string): Promise<IPost[]> {
  const db = await pg();
  const sql = 'SELECT * FROM posts WHERE title ILIKE $1 OR summary ILIKE $1';
  const result = await db.query<IPost>(sql, [`%${query}%`]);
  return result.rows;
}

export default {
  getOne,
  getAll,
  add,
  update,
  remove,
  search,
} as const;
