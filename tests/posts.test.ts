import insertUrlParams from 'inserturlparams';
import { customDeepCompare } from 'jet-validators/utils';

import PostRepo from '@src/repos/PostRepo';
import Post, { IPost } from '@src/models/Post';
import { POST_NOT_FOUND_ERR } from '@src/services/PostService';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { ValidationError } from '@src/common/util/route-errors';

import Paths from './common/Paths';
import { parseValidationErr, TRes } from './common/util';
import { agent } from './support/setup';

/******************************************************************************
                               Constants
******************************************************************************/

// Dummy posts for GET req
const DB_POSTS = [
  Post.new({
    title: 'First post',
    summary: 'first post summary',
    content: 'Content of the first post',
    teacherId: 1,
  }),
  Post.new({
    title: 'Second post',
    summary: 'second post summary',
    content: 'Content of the second post',
    teacherId: 1,
  }),
  Post.new({
    title: 'Third post',
    summary: 'third post summary',
    content: 'Content of the third post',
    teacherId: 1,
  }),
] as const;

// Don't compare "id" and "created" cause those are set dynamically by the
// database
const comparePostArrays = customDeepCompare({
  onlyCompareProps: ['id'],
});

const getPathById = (id: number) => insertUrlParams(Paths.Posts.ById, { id });

/******************************************************************************
                                 Tests
  IMPORTANT: Following TypeScript best practices, we test all scenarios that 
  can be triggered by a post under normal circumstances. Not all theoretically
  scenarios (i.e. a failed database connection). 
******************************************************************************/

describe('PostRouter', () => {
  let dbPosts: IPost[] = [];

  // Run before all tests
  beforeEach(async () => {
    await PostRepo.deleteAllPosts();
    dbPosts = await PostRepo.insertMult(DB_POSTS);
  });

  // Get all posts
  describe(`"GET: ${Paths.Posts.Base}"`, () => {
    // Success
    it(
      'should return a JSON object with all the posts and a status code ' +
        `of "${HttpStatusCodes.OK}" if the request was successful.`,
      async () => {
        const res: TRes<{ posts: IPost[] }> = await agent.get(Paths.Posts.Base);
        expect(res.status).toBe(HttpStatusCodes.OK);
        expect(comparePostArrays(res.body.posts, DB_POSTS)).toBeTruthy();
      }
    );
  });

  // Test add post
  describe(`"POST: ${Paths.Posts.Base}"`, () => {
    // Test add post success
    it(
      `should return a status code of "${HttpStatusCodes.CREATED}" if the ` +
        'request was successful.',
      async () => {
        const post = Post.new({
            title: 'new post',
            summary: 'new post summary',
            content: 'new post content',
            teacherId: 1,
          }),
          res = await agent.post(Paths.Posts.Base).send({ post });
        expect(res.status).toBe(HttpStatusCodes.CREATED);
      }
    );

    // Missing param
    it(
      'should return a JSON object with an error message of and a status ' +
        `code of "${HttpStatusCodes.BAD_REQUEST}" if the post param was ` +
        'missing.',
      async () => {
        const res: TRes = await agent
          .post(Paths.Posts.Base)
          .send({ post: null });
        expect(res.status).toBe(HttpStatusCodes.BAD_REQUEST);
        const errorObj = parseValidationErr(res.body.error);
        expect(errorObj.message).toBe(ValidationError.MESSAGE);
        expect(errorObj.errors[0].prop).toBe('post');
      }
    );
  });

  // Update posts
  describe(`"PUT: ${Paths.Posts.ById}"`, () => {
    // Success
    it(
      `should return a status code of "${HttpStatusCodes.OK}" if the ` +
        'request was successful.',
      async () => {
        const post = DB_POSTS[0];
        post.title = 'New Title';
        const res = await agent.put(getPathById(post.id)).send({ post });
        expect(res.status).toBe(HttpStatusCodes.OK);
      }
    );

    // Id is the wrong data type
    it(
      'should return a JSON object with an error message and a status code ' +
        `of "${HttpStatusCodes.BAD_REQUEST}" if the post param was missing`,
      async () => {
        const post = Post.new();
        post.id = '5' as unknown as number;
        const res: TRes = await agent.put(getPathById(post.id)).send({ post });
        expect(res.status).toBe(HttpStatusCodes.BAD_REQUEST);
        const errorObj = parseValidationErr(res.body.error);
        expect(errorObj.message).toBe(ValidationError.MESSAGE);
        expect(errorObj.errors[0].prop).toBe('post');
        expect(errorObj.errors[0].children?.[0].prop).toBe('id');
      }
    );

    // Post not found
    it(
      'should return a JSON object with the error message of ' +
        `"${POST_NOT_FOUND_ERR}" and a status code of ` +
        `"${HttpStatusCodes.NOT_FOUND}" if the id was not found.`,
      async () => {
        const post = Post.new({
            id: 4,
            title: 'new post',
            summary: 'new post summary',
            content: 'new post content',
            teacherId: 1,
          }),
          res: TRes = await agent.put(getPathById(post.id)).send({ post });
        expect(res.status).toBe(HttpStatusCodes.NOT_FOUND);
        expect(res.body.error).toBe(POST_NOT_FOUND_ERR);
      }
    );
  });

  // Delete Post
  describe(`"DELETE: ${Paths.Posts.ById}"`, () => {
    // Success
    it(
      `should return a status code of "${HttpStatusCodes.OK}" if the ` +
        'request was successful.',
      async () => {
        const id = dbPosts[0].id,
          res = await agent.delete(getPathById(id));
        expect(res.status).toBe(HttpStatusCodes.OK);
      }
    );

    // Post not found
    it(
      'should return a JSON object with the error message of ' +
        `"${POST_NOT_FOUND_ERR}" and a status code of ` +
        `"${HttpStatusCodes.NOT_FOUND}" if the id was not found.`,
      async () => {
        const res: TRes = await agent.delete(getPathById(-1));
        expect(res.status).toBe(HttpStatusCodes.NOT_FOUND);
        expect(res.body.error).toBe(POST_NOT_FOUND_ERR);
      }
    );
  });
});
