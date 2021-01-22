import { memo, FC } from "react";
import classnames from "classnames";

import "./PlayerArea.css";

interface IProps {
  name: string;
  isActive: boolean;
  hold: string;
}

const PlayerArea: FC<IProps> = ({ name, isActive, hold }) => {
  console.log("play-area component render");

  return (
    <div className="player-area-container">
      <div
        className={classnames("user-pic", {
          active: isActive,
        })}
      ></div>
      <div className="user-name">{name}</div>
      <div className="user-hold">{hold}</div>
    </div>
  );
};

export default memo(PlayerArea);
