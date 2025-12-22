import OpenAI from "openai";
import { GptErrors } from "@/errors/gpt-errors";
import { jsonifyService } from "./jsonify-service";

const apiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({ apiKey });

// const model2 = "gpt-4o";
// const model = "gpt-4-0125-preview";

const model = process.env.OPENAI_MODEL as string;

export const getOutline = async (
  topic: string,
  difficulty: string,
  client: string,
  additionalInfo: string,
  // Temprory for user persona integration
  userWorkPosition: string,
  userInterests: string[],
  targetAudience: string[]
) => {
  try {

    const contextOne = `

    I am a ${userWorkPosition} and you are an experienced tech content creator, your task is to craft a comprehensive content outline for a blog post on a specific topic for me. Remember that a big chunk i.e ~80% of content must revolve around my field of expertise, and rest can be more topic domain centric. The outline should be meticulously structured, offering depth and detailed insight appropriate for the indicated difficulty level, topic and client (these will be provided as inputs).

    Please ensure the outline includes:
    - A captivating Title that accurately reflects the topic and appeals to the target audience and aligns my field of expertise with the topic.
    - A Brief that provides a succinct overview of the blog post's content and its value to the reader.
    - Most relevant existing valid URL according to the topic, could be a documentation, a webpage, a blog post, etc.
    - An estimated Word Count that aligns with the depth required for the <input-difficulty-level> .
    - The Target Intent behind the blog post, explaining the primary action or understanding you wish the reader to take away.
    - Target Audience should be ${targetAudience.join(',')}. Don't add any more just strictly keep them this.
    - The Page Template style or format that the blog post should follow.
    - Keywords’ global search volume information, highlighting a Focus keyword and relevant Longtail KWs, each with their search volumes(numbers) to underscore their importance and relevance to the topic. Strictly use only one word for focus keyword and two words at max for longtail keywords.
    - A list of Commonly Asked Questions that the blog post should address. That aligns my field with the topic given.
    - A Suggested Outline for the blog post, structured with:
    - A primary header (h1) that introduces the topic.
    - Multiple sections (h2), each with a specific focus, including titles and bullet points or short paragraphs (Content) that detail key points, arguments, data, hands-on tutorial, or insights to be covered in each section. Must be relevant to my field.
    - Each section should also mention the number of paragraphs it would take.
    - Highlighted Referenced Links that offer additional resources or citations which the blog post will reference or build upon. These should be valid and existing links that align with the topic.

    This outline should serve as a strategic blueprint for creating a blog post that resonates with the intended audience, fulfils the specified difficulty level (<input-difficulty>), and achieves the blog post's objectives.  Next you'll be provided with the format to give outline in.

    `;

    const responseOne = `
    Certainly, I can craft a content outline based on the format you'll provide. Please go ahead and share the specific topic, difficulty level, target audience, and any other relevant details that you'd like me to include in the content outline.
    `;


    // {
    //   "Brief": "",
    //   "Title": "",
    //   "URL": "",
    //   "Word Count": "",
    //   "Target Intent": "",
    //   "Target Audience": [<list-of-strings example: "React Developers", "Web Developers seeking to enhance application security", etc.>],
    //   "Page Template": "",
    //   "Difficulty Level": <input-difficulty>,
    //   "Keywords’ global search volume": {
    //     "Focus keyword": {"keyword": "search volume"},
    //     "Longtail KWs": {"keyword": "search volume", "keyword": "search volume", "keyword": "search volume"}
    //   },
    //   "Commonly Asked Questions": [],
    //   "Suggested Outline": {
    //     "h1": "",
    //     "Sections": [
    //       {
    //         "h2": "",
    //         "paragraphs":"",
    //         "Content": []
    //       },
    //     ]
    //   },
    //   "Highlighted Referenced Links": []
    // }

    const contextTwo = `
    {
      Title: string,
      Brief: string,
      URL: string,
      "Word Count": string,
      "Target Intent": string,
      "Target Audience": string[],
      "Page Template": string,
      "Difficulty Level": string,
      "Keywords’ global search volume": {
        "Focus keyword": { [key: string]: number },
        "Longtail KWs": { [key: string]: number },
      },
      "Commonly Asked Questions": string[],
      "Suggested Outline": {
        h1: string,
        Sections: {
          h2: string;
          Content: string[],
          paragraphs: number,
        }[],
      };
      "Highlighted Referenced Links": string[],
    }
    

    this is the json format in which you will be giving the content outline in, on providing you with the topic, difficulty and client.
    The outline should be tailored to cater to the target audience, ensuring that the content is engaging, relevant, accessible, based on my field of work, knowledge level, and expectations.
  
    `;

    const responseTwo = `
    Great! Please provide me with the specific topic, difficulty level, and client details (if any), and I will create a content outline following the format you've shared.
    `;
    let mainPrompt = `
    Topic: ${topic},
    Difficulty Level: ${difficulty},
    Client: ${client}
    `;

    const additionalInfoPrompt = `Here is some additional information provided:\n ${additionalInfo}.\nYou can use this information to further enhance the content outline and its relation with my field of work.`;

    if (additionalInfo.length !== 0) {
      mainPrompt = mainPrompt.concat(additionalInfoPrompt);
    }

    let chatContext: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "user",
        content: contextOne,
      },
      {
        role: "assistant",
        content: responseOne,
      },
      {
        role: "user",
        content: contextTwo,
      },
      {
        role: "assistant",
        content: responseTwo,
      },
      {
        role: "user",
        content: mainPrompt,
      },
    ];

    const response: OpenAI.Chat.Completions.ChatCompletion =
      await openai.chat.completions.create({
        messages: chatContext,
        model: model,
      });

    const content = jsonifyService(
      response.choices[0].message.content as string
    );

    if (response.choices.length > 0) {
      return content;
    }
    return "No response from GPT";
  } catch (error) {
    console.error(error);
    if (error instanceof OpenAI.APIConnectionError) {
      throw new GptErrors.APIConnectionError("API Connection Error");
    } else if (error instanceof OpenAI.APIConnectionTimeoutError) {
      throw new GptErrors.APITimeoutError("API Timeout Error");
    } else if (error instanceof OpenAI.AuthenticationError) {
      throw new GptErrors.AuthenticationError("Authentication Error");
    } else if (error instanceof OpenAI.BadRequestError) {
      throw new GptErrors.BadRequestError("Bad Request Error");
    } else if (error instanceof OpenAI.ConflictError) {
      throw new GptErrors.ConflictError("Conflict Error");
    } else if (error instanceof OpenAI.InternalServerError) {
      throw new GptErrors.InternalServerError("Internal Server Error");
    } else if (error instanceof OpenAI.NotFoundError) {
      throw new GptErrors.NotFoundError("Not Found Error");
    } else if (error instanceof OpenAI.PermissionDeniedError) {
      throw new GptErrors.PermissionDeniedError("Permission Denied Error");
    } else if (error instanceof OpenAI.RateLimitError) {
      throw new GptErrors.RateLimitError("Rate Limit Error");
    } else if (error instanceof OpenAI.UnprocessableEntityError) {
      throw new GptErrors.UnprocessableEntityError(
        "Unprocessable Entity Error"
      );
    } else {
      throw new GptErrors.UnhandledError("Unhandled Error");
    }
  }
};

