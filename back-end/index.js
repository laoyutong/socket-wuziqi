const Koa = require("koa");
const app = new Koa();
const server = require("http").Server(app.callback());
const io = require("socket.io")(server, { cors: true });

const blackAndWhite = ["黑色", "白色"];

server.listen(5008, () => {
  console.log(`app run at : http://127.0.0.1:5008`);
});

let enterNum = 0;

io.on("connection", (socket) => {
  if (enterNum >= 2) {
    socket.emit("error", "Room is full");
    return;
  }
  enterNum++;

  let holder;
  if (Math.random() > 0.5) {
    holder = blackAndWhite.pop();
  } else {
    holder = blackAndWhite.shift();
  }
  socket.emit("enter", holder);

  socket.on("process", (data) => {
    socket.broadcast.emit("process", data);
  });
  socket.on("success", (data) => {
    socket.broadcast.emit("success", data);
  });

  socket.on("disconnect", () => {
    blackAndWhite.push(holder);
    enterNum--;
  });
});
