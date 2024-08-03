import React from "react";
import { LampDemo } from "./_pages/notFoundUI";

const NotFound: React.FC = () => {
  const NOT_FOUND_MESSAGE = "404 - Page Not Found"
  return <LampDemo title={NOT_FOUND_MESSAGE} />;
};

export default NotFound;
