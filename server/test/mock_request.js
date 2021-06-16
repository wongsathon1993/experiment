require("dotenv").config();
const schedule = require("node-schedule");
const mqtt = require("mqtt");

const client = mqtt.connect(
  "mqtt://ggaomyqh:3wjA27NFU3ET@m16.cloudmqtt.com:16319/"
);

client.on("connect", function () {
  console.log("Ready To Rock!!");
});

client.on("reconnect", () => {
  console.log("MQTT client is reconnecting...");
});

client.on("disconnect", () => {
  console.log("MQTT client is disconnecting...");
});

client.on("error", function () {
  console.log("Can't connect");
  client.reconnect();
});

const job = schedule.scheduleJob("*/1 * * * *", async function () {
  let trigg_message = { type: "GESTURE", face: 5, value: 1.3, color: "purple" };
  client.publish("/system", JSON.stringify(trigg_message));
});
