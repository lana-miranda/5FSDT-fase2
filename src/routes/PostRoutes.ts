import { isNumber } from 'jet-validators';
import { transform } from 'jet-validators/utils';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import PostService from '@src/services/PostService';
import Post from '@src/models/Post';

import { IReq, IRes } from './common/types';
import { parseReq } from './common/util';

/******************************************************************************
                                Constants
******************************************************************************/

const Validators = {
  add: parseReq({ post: Post.test }),
  update: parseReq({ post: Post.test }),
  delete: parseReq({ id: transform(Number, isNumber) }),
} as const;

/******************************************************************************
                                Functions
******************************************************************************/

/**
 * Get all posts.
 */
async function getAll(_: IReq, res: IRes) {
  const posts = await PostService.getAll();
  res.status(HttpStatusCodes.OK).json({ posts });
}

/**
 * Get one post by their id.
 */
async function getById(req: IReq, res: IRes) {
  const { id } = Validators.delete(req.params);
  const post = await PostService.getById(id);
  if (!post) {
    res.status(HttpStatusCodes.NOT_FOUND).end();
    return;
  }
  res.status(HttpStatusCodes.OK).json({ post });
}

/**
 * Add one post.
 */
async function add(req: IReq, res: IRes) {
  const { post } = Validators.add(req.body);
  await PostService.addOne(post);
  res.status(HttpStatusCodes.CREATED).end();
}

/**
 * Update one post.
 */
async function update(req: IReq, res: IRes) {
  const { post } = Validators.update(req.body);
  await PostService.updateOne(post);
  res.status(HttpStatusCodes.OK).end();
}

/**
 * Delete one post.
 */
async function delete_(req: IReq, res: IRes) {
  const { id } = Validators.delete(req.params);
  await PostService.delete(id);
  res.status(HttpStatusCodes.OK).end();
}

/**
 * Search posts by title or summary.
 */
async function search(req: IReq, res: IRes) {
  const { q } = req.query;
  if (typeof q !== 'string') {
    res.status(HttpStatusCodes.BAD_REQUEST).end();
    return;
  }
  const posts = await PostService.search(q);
  res.status(HttpStatusCodes.OK).json({ posts });
}

/******************************************************************************
                                Export default
******************************************************************************/

export default {
  getAll,
  getById,
  add,
  update,
  delete: delete_,
  search,
} as const;
