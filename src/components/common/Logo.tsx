import Image from "next/image";

const Logo = () => {
  return (
    <div className="h-8 md:h-12 w-auto shrink-0">
      <Image
        src="/assets/tealeaf.webp"
        alt="SOKOCHAPP Logo"
        width={150}
        height={100}
        className="h-full w-auto object-contain"
        priority
        quality={100}
      />
    </div>
  );
};

export default Logo;
