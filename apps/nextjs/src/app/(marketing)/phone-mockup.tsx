import Image from "next/image";

// Native size of the Google Pixel 2 XL skin from devices.css — everything scales from this.
// Chosen over the library's iPhone skins specifically because its screen slot (360x720,
// aspect ratio 2.0) is the closest match to our real device screenshots (1080x2087, ~1.93) —
// an iPhone-shaped skin needs a ~19% aspect correction, this one only needs ~3.5%, so
// object-fit:cover (set on .device-screen in devices.min.css) crops just a sliver off the
// sides instead of a visible chunk of the screenshot.
const DEVICE_WIDTH = 404;
const DEVICE_HEIGHT = 832;

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

export function PhoneMockup({
  src,
  alt,
  width,
  priority,
  sizes,
}: PhoneMockupProps) {
  const scale = width / DEVICE_WIDTH;
  const height = DEVICE_HEIGHT * scale;

  return (
    <div style={{ width, height }} className="relative">
      <div
        className="device device-google-pixel-2-xl absolute top-0 left-0"
        style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
      >
        <div className="device-frame">
          <Image
            src={src}
            alt={alt}
            width={SHOT_WIDTH}
            height={SHOT_HEIGHT}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : undefined}
            sizes={sizes ?? `${width}px`}
            className="device-screen"
          />
        </div>
        <div className="device-header" />
        <div className="device-sensors" />
        <div className="device-btns" />
        <div className="device-power" />
      </div>
    </div>
  );
}
