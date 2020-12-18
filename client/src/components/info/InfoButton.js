import React from 'react';

import { ReactComponent as InfoIcon } from '../icons/info.svg';

const InfoButton = ({maximize}) => {
  return (
    <button
      className="fixed z-50 top-2 lg:top-4 left-2 lg:left-4 w-10 h-10 p-2 rounded-full bg-gray-900 hover-hover:hover:bg-blue-900 border-black border-1 border-opacity-50 shadow-md text-blue-500"
      onClick={maximize}
    >
      <InfoIcon />
    </button>
  );
};

export default InfoButton;
