import { OutlineType } from "@/domain/outline";
import ExportPDFButton from "./ExportPDFbtn";
import ExportDOCXbtn from "./ExportDOCXbtn";
import BottomBar from "./BottomBar";
import TopBarTwo from "./TopBarTwo";
import BackgroundSVG from "./BackgroundSVG";
import { useState } from "react";

interface Props {
  data: OutlineType;
  onClose: () => void;
  onBack?: () => void;
  inputTitle?: string;
}

const Outline: React.FC<Props> = ({ data, onClose, onBack, inputTitle }) => {
  const [pdfMode, setPdfMode] = useState<'light' | 'dark'>('dark');
  const convertObjectToJSONstring = (obj: Object) => {
    return JSON.stringify(obj);
  };

  return (
    <div className="absolute inset-0 h-full py-4 bg-black bg-opacity-50 overflow-y-auto flex justify-center items-center z-50">
      <div className=" absolute h-full flex flex-col gap-2 items-center justify-center w-full bg-black shadow-2xl top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
       <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full max-w-none">
          <BackgroundSVG />
        </div>
      </div>
        <TopBarTwo isStepTwo={true} />
        <div className="w-full overflow-auto flex items-center justify-center ">
          <div className="h-[90%] w-[90%] lg:w-[70%] xl:w-[60%] space-y-4">
            <h1 className="text-3xl font-semibold mb-0 text-center self-center">
              {inputTitle}
            </h1>
            <p className="text-center mb-2 text-[16px] font-medium">
              Fine-tune this content to generate the most accurate post.
            </p>
            {/* PDF Section Mode Toggle */}
            <div className="flex justify-end mb-2 inset-10 z-10">
              <button
                className={`px-4 inset-10 z-10 py-1 rounded-full border text-sm font-semibold transition-colors duration-300 mr-2 bg-black text-white border-white/30 border-gray-400`}
                onClick={() => setPdfMode('dark')}
                aria-pressed={pdfMode === 'dark'}
              >
                Dark PDF
              </button>
              <button
                className={`px-4 inset-10 z-10 py-1 rounded-full border text-sm font-semibold transition-colors duration-300 bg-gray-100 text-gray-700 border-gray-400`}
                onClick={() => setPdfMode('light')}
                aria-pressed={pdfMode === 'light'}
              >
                Light PDF
              </button>
            </div>
            {/* PDF Section */}
            <div className={
              pdfMode === 'light'
                ? 'p-4 bg-side-blue rounded-xl backdrop-blur-sm border border-white/15 hover:border-[#3c4199ee] transition-colors duration-500 ease-in-out'
                : 'p-4  bg-black/20 backdrop-blur-sm border border-white/15 hover:border-[#3c4199ee] transition-colors duration-500 ease-in-out rounded-2xl'
            }>
              <h1 className={
                pdfMode === 'light'
                  ? 'text-2xl text-primary font-medium pt-6 pb-8 px-12 text-center self-center'
                  : 'text-2xl text-[#c6c1eb] font-medium pt-6 pb-8 px-12 text-center self-center'
              }>
                {typeof data.Title === "object"
                  ? convertObjectToJSONstring(data.Title)
                  : data.Title
                    ? data.Title
                    : ""}
              </h1>
              <div className={
                pdfMode === 'light'
                  ? 'border border-primary bg-white w-full rounded-xl p-4 overflow-auto'
                  : 'backdrop-blur-sm border border-white/20 transition-colors duration-500 ease-in-out rounded-2xl w-full p-4 overflow-auto'
              }>
                <table className={
                  pdfMode === 'light'
                    ? 'md:w-9/10 divide-y divide-gray-500 border border-gray-500'
                    : 'md:w-9/10 divide-y divide-white/20 border border-white/20'
                }>
                  <tbody className={pdfMode === 'light' ? 'divide-y divide-gray-500' : 'divide-y divide-white/20'}>
                    <tr>
                      <td className={pdfMode === 'light' ? 'px-6 py-4  text-sm font-semibold text-primary border-r border-gray-500 text-nowrap' : 'px-6 py-4  text-sm font-semibold text-[#c6c1eb] border-r border-white/20 text-nowrap'}>
                        1. Brief
                      </td>
                      <td
                        className={pdfMode === 'light' ? 'px-6 py-4 text-sm text-text-primary' : 'px-6 py-4 text-sm text-gray-400'}
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
                      <td className={pdfMode === 'light' ? 'px-6 py-4  text-sm font-semibold text-primary border-r border-gray-500 text-nowrap' : 'px-6 py-4  text-sm font-semibold text-[#c6c1eb] border-r border-white/20 text-nowrap'}>
                        2. URL
                      </td>
                      <td
                        className={pdfMode === 'light' ? 'px-6 py-4 text-sm text-text-primary' : 'px-6 py-4 text-sm text-gray-400'}
                        colSpan={2}
                      >
                        <a
                          href={data.URL}
                          target="_blank"
                          className={pdfMode === 'light' ? 'text-indigo-600 hover:text-indigo-900' : 'text-indigo-400 hover:text-indigo-900'}
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
                      <td className={pdfMode === 'light' ? 'px-6 py-4  text-sm font-semibold text-primary border-r border-gray-500 text-nowrap' : 'px-6 py-4  text-sm font-semibold text-[#c6c1eb] border-r border-white/20 text-nowrap'}>
                        3. Word Count
                      </td>
                      <td
                        className={pdfMode === 'light' ? 'px-6 py-4 text-sm text-text-primary' : 'px-6 py-4 text-sm text-gray-400'}
                        colSpan={2}
                      >
                        {typeof data["Word Count"] === "object"
                          ? convertObjectToJSONstring(data["Word Count"])
                          : data["Word Count"]
                            ? data["Word Count"]
                            : ""}
                      </td>
                    </tr>
                    <tr>
                      <td className={pdfMode === 'light' ? 'px-6 py-4  text-sm font-semibold text-primary border-r border-gray-500 text-nowrap' : 'px-6 py-4  text-sm font-semibold text-[#c6c1eb] border-r border-white/20 text-nowrap'}>
                        4. Target Intent
                      </td>
                      <td
                        className={pdfMode === 'light' ? 'px-6 py-4 text-sm text-text-primary' : 'px-6 py-4 text-sm text-gray-400'}
                        colSpan={2}
                      >
                        {typeof data["Target Intent"] === "object"
                          ? convertObjectToJSONstring(data["Target Intent"])
                          : data["Target Intent"]
                            ? data["Target Intent"]
                            : ""}
                      </td>
                    </tr>
                    <tr>
                      <td className={pdfMode === 'light' ? 'px-6 py-4  text-sm font-semibold text-primary border-r border-gray-500 text-nowrap' : 'px-6 py-4  text-sm font-semibold text-[#c6c1eb] border-r border-white/20 text-nowrap'}>
                        5. Target Audience
                      </td>
                      <td
                        className={pdfMode === 'light' ? 'px-6 py-4 text-sm text-text-primary' : 'px-6 py-4 text-sm text-gray-400'}
                        colSpan={2}
                      >
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
                      <td className={pdfMode === 'light' ? 'px-6 py-4  text-sm font-semibold text-primary border-r border-gray-500 text-nowrap' : 'px-6 py-4  text-sm font-semibold text-[#c6c1eb] border-r border-white/20 text-nowrap'}>
                        6. Page Template
                      </td>
                      <td className={pdfMode === 'light' ? 'px-6 py-4 text-sm text-text-primary' : 'px-6 py-4 text-sm text-gray-400'}>
                        {typeof data["Page Template"] === "object"
                          ? convertObjectToJSONstring(data["Page Template"])
                          : data["Page Template"]
                            ? data["Page Template"]
                            : ""}
                      </td>
                    </tr>
                    <tr>
                      <td className={pdfMode === 'light' ? 'px-6 py-4  text-sm font-semibold text-primary border-r border-gray-500 text-nowrap' : 'px-6 py-4  text-sm font-semibold text-[#c6c1eb] border-r border-white/20 text-nowrap'}>
                        8. Focus Keyword
                      </td>
                      <td className={pdfMode === 'light' ? 'px-6 py-4 text-sm text-text-primary border-r border-gray-500' : 'px-6 py-4 text-sm text-gray-400 border-r border-white/20'}>
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
                      <td className={pdfMode === 'light' ? 'text-sm text-text-primary' : 'text-sm text-gray-400'}>
                        <div className={pdfMode === 'light' ? 'text-xs p-1 font-semibold text-center text-primary border-b border-gray-500' : 'text-xs p-1 font-semibold text-center text-[#c6c1eb] border-b border-white/20'}>
                          Global search <br /> volume(Keywords)
                        </div>
                        <ul className="list-none">
                          {data["Keywords’ global search volume"] &&
                            data["Keywords’ global search volume"]["Focus keyword"] &&
                            Object.entries(
                              data["Keywords’ global search volume"]["Focus keyword"]
                            ).map(([keyword, volume]) => (
                              <li className=" text-center p-2" key={keyword}>
                                {typeof volume === "object"
                                  ? convertObjectToJSONstring(volume)
                                  : volume}
                              </li>
                            ))}
                        </ul>
                      </td>
                    </tr>
                    <tr>
                      <td className={pdfMode === 'light' ? 'px-6 py-4  text-sm font-semibold text-primary border-r border-gray-500 text-nowrap' : 'px-6 py-4  text-sm font-semibold text-[#c6c1eb] border-r border-white/20 text-nowrap'}>
                        9. Longtail KWs
                      </td>
                      <td className={pdfMode === 'light' ? 'px-6 py-4 text-sm text-text-primary border-r border-gray-500' : 'px-6 py-4 text-sm text-gray-400 border-r border-white/20'}>
                        <ul className="list-disc pl-4">
                          {data["Keywords’ global search volume"] &&
                            data["Keywords’ global search volume"]["Longtail KWs"] &&
                            Object.entries(
                              data["Keywords’ global search volume"]["Longtail KWs"]
                            ).map(([keyword]) => (
                              <li className="" key={keyword}>
                                {typeof keyword === "object"
                                  ? convertObjectToJSONstring(keyword)
                                  : keyword}
                              </li>
                            ))}
                        </ul>
                      </td>
                      <td className={pdfMode === 'light' ? 'text-center p-2 text-sm text-text-primary border-r border-gray-500' : 'text-center p-2 text-sm text-gray-400 border-r border-white/20'}>
                        <ul className="list-none">
                          {data["Keywords’ global search volume"] &&
                            data["Keywords’ global search volume"]["Longtail KWs"] &&
                            Object.entries(
                              data["Keywords’ global search volume"]["Longtail KWs"]
                            ).map(([keyword, volume]) => (
                              <li className="" key={keyword}>
                                {typeof volume === "object"
                                  ? convertObjectToJSONstring(volume)
                                  : volume}
                              </li>
                            ))}
                        </ul>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <h2 className={pdfMode === 'light' ? 'text-2xl font-semibold text-primary mt-6 mb-4 text-center' : 'text-2xl font-semibold text-[#c6c1eb] mt-6 mb-4 text-center'}>
                  Commonly Asked Questions
                </h2>
                <div className="flex flex-col items-start pb-8 ">
                  <div>
                    <ul className=" list-decimal pl-4">
                      {data["Commonly Asked Questions"] &&
                        data["Commonly Asked Questions"].map(
                          (question, index) => (
                            <li key={index} className={pdfMode === 'light' ? 'text-black' : 'text-gray-400'}>
                              {typeof question === "object"
                                ? convertObjectToJSONstring(question)
                                : question}
                            </li>
                          )
                        )}
                    </ul>
                  </div>
                </div>

                <hr />

                <div>
                  <h2 className={pdfMode === 'light' ? 'text-2xl font-semibold mt-6 mb-2 text-center text-primary' : 'text-2xl font-semibold mt-6 mb-2 text-center text-[#c6c1eb]'}>
                    Suggested Outline
                  </h2>
                  <div className={pdfMode === 'light' ? 'text-xl font-bold my-6 text-primary flex justify-center items-center' : 'text-xl font-bold my-6 text-[#c6c1eb]  flex justify-center items-center'}>
                    H1 Title:{" "}
                    {data["Suggested Outline"] &&
                      data["Suggested Outline"]["h1"] &&
                      data["Suggested Outline"]["h1"]}
                  </div>
                  {data["Suggested Outline"] &&
                    data["Suggested Outline"].Sections &&
                    data["Suggested Outline"].Sections.length > 0 &&
                    data["Suggested Outline"].Sections.map((section, index) => (
                      <div key={index} className="mb-6">
                        <h2 className={pdfMode === 'light' ? 'text-lg text-primary font-medium mb-2' : 'text-lg text-[#c6c1eb] font-medium mb-2'}>
                          H2 Title: {section["h2"] ? section["h2"] : ""} (
                          {section.paragraphs
                            ? `${section.paragraphs} paragraphs`
                            : ""}
                          )
                        </h2>
                        <ul className=" list-decimal pl-4">
                          {section.Content &&
                            section.Content.length > 0 &&
                            section.Content.map((paragraph, pIndex) => (
                              <li
                                key={pIndex}
                                className={pdfMode === 'light' ? 'mb-2 list-item text-base text-black' : 'mb-2 list-item text-base text-gray-400'}
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

                <h2 className={pdfMode === 'light' ? 'text-2xl font-semibold text-primary text-center mt-6 mb-4' : 'text-2xl font-semibold text-[#c6c1eb] text-center mt-6 mb-4'}>
                  Highlighted Referenced Links
                </h2>
                <ul className=" list-decimal pl-4">
                  {data["Highlighted Referenced Links"] &&
                    data["Highlighted Referenced Links"].length > 0 &&
                    data["Highlighted Referenced Links"].map((link, index) => (
                      <li className={pdfMode === 'light' ? 'list-decimal' : 'text-gray-400 list-decimal'} key={index}>
                        <a
                          key={index}
                          href={link}
                          target="_blank"
                          className={pdfMode === 'light' ? 'text-blue-600 underline mb-1' : 'text-blue-600 underline mb-1'}
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
        </div>
        <BottomBar
          isStepOne={false}
          cancel={onClose}
          data={data}
          onBack={onBack}
        />
      </div>
    </div>
  );
};

export default Outline;
