export const config = {
  matcher: '/auth/:path*',
};

const STATE_LENGTH = 3;

/**
 * 
 * @param {Request} request 
 * @param {import('@vercel/edge').RequestContext} context 
 */
export default async function middleware(request, context) {
  const url = new URL(request.url);

  try {
    if (url.pathname === "/auth/login") {
      const randomNumbers = new Uint8Array({ length: STATE_LENGTH });
      crypto.getRandomValues(randomNumbers);

      const signature = new Uint8Array(await crypto.subtle.sign("hmac", await getSignKey(), randomNumbers));
      const state = btoa(randomNumbers.join('-') + '.' + signature.join('-'));

      const { CLIENT_ID, SCOPE } = process.env;
      return Response.redirect('https://github.com/login/oauth/authorize?scope=' + SCOPE + '&client_id=' + CLIENT_ID + '&state=' + state);
    }
    else if (url.pathname === "/auth/authorize") {
      const stateParts = atob(url.searchParams.get('state')).split('.');
      if (stateParts.length !== 2) return new Response("Unauthorized", { status: 401 });

      const stateNumbers = new Uint8Array(stateParts[0].split('-').map(n => parseInt(n)));
      const stateSignature = new Uint8Array(stateParts[1].split('-').map(n => parseInt(n)));

      const validState = stateNumbers.length === STATE_LENGTH && await crypto.subtle.verify("hmac", await getSignKey(), stateSignature, stateNumbers);
      if (!validState) return new Response("Unauthorized", { status: 401 });
  
      const { SCOPE } = process.env;
      const tokenInfo = await fetchAccessToken(url.searchParams.get('code'));
      if (tokenInfo.scope === SCOPE) return new Response("Unauthorized", { status: 401 });

      const headers = new Headers();
      url.pathname = '/';
      url.search = '';
      headers.set('Location', url.toString());
      headers.set('Set-Cookie', 'token=' + tokenInfo.access_token + '; SameSite=Strict; Path=/api; Secure; HttpOnly');
      return new Response(null, { headers, status: 302 });
    }
  }
  catch (err) {
    console.error(err);
    return new Response("Unauthorized", { status: 401 });
  }
};

function getSignKey() {
  const { SIGN_KEY } = process.env;
  return crypto.subtle.importKey("jwk", { k: SIGN_KEY, kty: "oct" }, { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

async function fetchAccessToken(code) {
  const { CLIENT_ID, CLIENT_SECRET } = process.env;
  const res = await fetch(
    'https://github.com/login/oauth/access_token?client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET + '&code=' + code, 
    { method: 'POST', headers: { 'Accept': 'application/json' }}
  );

  return res.json();
}
