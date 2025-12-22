import { useState, useRef, useEffect } from "react";
import { OutlineType } from "@/domain/outline";
import IconHistory from "@/public/icons/history-icon";
import ExampleModal from "./ExampleModal";
import Image from "next/image";
import FeedbackForm from "./feedbackForm";

interface PreviousOutline {
  topic: string;
  outline: OutlineType;
  additionalInfo: string;
  client: string;
  date: string;
  difficulty: string;
}

interface HistoryProps {
  previousOutlines: PreviousOutline[];
}

const History: React.FC<HistoryProps> = ({ previousOutlines }) => {
  const [showPreviousOutlines, setShowPreviousOutlines] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    topic: "",
    client: "",
    info: "",
    difficulty: "",
  });
  const [selectedOutline, setSelectedOutline] = useState<OutlineType>();

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log(previousOutlines);
  }, [previousOutlines]);

  useEffect(() => {
    if (contentRef.current) {
      if (showPreviousOutlines) {
        contentRef.current.style.maxHeight = `22rem`;
        const contentHeight = contentRef.current.scrollHeight;
        const maxHeight = 22 * 16;
        if (contentHeight > maxHeight) {
          contentRef.current.style.overflowY = "auto";
        }
      } else {
        contentRef.current.style.maxHeight = `0rem`;
        const contentHeight = contentRef.current.scrollHeight;
        const maxHeight = 22 * 16;
        if (contentHeight > maxHeight) {
          contentRef.current.style.overflowY = "auto";
          // contentRef.current.style.marginBottom = "12px";
        } else {
          contentRef.current.style.overflowY = "hidden";
        }
      }
    }
  }, [showPreviousOutlines]);

  const handleCardClick = (content: {
    topic: string;
    client: string;
    info: string;
    difficulty: string;
    outline: number;
  }) => {
    setSelectedOutline(previousOutlines[content.outline].outline);
    setModalContent(content);
    setModalOpen(true);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div
        className="font-semibold flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all duration-150 ease-in-out relative bg-white"
        onClick={() => setShowPreviousOutlines(!showPreviousOutlines)}
      >
        <IconHistory className="text-lg" />
        <p className="">History</p>
        <div className="absolute -translate-y-1/2 top-[50%] right-2 text-primary">
          {showPreviousOutlines ? (
            <Image
              src="/outline-gen/icons/down_arrow.svg"
              alt=""
              height={12}
              width={12}
              className="rotate-180"
            />
          ) : (
            <Image
              src="/outline-gen/icons/down_arrow.svg"
              alt=""
              height={12}
              width={12}
            />
          )}
        </div>
      </div>
      <div
        ref={contentRef}
        className={`transition-max-height duration-500 ease-in-out overflow-hidden  custom-scrollbar ml-3 mr-2 space-y-3 pr-2 ${showPreviousOutlines && 'mb-3 '}`}
        style={{ maxHeight: showPreviousOutlines ? "22rem" : "0rem" }}
      >
        {/* <CustomScrollbar style={{ height: '22rem' }}> */}
         {previousOutlines?.map((outline: PreviousOutline, index) => (
          <div
            key={index}
            className="border-2 border-primary text-sm overflow-hidden whitespace-nowrap p-2 rounded-md hover:bg-secondary-light cursor-pointer shadow-sm flex items-center justify-between"
            onClick={() => {
              handleCardClick({
                topic: outline.topic,
                client: outline.client,
                info: outline.additionalInfo,
                difficulty: outline.difficulty,
                outline: index,
              });
            }}
          >
            <p className="truncate font-semibold">{outline.topic}</p>
            <Image
              src="/outline-gen/icons/ep_arrow-right-bold.svg"
              alt=""
              height={12}
              width={12}
            />
          </div>
        ))}
        {/* </CustomScrollbar> */}
      </div>
      {modalOpen && selectedOutline && (
        <ExampleModal
          onClose={() => setModalOpen(false)}
          topic={modalContent.topic}
          client={modalContent.client}
          info={modalContent.info}
          difficulty={modalContent.difficulty}
          outline={selectedOutline}
        />
      )}
    </div>
  );
};

export default History;
