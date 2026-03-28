import React from "react";

interface ENgaoLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const ENgaoLogo: React.FC<ENgaoLogoProps> = ({
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: {
      text: "text-xl font-black",
    },
    md: {
      text: "text-2xl md:text-3xl font-black",
    },
    lg: {
      text: "text-3xl font-black",
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className={`flex items-baseline ${className}`}>
      <span className={`${classes.text} tracking-tight text-emerald-700`}>
        SOKOCHAPP
      </span>
    </div>
  );
};

export default ENgaoLogo;
