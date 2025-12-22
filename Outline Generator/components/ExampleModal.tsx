import ExampleOutline from "./ExampleOutline";
import { OutlineType } from "@/domain/outline";
import ExportPDFButton from "./ExportPDFbtn";
import ExportDOCXbtn from "./ExportDOCXbtn";
import BottomBar from "./BottomBar";
import TopBarTwo from "./TopBarTwo";
import { ReactTags, Tag, TagSelected } from "react-tag-autocomplete";

interface ExampleModalProps {
  topic: string;
  info: string;
  client: string;
  difficulty: string;
  onClose: () => void;
  outline: OutlineType;
}

const ExampleModal: React.FC<ExampleModalProps> = ({
  topic,
  info,
  client,
  difficulty,
  onClose,
  outline,
}) => {

  // console.log(outline);

  return (
    <div className="absolute inset-0 h-full py-4 bg-gray-500 bg-opacity-50 overflow-y-auto flex justify-center items-center z-50">
      <div className="  absolute h-full gap-2 overflow-hidden justify-center flex flex-col items-center document w-full border bg-white shadow-2xl top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
        <TopBarTwo isStepTwo={true} />
        <div className="w-full overflow-auto flex items-center justify-center">
          <div className="h-[90%] w-[90%] lg:w-[60%] xl:w-[50%] space-y-12">
            <div className="flex flex-col items-center justify-center gap-2 pb-10 w-full border-[3px] border-primary py-5 px-6 md:px-24 rounded-2xl">
              <h1 className="font-medium text-3xl text-center">
                AI Outline Generator
              </h1>
              <div className="flex items-center w-full gap-2">
                <div className="flex flex-col w-full relative rounded-xl space-y-2">
                  <label htmlFor="" className=" self-start ml-0 font-semibold">
                    Topic
                  </label>
                  <div
                    className={`${!topic ? 'h-[44px]' : ''} outline-gen-input`}
                  >
                    {topic}
                  </div>
                </div>
              </div>
              <div className="flex flex-col w-full relative rounded-xl space-y-2">
                <label
                  htmlFor="topic"
                  className=" self-start ml-0 font-semibold"
                >
                  Additional Information
                </label>
                <div
                  className={`${!info ? 'h-[44px]' : ''} outline-gen-input`}
                >{info}</div>
              </div>
              <div className="flex flex-col w-full relative rounded-xl space-y-2">
                <label
                  htmlFor="topic"
                  className=" self-start ml-0 font-semibold"
                >
                  Target Audience
                </label>
                <div className={`${!outline["Target Audience"] ? 'h-[44px]' : ''} outline-gen-input flex overflow-auto gap-2 hover:bg-none flex-wrap`}>
                {outline["Target Audience"].map((audience, ind) => (
                    <p className=" react-tags__tag_custom" key={ind}>{audience}</p>
                  ))}
                </div>
              </div>
              <div className="flex items-center w-full gap-4">
                <div className="flex flex-col flex-1 relative h-fullrounded-xl space-y-2">
                  <label htmlFor="" className="self-start ml-0 font-semibold">
                    Client Name
                  </label>
                  <div
                    className={`outline-gen-input ${!client ? 'h-[44px]' : 'h-full'} `}
                  >{client}</div>
                </div>
                <div className="flex-1 flex flex-col relative rounded-xl space-y-2">
                  <label
                    htmlFor="difficulty"
                    className=" self-start ml-0 font-semibold"
                  >
                    Difficulty
                  </label>
                  <div
                    className={`${!difficulty ? 'h-[44px]' : ''} px-2 border-2 rounded-xl border-text-primary outline-none w-full p-[0.54rem]`}
                  >
                    {difficulty}
                  </div>
                </div>
              </div>
            </div>

            <h1 className=" text-3xl text-center font-semibold">Generated Outline</h1>

            <ExampleOutline data={outline} />
          </div>
        </div>
        <BottomBar isStepOne={false} cancel={onClose} data={outline} isExample={true} />
      </div>
    </div>
  );
};

export default ExampleModal;
