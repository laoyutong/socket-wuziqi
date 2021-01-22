import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import socket from "./socket/socket";
import PlayerArea from "./components/PlayerArea/PlayerArea";

interface Point {
  x: number;
  y: number;
}

type PointMap = boolean[][];

interface Process {
  point: Point;
  blackFlag: boolean;
}

function App() {
  console.log("app render");

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isBlack, setIsBlack] = useState<boolean>(true);

  const pointMap = useRef<PointMap>([]);

  const initPlayArea = () => {
    const drawLine = (movePoint: Point, toPoint: Point) => {
      const ctx = canvasRef.current?.getContext("2d")!;
      ctx.moveTo(movePoint.x, movePoint.y);
      ctx.lineTo(toPoint.x, toPoint.y);
      ctx.stroke();
    };

    for (let i = 0; i <= 15; i++) {
      drawLine({ x: 0, y: 40 * i }, { x: 600, y: 40 * i });
      drawLine({ x: 40 * i, y: 0 }, { x: 40 * i, y: 600 });
    }

    for (let i = 0; i < 15; i++) {
      pointMap.current[i] = new Array(15).fill(undefined);
    }
  };

  useEffect(() => {
    initPlayArea();
  }, []);

  const judgeGame = (point: Point, blackFlag: boolean): boolean => {
    let m = 0,
      n = 0;
    do {
      m++;
    } while (pointMap.current[point.x - m][point.y] === blackFlag);
    do {
      n++;
    } while (pointMap.current[point.x + n][point.y] === blackFlag);
    if (n + m - 1 >= 5) {
      return true;
    }
    m = n = 0;

    do {
      m++;
    } while (pointMap.current[point.x - m][point.y - m] === blackFlag);
    do {
      n++;
    } while (pointMap.current[point.x + n][point.y + n] === blackFlag);
    if (n + m - 1 >= 5) {
      return true;
    }
    m = n = 0;

    do {
      m++;
    } while (pointMap.current[point.x - m][point.y + m] === blackFlag);
    do {
      n++;
    } while (pointMap.current[point.x + n][point.y - n] === blackFlag);
    if (n + m - 1 >= 5) {
      return true;
    }
    m = n = 0;

    do {
      m++;
    } while (pointMap.current[point.x][point.y - m] === blackFlag);
    do {
      n++;
    } while (pointMap.current[point.x][point.y + n] === blackFlag);
    if (n + m - 1 >= 5) {
      return true;
    }

    return false;
  };

  const drawCricle = useCallback(
    (point: Point, blackFlag: boolean) => {
      if (pointMap.current[point.x][point.y] !== undefined) {
        return;
      }

      pointMap.current[point.x][point.y] = blackFlag;

      const ctx = canvasRef.current?.getContext("2d")!;
      ctx.beginPath();
      ctx.fillStyle = blackFlag ? "black" : "white";
      ctx.arc(point.x * 40 + 20, point.y * 40 + 20, 15, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fill();
      ctx.closePath();

      socket.emit("process", {
        point,
        blackFlag,
      });

      const isOver = judgeGame(point, isBlack);
      if (isOver) {
        socket.emit("success", isBlack ? "黑色" : "白色");
      } else {
        setIsBlack(!isBlack);
      }
    },
    [isBlack]
  );

  useEffect(() => {
    socket.on("success", (winner: string) => {
      alert(`${winner} 获得了胜利！！！`);
    });
  }, []);

  useEffect(() => {
    socket.on("process", (data: Process) => {
      const { point, blackFlag } = data;
      drawCricle(point, blackFlag);
    });
    return () => {
      socket.off("process");
    };
  }, [drawCricle, isBlack]);

  const handleClick = (e: any) => {
    if ((userHold === "白色" && isBlack) || (userHold === "黑色" && !isBlack)) {
      return;
    }
    const xSize = ~~((e.pageX - e.currentTarget.offsetLeft) / 40);
    const ySize = ~~((e.pageY - e.currentTarget.offsetTop) / 40);
    drawCricle({ x: xSize, y: ySize }, isBlack);
  };

  useEffect(() => {
    socket.on("error", (msg: string) => alert(msg));
  }, []);

  const [userHold, setUserHold] = useState<string>("");

  useEffect(() => {
    socket.on("enter", (data: string) => {
      setUserHold(data);
    });
  }, []);

  return (
    <div className="container">
      <div className="player-one">
        <PlayerArea
          name="对手"
          isActive={isBlack ? userHold === "白色" : userHold === "黑色"}
          hold={userHold === "黑色" ? "白色" : "黑色"}
        />
      </div>
      <div className="play-area" onClick={handleClick}>
        <canvas
          width="600"
          height="600"
          ref={canvasRef}
          style={{ backgroundColor: "#5a4326" }}
        />
      </div>
      <div className="player-two">
        <PlayerArea
          name="玩家"
          isActive={isBlack ? userHold === "黑色" : userHold === "白色"}
          hold={userHold}
        />
      </div>
    </div>
  );
}

export default App;
 