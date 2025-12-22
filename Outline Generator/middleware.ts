import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { JWK, JWTHeaderParameters } from 'jose';
import * as jose from 'jose';
import { cookies } from 'next/headers';
import { toast } from 'react-toastify';
import { clearCookies } from './http/api';
import error from 'next/error';
import router from 'next/router';
import { signOutUser } from './lib/firebaseClient';
 
async function refreshIdToken(refreshToken: string): Promise<string | null> {
  const response = await fetch(`https://securetoken.googleapis.com/v1/token?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}
  `, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
  });

  if (!response.ok) {
    console.error('Failed to refresh ID token:', await response.json());
    return null;
  }

  const data = await response.json();
  return data.id_token;
}


interface JWKS {
  keys: JWK[];
}

const JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

async function getJWKS(): Promise<JWKS> {
  const response = await fetch(JWKS_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch JWKS');
  }
  return response.json();
}

async function getKey(header: JWTHeaderParameters) {
  const jwks = await getJWKS();
  const key = jwks.keys.find((key: JWK) => key.kid === header.kid);
  if (!key) {
    throw new Error('Key not found in JWKS');
  }

  const { kty, n, e } = key;

  return await jose.importJWK({ kty, n, e }, 'RS256');
}


export async function middleware(req: NextRequest) {
  // Allow all OPTIONS requests to pass through (for CORS preflight)
  if (req.method === 'OPTIONS') {
    return NextResponse.next();
  }
  console.log('MIDDLEWARE STARTED');
  console.log('reached middleware');
  const authHeader = req.headers.get('Authorization');
  console.log('Incoming Authorization header:', authHeader);
  let token = authHeader?.split('Bearer ')[1];
  console.log('Extracted token:', token);

  if (!token) {
    return NextResponse.json({ error: 'No Authorization header' }, { status: 401 });
  }

  try {
    console.log('old token: ' + token);
    const { payload } = await jwtVerify(token, getKey);
    const userId: string = payload.user_id as string;

    if (req.method === 'POST') {
      let body = {};
      try {
        body = await req.json();
      } catch (e) {
        // If no body or invalid JSON, keep as empty object
      }
      const newBody = JSON.stringify({ ...body, user_id: userId });
      const newReq = new NextRequest(req.url, {
        method: req.method,
        headers: req.headers,
        body: newBody,
      });
      return NextResponse.next({ request: newReq });
    } else {
      return NextResponse.next();
    }
  } catch (err) {
    console.error('ENTERED CATCH BLOCK');
    console.error('Token verification failed:', err);

    // Check for expired token error
    const errorAny = err as any;
    if (errorAny.code === 'ERR_JWT_EXPIRED') {
      // Try to get refresh token from cookies
      const refreshToken = req.cookies.get('refreshToken')?.value;
      if (refreshToken) {
        const newIdToken = await refreshIdToken(refreshToken);
        if (newIdToken) {
          try {
            // Try verifying the new token
            const { payload } = await jwtVerify(newIdToken, getKey);
            const userId: string = payload.user_id as string;

            // Optionally, set the new token in a cookie for the client
            const response = NextResponse.next();
            response.cookies.set('idToken', newIdToken, {
              httpOnly: true,
              secure: true,
              sameSite: 'none',
              domain: '.infrasity.com', // Set to your root domain
              path: '/',
            });

            // If POST, add user_id to body as before
            if (req.method === 'POST') {
              let body = {};
              try {
                body = await req.json();
              } catch (e) {}
              const newBody = JSON.stringify({ ...body, user_id: userId });
              const newReq = new NextRequest(req.url, {
                method: req.method,
                headers: req.headers,
                body: newBody,
              });
              return NextResponse.next({ request: newReq });
            } else {
              return response;
            }
          } catch (verifyErr) {
            // If new token also fails, return 401
            return NextResponse.json({ error: 'Unauthorized: Invalid or expired token after refresh' }, { status: 401 });
          }
        }
      }
    }

    return NextResponse.json({ error: 'Unauthorized: Invalid or expired token' }, { status: 401 });
  }
}

export const config = {
  matcher: ['/api/generate', '/api/refine', '/api/export-docx', '/api/test'],
};