export const getSectionHeadings = async (
  topic: string,
  additionalInfo: string,
  difficulty: string,
  // Temprory for user persona integration
  userWorkPosition: string,
  userInterests: string[],
  targetAudience: string[]
) => {
  try {
    const p1 = `
    I am a ${userWorkPosition} and you are an experienced tech content creator, your task is to provide me with sections of an outline in json format just like below. Remember that a big chunk i.e ~80% of content must revolve around my field of expertise, and rest will be more topic's domain centric. Also remember that you are generating this for ${targetAudience.join(',')}.
	"Sections": [
  	  {
    	  "h2": "",
  	  },
	]
	Provide me with various subtopics (h2) from which user will select later on which to include and which not.`;


    const r1 = `
    Sure, I can help with that. However, I'll need a bit more context to tailor the outline appropriately. Could you specify the main topic or technology and the difficulty level that the content should cover, also if there is some additional information that i need to take care of, could you provide that ? This way, I can provide relevant subtopics for the outline.
    `;

    let p2 = `
    Topic: ${topic},\n
    Difficulty Level: ${difficulty} 
    `;
    
    if (additionalInfo && additionalInfo.length !== 0) {
      let p3 = `Here is some Additional Information: ${additionalInfo}, the subtopics should be relevant to this information.\n Main focus should be on the topic, additional information provided and their relation with my field of work. Subtopics should revolve around the additional information provided. Other subtopics can be added as well.`;
      p2 = p2 + p3;
    }

    let chatContext: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "user",
        content: p1,
      },
      {
        role: "assistant",
        content: r1,
      },
      {
        role: "user",
        content: p2,
      },
    ];

    const response: OpenAI.Chat.Completions.ChatCompletion =
      await openai.chat.completions.create({
        messages: chatContext,
        model: model,
      });

    const content = jsonifyService(
      response.choices[0].message.content as string
    );

    if (response.choices.length > 0) {
      return content;
    }
    return "No response from GPT";
  } catch (error) {
    console.error(error);
    if (error instanceof OpenAI.APIConnectionError) {
      throw new GptErrors.APIConnectionError("API Connection Error");
    } else if (error instanceof OpenAI.APIConnectionTimeoutError) {
      throw new GptErrors.APITimeoutError("API Timeout Error");
    } else if (error instanceof OpenAI.AuthenticationError) {
      throw new GptErrors.AuthenticationError("Authentication Error");
    } else if (error instanceof OpenAI.BadRequestError) {
      throw new GptErrors.BadRequestError("Bad Request Error");
    } else if (error instanceof OpenAI.ConflictError) {
      throw new GptErrors.ConflictError("Conflict Error");
    } else if (error instanceof OpenAI.InternalServerError) {
      throw new GptErrors.InternalServerError("Internal Server Error");
    } else if (error instanceof OpenAI.NotFoundError) {
      throw new GptErrors.NotFoundError("Not Found Error");
    } else if (error instanceof OpenAI.PermissionDeniedError) {
      throw new GptErrors.PermissionDeniedError("Permission Denied Error");
    } else if (error instanceof OpenAI.RateLimitError) {
      throw new GptErrors.RateLimitError("Rate Limit Error");
    } else if (error instanceof OpenAI.UnprocessableEntityError) {
      throw new GptErrors.UnprocessableEntityError(
        "Unprocessable Entity Error"
      );
    } else {
      throw new GptErrors.UnhandledError("Unhandled Error");
    }
  }
};

