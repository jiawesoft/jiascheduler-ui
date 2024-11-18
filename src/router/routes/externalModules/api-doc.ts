const currentOrigin = window.location.origin;
const DOC = {
  path: `${currentOrigin}/doc`,
  name: 'doc',
  meta: {
    locale: 'menu.apiDoc',
    icon: 'icon-link',
    requiresAuth: true,
    hideInMenu: true,
    order: 8,
  },
};

export default DOC;
