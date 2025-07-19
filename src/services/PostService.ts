import { RouteError } from '@src/common/util/route-errors';
import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';

import PostRepo from '@src/repos/PostRepo';
import { IPost } from '@src/models/Post';

/******************************************************************************
                                Constants
******************************************************************************/

export const POST_NOT_FOUND_ERR = 'Post not found';

/******************************************************************************
                                Functions
******************************************************************************/

/**
 * Get all posts.
 */
function getAll(): Promise<IPost[]> {
  return PostRepo.getAll();
}

/**
 * Get one post by their id.
 */
async function getById(id: number): Promise<IPost | null> {
  const post = await PostRepo.getOne(id);
  if (!post) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, POST_NOT_FOUND_ERR);
  }

  // Return post
  return post;
}

/**
 * Add one post.
 */
function addOne(post: IPost): Promise<void> {
  return PostRepo.add(post);
}

/**
 * Update one post.
 */
async function updateOne(post: IPost): Promise<void> {
  const persists = await PostRepo.persists(post.id);
  if (!persists) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, POST_NOT_FOUND_ERR);
  }
  // Return post
  return PostRepo.update(post);
}

/**
 * Delete a post by their id.
 */
async function _delete(id: number): Promise<void> {
  const persists = await PostRepo.persists(id);
  if (!persists) {
    throw new RouteError(HttpStatusCodes.NOT_FOUND, POST_NOT_FOUND_ERR);
  }
  // Delete post
  return PostRepo.delete(id);
}

/**
 * Search posts by title or summary.
 */
async function search(query: string): Promise<IPost[]> {
  return PostRepo.search(query);
}

/******************************************************************************
                                Export default
******************************************************************************/

export default {
  getAll,
  getById,
  addOne,
  updateOne,
  delete: _delete,
  search,
} as const;
