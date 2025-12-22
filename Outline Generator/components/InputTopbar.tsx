"use client"
import React from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

const InputTopbar = () => {

  const searchParams = useSearchParams();
  const work = searchParams.get("work");

  return (
    <div className="flex flex-col sm:flex-row w-full items-center justify-between p-4 sm:p-8 bg-black">
      <Image
        src="/outline-gen/icons/infrasity_logo.png"
        alt="logo"
        height={200}
        width={200}
      />
      <div className="font-bold text-sm mt-4 sm:mt-0 sm:ml-4 w-64 sm:w-96">
        <div className="flex items-center gap-4">
          {/* <p>{work ? 'STEP 2 OF 2' : 'STEP 1 OF 2'}</p> */}
          <div className={`h-8 w-64 ${work ? 'bg-primary' : 'bg-gray-300'} rounded-lg relative overflow-hidden`}>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center">
              <div className="relative flex items-center">
                <p className="absolute text-white text-xs z-10 left-11 font-inter font-normal">STEP 1</p>
                <Image
                  src="/outline-gen/icons/onboarding-icons/step-2-onboarding-icon.svg"
                  alt="Rounded SVG"
                  width={20}
                  height={32}
                  className="w-full h-auto"
                />
              </div>
            </div>
            <div className="absolute right-11 top-1/2 -translate-y-1/2 font-inter font-normal">
              <p className={`${work ? 'text-white' : 'text-gray-400'} text-xs`}>STEP 2</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputTopbar;