// export const getResponseForSection = async (section: string, userWorkPosition: string, targetAudience: string[]) => {
//   try {

//     const prompt = `
  
//     I am a ${userWorkPosition} and you are an expert tech content writer who is creating outline for a blog. This is a request for content outline for a specific section. Stick to the topic provided. Anything irrelevant to the topic should not be included. Remember that a big chunk i.e ~80% of content must revolve around my field of expertise, and rest will be more topic's domain centric.
//     Also remember that you are generating this for ${targetAudience.join(',')}
//     Below is the context for the section:
      
//     Heading: ${section}
//     Introduction: Provide a brief overview of the section theme, identifying key areas of focus.
//     Paragraphs: Specify the number of paragraphs expected. Aim for concise, in-depth coverage rather than length.
//     Content Points: List up to 5 specific, technical points or tasks that should be included under this heading. Focus on unique insights, advanced use cases, or detailed how-to guides relevant to the topic that will be ~80% focused on my area of expertise. Avoid generic descriptions. They should be short and concise.
//     Example:
//     {
//       "h2": "Introduction to Redis and Its Benefits",
//       "paragraphs": 2,
//       "Content": [
//         "What is Redis?",
//         "Why Redis is a great choice for Node.js applications",
//         "Benefits of using Redis in web development",
//       ]
//     }

//     If a heading relevant for a hands-on tutorial, then provide the steps for the tutorial. for example:
//     {
//       "h2": "Backstage Integration",
//       "paragraphs": 2,
//       "Content": [
//         "Step 1: Clone and set up a new Backstage instance or integrate into an existing one.",
//         "Step 2: Develop a custom Backstage plugin if existing plugins don’t meet your needs. This plugin will handle the IDP functionalities.",
//         "Step 3: Configure the GitHub authentication provider within Backstage for handling GitHub logins."
//       ]
//     }

//     Respond in json format. for example:
//     {
//       "h2": "Introduction to Redis and Its Benefits",
//       "paragraphs": 2,
//       "Content": [
//         "What is Redis?",
//         "Why Redis is a great choice for Node.js applications",
//         "Benefits of using Redis in web development",
//       ]
//     }`  
//     const response = await openai.chat.completions.create({
//       messages: [{
//         role: 'user',
//         content: prompt,
//       }],
//       model: model
//     });

