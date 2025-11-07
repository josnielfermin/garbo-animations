import Button from "@/shared/components/ui/button";
import IconButton from "../../ui/icon-button";
import Link from "next/link";
import Image from "next/image";
import HeroAnimation3 from "./HeroAnimation3";

const HeroSection = () => {
  return (
    <div className=" flex overflow-hidden flex-col justify-end  h-screen snap-start  px-24 md:pb-40 relative w-full">
      <video
        src="/videos/garbo-video-hero.mp4"
        autoPlay
        loop
        muted
        playsInline
        controls={false}
        className="absolute inset-0 object-cover w-full h-full -z-10 opacity-10"
      />
      <div className="md:h-[calc(100%-7rem)] w-full max-md:flex-col max-md:justify-center flex relative  max-md:h-full">
        {/* <div className="absolute flex w-full h-full m-auto -z-10">
          <Image
            src="/images/garbo.svg"
            className=" m-auto "
            alt=""
            height={179}
            width={1263}
          />
        </div> */}

        <div className="flex flex-col md:h-full w-full max-md:items-center md:justify-end gap-8 relative z-20">
          <div className="flex flex-col text-base-900 text-7xl max-md:text-2xl max-xl:text-4xl">
            <h1 className="flex md:flex-col gap-2 md:gap-6 max-md:items-center max-lg:flex-col">
              <span className="whitespace-nowrap font-normal">
                Advanced Mobile
              </span>
              <span className="font-bold">Virtualization</span>
              <span className="whitespace-nowrap font-normal">
                for Cybersecurity
              </span>
            </h1>
          </div>

          <div className="flex">
            <Button
              variant="primary"
              className="w-72! max-md:max-w-54.25 max-md:text-sm max-w-none max-md:h-11! max-h-none min-h-0 md:h-15.25"
            >
              <span className="font-bold">SCHEDULE</span>
              DEMONSTRATION
            </Button>
          </div>
        </div>

        <div className="md:absolute flex items-center  justify-center w-full top-10  md:h-full z-0">
          {/* <Image
            src="/images/arm.png"
            alt=""
            className="h-175 w-175 max-md:w-87.5 max-md:min-w-87.5 max-md:h-87 max-xl:w-125 max-xl:h-125"
            height={775}
            width={775}
          /> */}
          <HeroAnimation3 />
        </div>

        <div className="flex md:flex-col   relative md:justify-between  md:h-full max-xl:w-full   xl:shrink-0 max-xl:bottom-0 max-xl:items-end max-xl:justify-center">
          <div className="flex flex-col items-end pt-10  w-full max-md:hidden">
            <IconButton icon="linkedin" />
            <IconButton icon="twitter" />
          </div>

          <div className="flex flex-col gap-6  max-w-sm">
            <div className="text-2xl font-bold md:font-medium text-base-800 max-xl:text-center max-md:text-xs">
              <p>ARM on ARM architecture </p>
              <p>Real Virtualizacion, not Emulation</p>
            </div>

            <div className="max-md:w-full max-md:flex max-md:justify-center">
              <Link
                href=""
                className="flex justify-between w-full text-2xl font-bold text-secondary-800 max-md:text-base max-md:font-normal max-md:max-w-[8.0625rem] items-center"
              >
                <span className="max-md:underline max-md:underline-offset-4">
                  LEARN MORE
                </span>
                <span className="icon-arrow-up-right max-md:text-xs"></span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full  absolute bottom-14 left-0 right-0 px-24 flex max-md:hidden">
        <div className="flex text-sm font-normal w-full">
          <span className="text-base-800">01/</span>
          <span className="text-secondary-800">06</span>
        </div>
        <div className=" flex justify-center w-full text-base-900 gap-2 animate-bounce">
          <span className="icon-right rotate-90 text-secondary-600" />
          KEEP SCROLLING
        </div>
        <div className="w-full"></div>
      </div>
    </div>
  );
};

export default HeroSection;
