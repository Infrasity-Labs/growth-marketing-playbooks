import Image from "next/image";

const StaticContent = () => {
  return (
    <div className="bg-background-gradient h-screen bg-primary relative shadow-xl flex-col text-white items-start justify-between text-left gap-2 pt-10 pb-11 hidden md:flex ps-10">
      <Image
        className=""
        src="/outline-gen/icons/infrasity_logo_signup.svg"
        alt=""
        width={250}
        height={250}
        priority
        // style={{ filter: 'invert(33%) sepia(58%) saturate(9982%) hue-rotate(240deg) brightness(94%) contrast(101%)' }}
      />
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl w-[95%] font-medium font-inter">
        Generate technical <br /> content at <br /> <span className=" inline-block underline decoration-yellow-400 decoration-[0.25rem]">speed</span>
      </h1>
      {/* <Image
        src="/icons/Content-amico.svg"
        alt=""
        width={400}
        height={400}
      /> */}
      <p className="text-sm lg:text-xl w-[75%] text-slate-200 pt-5 font-semibold font-inter">
        Simplify your planning with <span className="font-bold text-yellow-400">Infrasity</span>, giving you more time to create
        <span className="font-bold text-yellow-400"> quality</span> content.
      </p>
    </div>
  );
};

export default StaticContent;