//     const jsonResponse = jsonifyService(response.choices[0].message.content as string);
//     return jsonResponse;
//   } catch (error) {
//     console.error(error);
//     if (error instanceof OpenAI.APIConnectionError) {
//       throw new GptErrors.APIConnectionError("API Connection Error");
//     } else if (error instanceof OpenAI.APIConnectionTimeoutError) {
//       throw new GptErrors.APITimeoutError("API Timeout Error");
//     } else if (error instanceof OpenAI.AuthenticationError) {
//       throw new GptErrors.AuthenticationError("Authentication Error");
//     } else if (error instanceof OpenAI.BadRequestError) {
//       throw new GptErrors.BadRequestError("Bad Request Error");
//     } else if (error instanceof OpenAI.ConflictError) {
//       throw new GptErrors.ConflictError("Conflict Error");
//     } else if (error instanceof OpenAI.InternalServerError) {
//       throw new GptErrors.InternalServerError("Internal Server Error");
//     } else if (error instanceof OpenAI.NotFoundError) {
//       throw new GptErrors.NotFoundError("Not Found Error");
//     } else if (error instanceof OpenAI.PermissionDeniedError) {
//       throw new GptErrors.PermissionDeniedError("Permission Denied Error");
//     } else if (error instanceof OpenAI.RateLimitError) {
//       throw new GptErrors.RateLimitError("Rate Limit Error");
//     } else if (error instanceof OpenAI.UnprocessableEntityError) {
//       throw new GptErrors.UnprocessableEntityError(
//         "Unprocessable Entity Error"
//       );
//     } else {
//       throw new GptErrors.UnhandledError("Unhandled Error");
//     }
//   }
// }

// export const getSectionsContent = async (sections: string[], userWorkPosition: string, targetAudience: string[]) => {
//   try {
//     let preparedSections = [];
//     for(let i = 0; i < sections.length; i++){
//       let singleRes = await getResponseForSection(sections[i], userWorkPosition, targetAudience);
//       let retries = 2;
//       while(singleRes === "No valid JSON found" && retries > 0){
//         singleRes = await getResponseForSection(sections[i], userWorkPosition, targetAudience);
//         retries--;
//       }
//       preparedSections.push(singleRes);
//     }
//     return preparedSections;
//   } catch (error) {
//     console.error(error);
//     if (error instanceof OpenAI.APIConnectionError) {
//       throw new GptErrors.APIConnectionError("API Connection Error");
//     } else if (error instanceof OpenAI.APIConnectionTimeoutError) {
//       throw new GptErrors.APITimeoutError("API Timeout Error");
//     } else if (error instanceof OpenAI.AuthenticationError) {
//       throw new GptErrors.AuthenticationError("Authentication Error");
//     } else if (error instanceof OpenAI.BadRequestError) {
//       throw new GptErrors.BadRequestError("Bad Request Error");
//     } else if (error instanceof OpenAI.ConflictError) {
//       throw new GptErrors.ConflictError("Conflict Error");
//     } else if (error instanceof OpenAI.InternalServerError) {
//       throw new GptErrors.InternalServerError("Internal Server Error");
//     } else if (error instanceof OpenAI.NotFoundError) {
//       throw new GptErrors.NotFoundError("Not Found Error");
//     } else if (error instanceof OpenAI.PermissionDeniedError) {
//       throw new GptErrors.PermissionDeniedError("Permission Denied Error");
//     } else if (error instanceof OpenAI.RateLimitError) {
//       throw new GptErrors.RateLimitError("Rate Limit Error");
//     } else if (error instanceof OpenAI.UnprocessableEntityError) {
//       throw new GptErrors.UnprocessableEntityError(
//         "Unprocessable Entity Error"
//       );
//     } else {
//       throw new GptErrors.UnhandledError("Unhandled Error");
//     }
//   }
// }

//to remove repetition
// will add a toggle for this later on

