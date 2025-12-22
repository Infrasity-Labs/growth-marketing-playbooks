
import Image from "next/image";
interface InputCardProps {
  title: string;
  Icon: string;
  onChoose?: () => void;
  selected?: boolean;
}

const InputCard: React.FC<InputCardProps> = ({ title, Icon, onChoose, selected }) => {
  return (
    <div
      className={`${selected ? 'bg-secondary-light' : ''} w-full sm:w-78 md:w-56 lg:w-56 h-28 sm:h-32 md:h-36 border-2 border-primary rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-150 ease-in-out ${!selected && 'hover:bg-secondary-lighter'} gap-2 sm:gap-4`}
      onClick={onChoose}
    >
      <div className="text-3xl text-primary">
        <Image src={Icon} alt="" height={35} width={35}/>
      </div>
      <p className=" text-md font-inter">{title}</p>
    </div>
  );
};

export default InputCard;
