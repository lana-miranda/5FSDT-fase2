import insertUrlParams from 'inserturlparams';
import { customDeepCompare } from 'jet-validators/utils';

import PostRepo from '../src/repos/PostRepo';
import Post, { IPost } from '@src/models/Post';
import { POST_NOT_FOUND_ERR } from '@src/services/PostService';

import HttpStatusCodes from '@src/common/constants/HttpStatusCodes';
import { ValidationError } from '@src/common/util/route-errors';

import Paths from './common/Paths';
import { parseValidationErr, TRes } from './common/util';
import { agent } from './support/setup';

const fakePosts: IPost[] = [
  Post.new({
    id: 1,
    title: 'First post',
    summary: 'first post summary',
    content: 'Content of the first post',
    teacherId: 1,
  }),
  Post.new({
    id: 2,
    title: 'Second post',
    summary: 'second post summary',
    content: 'Content of the second post',
    teacherId: 1,
  }),
  Post.new({
    id: 3,
    title: 'Third post',
    summary: 'third post summary',
    content: 'Content of the third post',
    teacherId: 1,
  }),
] as const;

const comparePostArrays = customDeepCompare({
  onlyCompareProps: ['id'],
});

const getPathById = (id: number) => insertUrlParams(Paths.Posts.ById, { id });

