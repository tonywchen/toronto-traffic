import Ruler from './Ruler';
import Playhead from './Playhead';

const Track = ({ displayTime }) => {
  return (
    <div className="timeline__track relative h-4 w-full">
      <Ruler />
      <Playhead displayTime={displayTime} />
    </div>
  )
};

export default Track;
