const landingPath = '/pack-figurinhas';
export default {
  fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === landingPath) {
      url.pathname += '/';
      return Response.redirect(url, 308);
    }
    if (url.pathname.startsWith(landingPath + '/')) {
      url.pathname = url.pathname.slice(landingPath.length);
    }
    return env.ASSETS.fetch(new Request(url, request));
  },
};
