export default {
  Base: '/api',
  Posts: {
    Base: '/posts',
    ById: '/:id',
    Search: '/search',
  },
} as const;
