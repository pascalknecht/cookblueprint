import Image from "next/image";

// Native size of the iphone-x skin from devices.css — everything scales from this.
const DEVICE_WIDTH = 375;
const DEVICE_HEIGHT = 812;

// Actual pixel size of our cropped app screenshots (see apps/nextjs/public/screenshots).
const SHOT_WIDTH = 1080;
const SHOT_HEIGHT = 2087;

type PhoneMockupProps = {
  src: string;
  alt: string;
  width: number;
  priority?: boolean;
  sizes?: string;
};

export function PhoneMockup({ src, alt, width, priority, sizes }: PhoneMockupProps) {
  const scale = width / DEVICE_WIDTH;
  const height = DEVICE_HEIGHT * scale;

  return (
    <div style={{ width, height }} className="relative">
      <div
        className="marvel-device iphone-x absolute top-0 left-0"
        style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
      >
        <div className="notch">
          <div className="camera" />
          <div className="speaker" />
        </div>
        <div className="top-bar" />
        <div className="sleep" />
        <div className="bottom-bar" />
        <div className="volume" />
        <div className="overflow">
          <div className="shadow shadow--tr" />
          <div className="shadow shadow--tl" />
          <div className="shadow shadow--br" />
          <div className="shadow shadow--bl" />
        </div>
        <div className="inner-shadow" />
        <div
          className="screen"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#FBF6EF" }}
        >
          <Image
            src={src}
            alt={alt}
            width={SHOT_WIDTH}
            height={SHOT_HEIGHT}
            priority={priority}
            sizes={sizes ?? `${width}px`}
            className="w-full h-auto"
          />
        </div>
      </div>
    </div>
  );
}
