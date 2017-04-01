[
  {
    layout: {
      sideLeft: 'layouts/Sideleft',

      default: { file: 'layouts/Default', props: route => ({ activeTab: route.options.type }), routes: [
        { path: '/', file: 'Index', options: { type: 'home' } },
        { path: '/articles', file: 'Articles', options: { type: 'article' } },
        { path: '/articles/:id', file: 'ArticleDetail', options: { type: 'article' }, props: route => ({ id: route.params.id }) }
      ] },

      sideRight: { file: 'layouts/Sideright', children: {
        panelOne: { file: 'layouts/NewsPanel', props: route => ({ category: route.params.type || route.options.type || 'default' }) },
        panelTwo: 'layouts/Ads'
      } }
    }
  },

  { path: '/500', file: '500' },
  { path: '/404', file: '404' },
  { path: '*', file: '404' }
]
