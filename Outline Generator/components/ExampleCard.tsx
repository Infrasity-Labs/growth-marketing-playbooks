import Image from "next/image";

interface ExampleCardProps {
  Logo: string;
  topic: string;
  client: string;
  info: string;
  difficulty: string;
  handleCardClick: (data: {
    topic: string;
    client: string;
    info: string;
    difficulty: string;
    outline: string;
  }) => void;
  outline: string;
  color?: string;
}

const ExampleCard: React.FC<ExampleCardProps> = ({
  Logo,
  topic,
  client,
  info,
  difficulty,
  handleCardClick,
  outline,
  color,
}) => {
  return (
    <div
      className="border-2 border-text-primary rounded-2xl h-[13rem] flex flex-col justify-between w-full sm:w-[21rem] md:w-[17rem] lg:w-[21rem]"
    >
      <div className="w-full  px-3">
        <div
          className={`rounded-full h-2 mt-4 self-center`}
          style={{ backgroundColor: color }}
        ></div>
        <p className="font-semibold mt-3 text-2xl text-text-primary mx-2">
          {topic}
        </p>
      </div>
      <div className="border-t border-text-primary flex items-center px-2 justify-between">
        <div className="text-[1.5rem] text-primary flex items-center">
          <Image
            src={Logo}
            alt=""
            height={24}
            width={24}
          />
          <p className="text-text-primary text-base p-2">{client}</p>
        </div>
        <div className="text-[2rem] text-primary flex items-center"
          onClick={() => {
            handleCardClick({ topic, client, info, difficulty, outline });
          }}
        >
          <Image
            src="/outline-gen/icons/view_outline_icon.svg"
            alt=""
            height={18}
            width={18}
          />
          <p className="text-text-primary text-base p-2 underline hover:text-primary-dark cursor-pointer  transition-all duration-200 ease-in-out">
            View Outline
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExampleCard;
