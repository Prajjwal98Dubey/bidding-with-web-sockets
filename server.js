import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
const app = express();

const httpServer = createServer(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(__dirname + "/public"));

app.get("/", (_, res) => {
  return res.sendFile(path.join(__dirname, "./public", "index.html"));
});

const io = new Server(httpServer, () => {});
const userBidsMap = {};
let highestBidUser = { userName: "", price: 0 };

io.on("connection", (socket) => {
  socket.on("user-join", ({ userName }) => {
    socket.username = userName;
    userBidsMap[userName] = 1;
    io.emit("online", io.engine.clientsCount);
  });
  socket.on("bid-update", ({ userName, new_bid_price, price_inc }) => {
    io.emit("new_bid_price_update", { userName, new_bid_price });
    userBidsMap[userName] += price_inc;
    if (userBidsMap[userName] >= highestBidUser.price) {
      highestBidUser.userName = userName;
      highestBidUser.price = userBidsMap[userName];
    }
    io.emit("highest_bid_user", highestBidUser.userName);
  });
  socket.on("disconnecting", () => {
    io.emit("online", io.engine.clientsCount);
  });
  socket.on("disconnect", () =>
    console.log(`${socket.username} disconnected !!!`)
  );
});

httpServer.listen(5000, () => console.log("server listening at 5000 🚀🚀🚀"));
