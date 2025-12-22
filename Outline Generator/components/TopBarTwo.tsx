import Image from "next/image";
import React from "react";

interface TopBarProps {
  isStepTwo?: boolean;
}

const TopBarTwo: React.FC<TopBarProps> = ({ isStepTwo }) => {
  return (
    <div className="font-inter bg-black w-full flex flex-col items-center justify-center p-2 mt-10 md:pb-12 md:pr-12 md:pl-12 gap-6">
      <div className="w-[80%] md:w-[55%] flex items-center justify-center">
        <div className="bg-gray-400 h-1 w-[50%] relative">
          <div className="h-6 w-6 md:h-10 md:w-10 rounded-full bg-primary absolute -left-1 top-1/2 -translate-y-1/2 text-center text-[0.8rem] flex items-center justify-center">
            <Image
              src="/outline-gen/icons/tick-mark.svg"
              alt=""
              height={12}
              width={12}
              className="text-red-500"
            />
          </div>
          <span className="font-inter absolute text-[16px] font-semibold text-gray-400 left-0 -translate-x-[32%] top-[600%]">
            Select Title
          </span>
        </div>
        <div className="bg-primary h-1 w-[50%] relative">
          <div className="h-6 w-6 md:h-10 md:w-10 rounded-full bg-primary absolute -left-1 top-1/2 -translate-y-1/2 text-center text-[0.8rem]  flex items-center justify-center">
            <Image
              src="/outline-gen/icons/tick-mark.svg"
              alt=""
              height={12}
              width={12}
              className="text-red-500"
            />
          </div>
          <div className={`h-6 w-6 md:h-10 md:w-10 rounded-full border-2 border-primary ${!isStepTwo ? 'bg-white' : 'bg-primary'} absolute -right-1 top-1/2 -translate-y-1/2 text-center text-[0.8rem] z-10 flex items-center justify-center`}>
            {!isStepTwo ?
              <span className="bg-primary rounded-full h-2 w-2"></span>
              :
              <Image
                src="/outline-gen/icons/tick-mark.svg"
                alt=""
                height={12}
                width={12}
                className="text-red-500"
              />
            }
          </div>
          <div className="absolute bg-primary w-[50%] h-1 right-0 top-0"></div>
          <span className=" absolute text-[16px] font-semibold text-white left-0 -translate-x-[38%] top-[600%]">
            Select Headings
          </span>
          <span className="absolute text-[16px] font-semibold text-white right-0 translate-x-[30%] top-[600%]">
            Final Outline
          </span>
        </div>
      </div>
      <div className="md:absolute right-10 mt-6 md:mt-0 text-[16px] font-semibold">Step {isStepTwo ? '3' : '2'} of 3</div>
    </div>
  );
};

export default TopBarTwo;
