import { OutlineType } from "@/domain/outline";

interface Props {
  data: OutlineType;
}

const ExampleOutline: React.FC<Props> = ({ data }) => {
  const convertObjectToJSONstring = (obj: Object) => {
    return JSON.stringify(obj);
  };

  return (
    <div className="p-4  bg-side-blue rounded-xl">
      <div className="flex-1 overflow-y-auto">
        <div className=" border border-primary bg-white w-full rounded-xl p-4 overflow-auto">
          <h1 className="text-2xl text-primary font-medium pt-6 pb-8 px-12 text-center self-center ">
            {typeof data.Title === "object"
              ? convertObjectToJSONstring(data.Title)
              : data.Title
              ? data.Title
              : ""}
          </h1>
          <table className="w-9/10 divide-y divide-gray-500 border border-gray-500">
            <tbody className=" divide-y divide-gray-500">
              <tr>
                <td className="px-6 py-4  text-sm font-semibold text-primary border-r border-gray-500 text-nowrap  ">
                  1. Brief
                </td>
                <td
                  className="px-6 py-4 text-sm text-text-primary w-full"
                  colSpan={2}
                >
                  {typeof data.Brief === "object"
                    ? convertObjectToJSONstring(data.Brief)
                    : data.Brief
                    ? data.Brief
                    : ""}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4  text-sm font-semibold text-primary border-r border-gray-500 text-nowrap  ">
                  2. URL
                </td>
                <td className="px-6 py-4 text-sm text-text-primary " colSpan={2}>
                  <a
                    href={data.URL}
                    target="_blank"
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    {typeof data.URL === "object"
                      ? convertObjectToJSONstring(data.URL)
                      : data.URL
                      ? data.URL
                      : ""}
                  </a>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4  text-sm font-semibold text-primary border-r border-gray-500 text-nowrap  ">
                  3. Word Count
                </td>
                <td className="px-6 py-4 text-sm text-text-primary " colSpan={2}>
                  {typeof data["Word Count"] === "object"
                    ? convertObjectToJSONstring(data["Word Count"])
                    : data["Word Count"]
                    ? data["Word Count"]
                    : ""}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4  text-sm font-semibold text-primary border-r border-gray-500 text-nowrap  ">
                  4. Target Intent
                </td>
                <td className="px-6 py-4 text-sm text-text-primary " colSpan={2}>
                  {typeof data["Target Intent"] === "object"
                    ? convertObjectToJSONstring(data["Target Intent"])
                    : data["Target Intent"]
                    ? data["Target Intent"]
                    : ""}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4  text-sm font-semibold text-primary border-r border-gray-500 text-nowrap  ">
                  5. Target Audience
                </td>
                <td className="px-6 py-4 text-sm text-text-primary " colSpan={2}>
                  <ul className="list-decimal pl-4">
                    {data["Target Audience"] &&
                      data["Target Audience"].length > 0 &&
                      data["Target Audience"].map((audience, index) => (
                        <li className="" key={index}>
                          {typeof audience === "object"
                            ? convertObjectToJSONstring(audience)
                            : audience}
                        </li>
                      ))}
                  </ul>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4  text-sm font-semibold text-primary border-r border-gray-500 text-nowrap  ">
                  6. Page Template
                </td>
                <td className="px-6 py-4 text-sm text-text-primary" colSpan={2}>
                  {typeof data["Page Template"] === "object"
                    ? convertObjectToJSONstring(data["Page Template"])
                    : data["Page Template"]
                    ? data["Page Template"]
                    : ""}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4  text-sm font-semibold text-primary border-r border-gray-500 text-nowrap  ">
                  7. Focus Keyword
                </td>
                <td className="px-6 py-4 text-sm text-text-primary border-r border-gray-500">
                  <ul className="list-disc pl-4">
                    {data["Keywords’ global search volume"] &&
                      data["Keywords’ global search volume"]["Focus keyword"] &&
                      Object.entries(
                        data["Keywords’ global search volume"]["Focus keyword"]
                      ).map(([keyword]) => (
                        <li className="" key={keyword}>
                          {typeof keyword === "object"
                            ? convertObjectToJSONstring(keyword)
                            : keyword}
                        </li>
                      ))}
                  </ul>
                </td>
                <td className="text-sm text-text-primary ">
                  <div className="text-xs p-1 font-semibold text-center text-primary border-b border-gray-500 ">
                    Global search <br /> volume(Keywords)
                  </div>
                  {data["Keywords’ global search volume"] &&
                    data["Keywords’ global search volume"]["Focus keyword"] &&
                    Object.entries(
                      data["Keywords’ global search volume"]["Focus keyword"]
                    ).map(([keyword, volume]) => (
                      <li className=" list-none text-center p-2" key={keyword}>
                        {typeof volume === "object"
                          ? convertObjectToJSONstring(volume)
                          : volume}
                      </li>
                    ))}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4  text-sm font-semibold text-primary border-r border-gray-500 text-nowrap ">
                  8. Longtail KWs
                </td>
                <td className="px-6 py-4 text-sm text-text-primary border-r border-gray-500">
                  <ul className="list-disc pl-4">
                    {data["Keywords’ global search volume"] &&
                      data["Keywords’ global search volume"]["Longtail KWs"] &&
                      Object.entries(
                        data["Keywords’ global search volume"]["Longtail KWs"]
                      ).map(([keyword]) => (
                        <li key={keyword}>
                          {typeof keyword === "object"
                            ? convertObjectToJSONstring(keyword)
                            : keyword}
                        </li>
                      ))}
                  </ul>
                </td>
                <td className="text-center p-2 text-sm text-text-primary border-r border-gray-500">
                  {data["Keywords’ global search volume"] &&
                    data["Keywords’ global search volume"]["Longtail KWs"] &&
                    Object.entries(
                      data["Keywords’ global search volume"]["Longtail KWs"]
                    ).map(([keyword, volume]) => (
                      <li className=" list-none" key={keyword}>
                        {typeof volume === "object"
                          ? convertObjectToJSONstring(volume)
                          : volume}
                      </li>
                    ))}
                </td>
              </tr>
            </tbody>
          </table>

          <h2 className="text-2xl font-semibold text-primary mt-6 mb-4 text-center ">
            Commonly Asked Questions
          </h2>
          <div className="flex flex-col items-start pb-8 ">
            <ul className="list-decimal pl-4">
              {data["Commonly Asked Questions"] &&
                data["Commonly Asked Questions"].map((question, index) => (
                  <li key={index}>
                    {typeof question === "object"
                      ? convertObjectToJSONstring(question)
                      : question}
                  </li>
                ))}
            </ul>
          </div>

          <hr />

          <div>
            <h2 className="text-2xl font-semibold mt-6 mb-2 text-center text-primary">
              Suggested Outline
            </h2>
            <div className="text-xl font-bold my-6 text-primary flex flex-col items-center">
              <div>
                H1 Title:{" "}
                {data["Suggested Outline"] &&
                  data["Suggested Outline"]["h1"] &&
                  data["Suggested Outline"]["h1"]}
              </div>
            </div>
            {data["Suggested Outline"] &&
              data["Suggested Outline"].Sections &&
              data["Suggested Outline"].Sections.length > 0 &&
              data["Suggested Outline"].Sections.map((section, index) => (
                <div key={index} className="mb-6">
                  <h2 className="text-lg text-primary font-medium mb-2">
                    H2 Title: {section["h2"] ? section["h2"] : ""} (
                    {section.paragraphs
                      ? `${section.paragraphs} paragraphs`
                      : ""}
                    )
                  </h2>
                  <ul className="list-decimal pl-4">
                    {section.Content &&
                      section.Content.length > 0 &&
                      section.Content.map((paragraph, pIndex) => (
                        <li
                          key={pIndex}
                          className="mb-2 list-item list-decimal text-base"
                        >
                          {typeof paragraph === "object"
                            ? convertObjectToJSONstring(paragraph)
                            : paragraph
                            ? paragraph
                            : ""}
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
          </div>

          <hr />

          <h2 className="text-2xl font-semibold text-primary text-center mt-6 mb-4">
            Highlighted Referenced Links
          </h2>
          <ul className="list-decimal pl-4">
            {data["Highlighted Referenced Links"] &&
              data["Highlighted Referenced Links"].length > 0 &&
              data["Highlighted Referenced Links"].map((link, index) => (
                <li className=" list-decimal" key={index}>
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    className="text-blue-600 underline mb-1"
                  >
                    {typeof link === "object"
                      ? convertObjectToJSONstring(link)
                      : link
                      ? link
                      : ""}
                  </a>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
    // </div>
  );
};

export default ExampleOutline;
