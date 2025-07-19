import { Router } from 'express';

import Paths from '@src/common/constants/Paths';
import PostRoutes from './PostRoutes';

/******************************************************************************
                                Setup
******************************************************************************/

const apiRouter = Router();

const postsRouter = Router();

postsRouter.get('/', PostRoutes.getAll);
postsRouter.get(Paths.Posts.ById, PostRoutes.getById);
postsRouter.post('/', PostRoutes.add);
postsRouter.put(Paths.Posts.ById, PostRoutes.update);
postsRouter.delete(Paths.Posts.ById, PostRoutes.delete);
postsRouter.get(Paths.Posts.Search, PostRoutes.search);

apiRouter.use(Paths.Posts.Base, postsRouter);

/******************************************************************************
                                Export default
******************************************************************************/

export default apiRouter;
