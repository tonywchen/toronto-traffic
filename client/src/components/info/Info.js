import React, { useState } from 'react';

import InfoButton from './InfoButton';
import InfoPopup from './InfoPopup';

const Info = () => {
  const [isMinimized, setMinimized] = useState(true);

  const minimize = () => setMinimized(true);
  const maximize = () => setMinimized(false);

  return (isMinimized)
    ? <InfoButton maximize={maximize} />
    : <InfoPopup minimize={minimize} />
};


export default Info;
