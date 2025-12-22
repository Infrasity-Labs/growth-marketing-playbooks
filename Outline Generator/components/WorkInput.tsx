import { useEffect } from "react";
import InputCard from "./InputCard";

interface input {
  title: string;
  icon: string;
}

interface WorkInputProps {
  primeQuestion: string;
  secondaryQuestion: string;
  inputs: input[] | [];
  onSelect: (selected: string | string[]) => void;
  multiSelect?: boolean;
  selected?: string | string[];
  isWork: boolean;
}

const WorkInput: React.FC<WorkInputProps> = ({
  primeQuestion,
  secondaryQuestion,
  inputs,
  onSelect,
  selected,
  multiSelect = false,
  isWork,
}) => {
  const handleSelect = (title: string) => {
    if (multiSelect) {
      if (Array.isArray(selected)) {
        const selectedIndex = selected.indexOf(title);
        const newSelected =
          selectedIndex === -1
            ? [...selected, title]
            : selected.filter((t) => t !== title);
        onSelect(newSelected);
      } else {
        onSelect([title]);
      }
    } else {
      onSelect(title);
    }
  };

  const isSelected = (title: string) => {
    if (Array.isArray(selected)) {
      return selected.includes(title);
    }
    return title === selected;
  };

  return (
    <div className="bg-black flex flex-col gap-6 md:gap-12 px-4 z-50">
      <div>
        <h1 className="px-4 sm:px-4 md:px-1 lg:px-1 font-semibold text-2xl text-white sm:text-3xl md:text-3xl lg:text-4xl">{primeQuestion}</h1>
        <p className="px-4 sm:px-4 md:px-1 lg:px-1 font-regular text-white lg:text-md text-sm">{secondaryQuestion}</p>
      </div>
      <div className="bg-black rounded-2xl shadow-xl p-4 md:p-6 flex flex-col gap-4 md:gap-6 ">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
          {inputs.map((input, index) => (
            <InputCard
              key={index}
              title={input.title}   
              Icon={input.icon}
              onChoose={() => handleSelect(input.title)}
              selected={isSelected(input.title)}
            />
          ))}
          </div>
        {isWork
          ? (selected === "Other" ||
              !inputs.some((input) => input.title === selected)) &&
            selected?.length !== 0 && (
              <input
                onChange={(e) => onSelect(e.target.value)}
                required
                type="text"
                className="border border-primary w-full p-2 rounded-lg outline-none"
                placeholder={`${
                  multiSelect
                    ? "Tell us about your interests"
                    : "What is your day-to-day role at work?"
                }`}
              />
            )
          : inputs.length === 0 && (
              <input
                onChange={(e) => onSelect(e.target.value)}
                required
                type="text"
                className="border border-primary w-full p-2 rounded-lg outline-none"
                placeholder={`${
                  multiSelect
                    ? "Tell us about your interests"
                    : "What is your day-to-day role at work?"
                }`}
              />
            )}
      </div>
    </div>
  );
};

export default WorkInput;
