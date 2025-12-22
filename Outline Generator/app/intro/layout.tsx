import InputTopbar from "@/components/InputTopbar";
import Image from "next/image";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex flex-col bg-black items-center">
      <InputTopbar />
      <Image
        src="/outline-gen/icons/onboarding-icons/square-element-onboarding-page.svg"
        alt=""
        width={40}
        height={40}
        className="hidden 2xl:block absolute top-[120px] right-[260px]"
      />
      <Image
        src="/outline-gen/icons/onboarding-icons/triangle-element-onboarding-page.svg"
        alt=""
        width={40}
        height={40}
        className="hidden 2xl:block absolute bottom-[70px] right-[770px]"
      />
      <Image
        src="/outline-gen/icons/onboarding-icons/triangle-element-onboarding-page.svg"
        alt=""
        width={40}
        height={40}
        className="hidden 2xl:block absolute top-[190px] left-[200px]"
      />
      <Image
        src="/outline-gen/icons/onboarding-icons/circle-element-onboarding-page.svg"
        alt=""
        width={40}
        height={40}
        className="hidden 2xl:block absolute bottom-[20px] right-[200px]"
      />
      <Image
        src="/outline-gen/icons/onboarding-icons/top-right-decorative-onboarding-screen.svg"
        alt="Top Right Decorative"
        width={100}
        height={100}
        className="hidden xl:block absolute top-0 right-0 mt-20"
      />
      <Image
        src="/outline-gen/icons/onboarding-icons/bottom-left-decorative-onboarding-screen.svg"
        alt="Bottom Left Decorative"
        width={100}
        height={100}
        className="hidden xl:block absolute bottom-0 left-0 mb-10"
      />
      {children}
    </div>
  );
}