export const getResponseForSection2 = async (
  section: string,
  userWorkPosition: string, 
  targetAudience: string[],
  preparedSections: string[],
) => {
  try {
    let prePrompt = `Here are the sections that have been provided till now: ${preparedSections}. Be extra careful to not repeat the sections. Points that are already written should not be included in any case whatsoever. Repetition and reduntation should not be there in anyway.\n`;
    let prompt = `
  
    I am a ${userWorkPosition} and you are an expert tech content writer who is creating outline for a blog. This is a request for content outline for a specific section. Stick to the topic provided. Anything irrelevant to the topic should not be included. Remember that a big chunk i.e ~80% of content must revolve around my field of expertise, and rest will be more topic's domain centric.
    Also remember that you are generating this for ${targetAudience.join(',')}
    Below is the context for the section:
      
    Heading: ${section}
    Introduction: Provide a brief overview of the section theme, identifying key areas of focus.
    Paragraphs: Specify the number of paragraphs expected. Aim for concise, in-depth coverage rather than length.
    Content Points: List up to 5 specific, technical points or tasks that should be included under this heading. Focus on unique insights, advanced use cases, or detailed how-to guides relevant to the topic that will be ~80% focused on my area of expertise. Avoid generic descriptions. They should be short and concise.
    Example:
    {
      "h2": "Introduction to Redis and Its Benefits",
      "paragraphs": 2,
      "Content": [
        "What is Redis?",
        "Why Redis is a great choice for Node.js applications",
        "Benefits of using Redis in web development",
      ]
    }

    If a heading relevant for a hands-on tutorial, then provide the steps for the tutorial. for example:
    {
      "h2": "Backstage Integration",
      "paragraphs": 2,
      "Content": [
        "Step 1: Clone and set up a new Backstage instance or integrate into an existing one.",
        "Step 2: Develop a custom Backstage plugin if existing plugins don’t meet your needs. This plugin will handle the IDP functionalities.",
        "Step 3: Configure the GitHub authentication provider within Backstage for handling GitHub logins."
      ]
    }

    Respond in json format. for example:
    {
      "h2": "Introduction to Redis and Its Benefits",
      "paragraphs": 2,
      "Content": [
        "What is Redis?",
        "Why Redis is a great choice for Node.js applications",
        "Benefits of using Redis in web development",
      ]
    }`  

    if (preparedSections.length !== 0) {
      prompt = prePrompt + prompt;
    }

    const response = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: model,
    });

    const jsonResponse = jsonifyService(
      response.choices[0].message.content as string
    );

    return jsonResponse;
  } catch (error) {
    console.error(error);
    if (error instanceof OpenAI.APIConnectionError) {
      throw new GptErrors.APIConnectionError("API Connection Error");
    } else if (error instanceof OpenAI.APIConnectionTimeoutError) {
      throw new GptErrors.APITimeoutError("API Timeout Error");
    } else if (error instanceof OpenAI.AuthenticationError) {
      throw new GptErrors.AuthenticationError("Authentication Error");
    } else if (error instanceof OpenAI.BadRequestError) {
      throw new GptErrors.BadRequestError("Bad Request Error");
    } else if (error instanceof OpenAI.ConflictError) {
      throw new GptErrors.ConflictError("Conflict Error");
    } else if (error instanceof OpenAI.InternalServerError) {
      throw new GptErrors.InternalServerError("Internal Server Error");
    } else if (error instanceof OpenAI.NotFoundError) {
      throw new GptErrors.NotFoundError("Not Found Error");
    } else if (error instanceof OpenAI.PermissionDeniedError) {
      throw new GptErrors.PermissionDeniedError("Permission Denied Error");
    } else if (error instanceof OpenAI.RateLimitError) {
      throw new GptErrors.RateLimitError("Rate Limit Error");
    } else if (error instanceof OpenAI.UnprocessableEntityError) {
      throw new GptErrors.UnprocessableEntityError(
        "Unprocessable Entity Error"
      );
    } else {
      throw new GptErrors.UnhandledError("Unhandled Error");
    }
  }
};

export const getSectionsContent = async (sections: string[], userWorkPosition: string, targetAudience: string[]) => {
  try {
    let preparedSections = [];
    let producedSections = [];
    for (let i = 0; i < sections.length; i++) {
      const singleRes = await getResponseForSection2(
        sections[i],
        userWorkPosition,
        targetAudience,
        producedSections
      );
      preparedSections.push(singleRes);
      // console.log(singleRes);
      let strigySection = JSON.stringify(singleRes);
      producedSections.push(strigySection);
    }
    return preparedSections;
  } catch (error) {
    console.error(error);
    if (error instanceof OpenAI.APIConnectionError) {
      throw new GptErrors.APIConnectionError("API Connection Error");
    } else if (error instanceof OpenAI.APIConnectionTimeoutError) {
      throw new GptErrors.APITimeoutError("API Timeout Error");
    } else if (error instanceof OpenAI.AuthenticationError) {
      throw new GptErrors.AuthenticationError("Authentication Error");
    } else if (error instanceof OpenAI.BadRequestError) {
      throw new GptErrors.BadRequestError("Bad Request Error");
    } else if (error instanceof OpenAI.ConflictError) {
      throw new GptErrors.ConflictError("Conflict Error");
    } else if (error instanceof OpenAI.InternalServerError) {
      throw new GptErrors.InternalServerError("Internal Server Error");
    } else if (error instanceof OpenAI.NotFoundError) {
      throw new GptErrors.NotFoundError("Not Found Error");
    } else if (error instanceof OpenAI.PermissionDeniedError) {
      throw new GptErrors.PermissionDeniedError("Permission Denied Error");
    } else if (error instanceof OpenAI.RateLimitError) {
      throw new GptErrors.RateLimitError("Rate Limit Error");
    } else if (error instanceof OpenAI.UnprocessableEntityError) {
      throw new GptErrors.UnprocessableEntityError(
        "Unprocessable Entity Error"
      );
    } else {
      throw new GptErrors.UnhandledError("Unhandled Error");
    }
  }
};
