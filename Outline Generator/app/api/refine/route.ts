import { NextRequest, NextResponse } from "next/server";
import { getSectionsContent, getOutline } from "@/service/gpt-service";
import { getSearchVolume } from "@/service/kws-search-vol";
import { modifyAndCheckUrl } from "@/service/url-validator";
import { GptErrors } from "@/errors/gpt-errors";
import {contextStack} from "@/service/contextStack";

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
  const userId = req.headers.get("user_id") as string;
  try {
    contextStack.push({ User: { Id: userId } });
    const body = await req.json();
    const sections = body.sections;
    let sectionsContent = await getSectionsContent(sections, body.userWorkPosition, body.targetAudience);
    let outline = await getOutline(body.topic, body.difficulty, body.client ,body.additionalInfo, body.userWorkPosition, body.userInterests, body.targetAudience);
    let retries = 2;

    while (outline === "No valid JSON found" && retries > 0) {
      outline = await getOutline(
        body.topic,
        body.difficulty,
        body.client,
        body.additionalInfo,
        body.userWorkPosition,
         body.userInterests,
         body.targetAudience
      );
      retries--;
    }

    outline["Suggested Outline"]["Sections"] = sectionsContent;

    let allUrls = [];
    allUrls.push(outline.URL);
    for(let i = 0; i < outline["Highlighted Referenced Links"].length; i++) {
      allUrls.push(outline["Highlighted Referenced Links"][i]);
    }
    
    let validUrls = [];
    for(let i = 0; i < allUrls.length; i++){
      let validUrl = await modifyAndCheckUrl(allUrls[i]);
      validUrls.push(validUrl);
    }
    outline.URL = validUrls[0];
    outline["Highlighted Referenced Links"] = validUrls.slice(1);

    const finalOutline = await getSearchVolume(outline);
    contextStack.pop();
    return NextResponse.json({ data: finalOutline }, { status: 200, headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }});
  } catch (error) {
    console.error({userId: contextStack.peek()?.User.Id});
    contextStack.pop();
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
