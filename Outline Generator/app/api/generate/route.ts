import { NextRequest, NextResponse } from "next/server";
import { getSectionHeadings } from "@/service/gpt-service";
import { GptErrors } from "@/errors/gpt-errors";
import { contextStack } from "@/service/contextStack";
import { jwtVerify } from 'jose';
import { JWK, JWTHeaderParameters } from 'jose';
import * as jose from 'jose';

const JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

async function getJWKS() {
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

// CORS preflight handler
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*", // Change to your frontend domain in production
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch (jsonErr) {
    console.error("Invalid JSON in request body:", jsonErr);
    return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400, headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }});
  }

  // Validate required fields
  const { userId, topic, additionalInfo, difficulty, workPosition, interests, targetAudience } = body || {};
  if (!userId || !topic) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400, headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }});
  }

  // Defensive filtering for arrays
  const safeInterests = (interests || []).filter((x: any) => x !== undefined);
  const safeTargetAudience = (targetAudience || []).filter((x: any) => x !== undefined);

  try {
    contextStack.push({ User: { Id: userId } });

    let sectionHeadings = await getSectionHeadings(
      topic,
      additionalInfo,
      difficulty,
      workPosition,
      safeInterests,
      safeTargetAudience
    );

    let retries = 2;
    while (sectionHeadings === "No valid JSON found" && retries > 0) {
      sectionHeadings = await getSectionHeadings(
        topic,
        additionalInfo,
        difficulty,
        workPosition,
        safeInterests,
        safeTargetAudience
      );
      retries--;
    }

    contextStack.pop();
    return NextResponse.json({ data: sectionHeadings }, { status: 200, headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }});

  } catch (error) {
    console.error("Unexpected error in /api/generate:", error);
    console.error("Request body:", body);
    console.error({ userId: contextStack.peek()?.User.Id });
    contextStack.pop();
    console.log(error);

    // Same error handling block as before, but add CORS headers to all responses
    if (
      error instanceof GptErrors.APIConnectionError ||
      error instanceof GptErrors.APITimeoutError ||
      error instanceof GptErrors.InternalServerError
    ) {
      return NextResponse.json({ error: error.message }, {
        status: 503,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    } else if (error instanceof GptErrors.AuthenticationError) {
      return NextResponse.json({ error: error.message }, {
        status: 401,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    } else if (error instanceof GptErrors.BadRequestError) {
      return NextResponse.json({ error: error.message }, {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    } else if (error instanceof GptErrors.ConflictError) {
      return NextResponse.json({ error: error.message }, {
        status: 409,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    } else if (error instanceof GptErrors.NotFoundError) {
      return NextResponse.json({ error: error.message }, {
        status: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    } else if (error instanceof GptErrors.PermissionDeniedError) {
      return NextResponse.json({ error: error.message }, {
        status: 403,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    } else if (error instanceof GptErrors.RateLimitError) {
      return NextResponse.json({ error: error.message }, {
        status: 429,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    } else if (error instanceof GptErrors.UnprocessableEntityError) {
      return NextResponse.json({ error: error.message }, {
        status: 422,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    } else {
      return NextResponse.json({ error: "Internal server error" }, {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }
  }
}