describe('PostRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Get all posts
  describe(`"GET: ${Paths.Posts.Base}"`, () => {
    // Success
    it(
      'should return a JSON object with all the posts and a status code ' +
        `of "${HttpStatusCodes.OK}" if the request was successful.`,
      async () => {
        vi.spyOn(PostRepo, 'getAll').mockResolvedValue(fakePosts);
        const res: TRes<{ posts: IPost[] }> = await agent.get(Paths.Posts.Base);
        expect(res.status).toBe(HttpStatusCodes.OK);
        expect(comparePostArrays(res.body.posts, fakePosts)).toBeTruthy();
        expect(PostRepo.getAll).toHaveBeenCalledTimes(1);
      },
    );
  });

  // Get post by id
  describe(`"GET: ${Paths.Posts.ById}"`, () => {
    // Success
    it(
      'should return a JSON object with all the posts and a status code ' +
        `of "${HttpStatusCodes.OK}" if the request was successful.`,
      async () => {
        vi.spyOn(PostRepo, 'getOne').mockResolvedValue(fakePosts[0]);
        const res: TRes<{ post: IPost }> = await agent.get(
          getPathById(fakePosts[0].id),
        );
        expect(res.status).toBe(HttpStatusCodes.OK);
        expect(comparePostArrays(res.body.post, fakePosts[0])).toBeTruthy();
        expect(PostRepo.getOne).toHaveBeenCalledTimes(1);
        expect(PostRepo.getOne).toHaveBeenCalledWith(fakePosts[0].id);
      },
    );
  });

  // Test add post
  describe(`"POST: ${Paths.Posts.Base}"`, () => {
    // Test add post success
    it(
      `should return a status code of "${HttpStatusCodes.CREATED}" if the ` +
        'request was successful.',
      async () => {
        vi.spyOn(PostRepo, 'add').mockResolvedValue(undefined);
        const post = Post.new({
            title: 'new post',
            summary: 'new post summary',
            content: 'new post content',
            teacherId: 1,
          }),
          res = await agent.post(Paths.Posts.Base).send({ post });
        expect(res.status).toBe(HttpStatusCodes.CREATED);
        expect(PostRepo.add).toHaveBeenCalledTimes(1);
        expect(PostRepo.add).toHaveBeenCalledWith(post);
      },
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
      },
    );
  });

  // Update posts
  describe(`"PUT: ${Paths.Posts.ById}"`, () => {
    // Success
    it(
      `should return a status code of "${HttpStatusCodes.OK}" if the ` +
        'request was successful.',
      async () => {
        vi.spyOn(PostRepo, 'getOne').mockResolvedValue(fakePosts[0]);
        vi.spyOn(PostRepo, 'update').mockResolvedValue(undefined);
        const post = fakePosts[0];
        post.title = 'New Title';
        const res = await agent.put(getPathById(post.id)).send({ post });
        expect(res.status).toBe(HttpStatusCodes.OK);
        expect(PostRepo.getOne).toHaveBeenCalledTimes(1);
        expect(PostRepo.getOne).toHaveBeenCalledWith(post.id);
        expect(PostRepo.update).toHaveBeenCalledTimes(1);
        expect(PostRepo.update).toHaveBeenCalledWith(post);
      },
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
        expect(PostRepo.getOne).not.toHaveBeenCalled();
        expect(PostRepo.update).not.toHaveBeenCalled();
      },
    );

    // Post not found
    it(
      'should return a JSON object with the error message of ' +
        `"${POST_NOT_FOUND_ERR}" and a status code of ` +
        `"${HttpStatusCodes.NOT_FOUND}" if the id was not found.`,
      async () => {
        vi.spyOn(PostRepo, 'getOne').mockResolvedValue(null);
        vi.spyOn(PostRepo, 'update');
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
        expect(PostRepo.getOne).toHaveBeenCalledTimes(1);
        expect(PostRepo.getOne).toHaveBeenCalledWith(post.id);
        expect(PostRepo.update).not.toHaveBeenCalled();
      },
    );
  });

  // Delete Post
  describe(`"DELETE: ${Paths.Posts.ById}"`, () => {
    // Success
    it(
      `should return a status code of "${HttpStatusCodes.OK}" if the ` +
        'request was successful.',
      async () => {
        vi.spyOn(PostRepo, 'getOne').mockResolvedValue(fakePosts[0]);
        vi.spyOn(PostRepo, 'remove').mockResolvedValue(undefined);
        const post = fakePosts[0];
        const id = post.id,
          res = await agent.delete(getPathById(id));
        expect(res.status).toBe(HttpStatusCodes.OK);
        expect(PostRepo.getOne).toHaveBeenCalledTimes(1);
        expect(PostRepo.getOne).toHaveBeenCalledWith(id);
        expect(PostRepo.remove).toHaveBeenCalledTimes(1);
        expect(PostRepo.remove).toHaveBeenCalledWith(id);
      },
    );

    // Post not found
    it(
      'should return a JSON object with the error message of ' +
        `"${POST_NOT_FOUND_ERR}" and a status code of ` +
        `"${HttpStatusCodes.NOT_FOUND}" if the id was not found.`,
      async () => {
        vi.spyOn(PostRepo, 'getOne').mockResolvedValue(null);
        vi.spyOn(PostRepo, 'remove');
        const res: TRes = await agent.delete(getPathById(4));
        expect(res.status).toBe(HttpStatusCodes.NOT_FOUND);
        expect(res.body.error).toBe(POST_NOT_FOUND_ERR);
        expect(PostRepo.getOne).toHaveBeenCalledTimes(1);
        expect(PostRepo.getOne).toHaveBeenCalledWith(4);
        expect(PostRepo.remove).not.toHaveBeenCalled();
      },
    );
  });

  // Search posts
  describe(`"GET: ${Paths.Posts.Search}"`, () => {
    // Success
    it(
      'should return a JSON object with all the posts and a status code ' +
        `of "${HttpStatusCodes.OK}" if the request was successful.`,
      async () => {
        vi.spyOn(PostRepo, 'search').mockResolvedValue(fakePosts.slice(0, 1));
        const res: TRes<{ posts: IPost[] }> = await agent
          .get(Paths.Posts.Search)
          .query({ q: 'First' });
        expect(res.status).toBe(HttpStatusCodes.OK);
        expect(
          comparePostArrays(res.body.posts, fakePosts.slice(0, 1)),
        ).toBeTruthy();
        expect(PostRepo.search).toHaveBeenCalledTimes(1);
        expect(PostRepo.search).toHaveBeenCalledWith('First');
      },
    );
  });
});
