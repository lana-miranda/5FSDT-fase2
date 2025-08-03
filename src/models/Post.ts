import { isString } from 'jet-validators';
import { parseObject, TParseOnError } from 'jet-validators/utils';
import { isRelationalKey, transIsDate } from '@src/common/util/validators';
import { IModel } from './common/types';

/******************************************************************************
                                 Constants
******************************************************************************/

const DEFAULT_POST_VALS = (): IPost => ({
  id: -1,
  title: '',
  summary: '',
  content: '',
  teacherId: -1,
  createdAt: new Date(),
  updatedAt: new Date(),
});

/******************************************************************************
                                  Types
******************************************************************************/

export interface IPost extends IModel {
  title: string;
  summary: string;
  content: string;
  teacherId: number;
}

/******************************************************************************
                                  Setup
******************************************************************************/

// Initialize the "parsePost" function
const parsePost = parseObject<IPost>({
  id: isRelationalKey,
  title: isString,
  summary: isString,
  content: isString,
  teacherId: isRelationalKey,
  createdAt: transIsDate,
  updatedAt: transIsDate,
});

/******************************************************************************
                                 Functions
******************************************************************************/

/**
 * New post object.
 */
function __new__(post?: Partial<IPost>): IPost {
  const retVal = { ...DEFAULT_POST_VALS(), ...post };
  return parsePost(retVal, (errors) => {
    throw new Error('Setup new post failed ' + JSON.stringify(errors, null, 2));
  });
}

/**
 * Check is a post object. For the route validation.
 */
function test(arg: unknown, errCb?: TParseOnError): arg is IPost {
  return !!parsePost(arg, errCb);
}

/******************************************************************************
                                Export default
******************************************************************************/

export default {
  new: __new__,
  test,
} as const;
