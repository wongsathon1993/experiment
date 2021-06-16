// LIB IMPORT
require("dotenv").config();
const express = require("express");
const mqtt = require("mqtt");
const admin = require("firebase-admin");
const Sentry = require("@sentry/node");
const cors = require("cors");
const app = express();

const port = process.env.PORT;
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

const base64ToJSON = (s) =>
  s ? JSON.parse(Buffer.from(s, "base64").toString()) : undefined;

admin.initializeApp({
  credential: admin.credential.cert(base64ToJSON(serviceAccount)),
});

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  env: process.env.STAGE,
});

const cloudFirestore = admin.firestore();

cloudFirestore.settings({ timestampsInSnapshots: true });

const client = mqtt.connect(`${process.env.MQTT_BROKER_URL}`);

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

async function computeLightPattern() {
  let _face0Prop = [];
  let _face1Prop = [];
  let _face2Prop = [];
  let _face3Prop = [];
  let _face4Prop = [];
  let _face5Prop = [];

  let faceLogs = [];

  await cloudFirestore
    .collection("faceLogs")
    .get()
    .then((snapshot) => {
      snapshot.forEach((face) => {
        faceLogs.push(face.data());
        var data = JSON.parse(face.data()["selectedFace"]);
        if (data["color"] == "yellow") {
          _face0Prop.push(face.data());
        }

        if (data["color"] == "blue") {
          _face1Prop.push(face.data());
        }

        if (data["color"] == "white") {
          _face2Prop.push(face.data());
        }

        if (data["color"] == "green") {
          _face3Prop.push(face.data());
        }

        if (data["color"] == "red") {
          _face4Prop.push(face.data());
        }

        if (data["color"] == "purple") {
          _face5Prop.push(face.data());
        }
      });
    })
    .catch((e) => {
      console.log(e);
    });

  await Promise.all(faceLogs);

  // genterate list of 24

  var pattern_list = [];

  var yellow = (_face0Prop.length / faceLogs.length) * 100;
  var yellow_length = Math.round((yellow / 100) * 24);

  for (var i = 0; i < yellow_length; i++) {
    pattern_list.push(0);
  }

  var blue = (_face1Prop.length / faceLogs.length) * 100;
  var blue_length = Math.round((blue / 100) * 24);

  for (var j = 0; j < blue_length; j++) {
    pattern_list.push(1);
  }

  var white = (_face2Prop.length / faceLogs.length) * 100;
  var white_length = Math.round((white / 100) * 24);

  for (var k = 0; k < white_length; k++) {
    pattern_list.push(2);
  }

  var green = (_face3Prop.length / faceLogs.length) * 100;
  var green_length = Math.round((green / 100) * 24);

  for (var l = 0; l < green_length; l++) {
    pattern_list.push(3);
  }

  var red = (_face4Prop.length / faceLogs.length) * 100;
  var red_length = Math.round((red / 100) * 24);

  for (var m = 0; m < red_length; m++) {
    pattern_list.push(4);
  }

  var purple = (_face5Prop.length / faceLogs.length) * 100;
  var purple_length = Math.round((purple / 100) * 24);

  for (var n = 0; n < purple_length; n++) {
    pattern_list.push(5);
  }

  if (pattern_list.length < 24) {
    while (pattern_list.length < 24) {
      pattern_list.push(9);
    }
  } else if (pattern_list.length > 24) {
    pattern_list.slice(0, 23);
  }

  publishLightControlMessage(pattern_list, "ON");
}

async function publishLightControlMessage(pattern, action) {
  let trigg_message = {
    type: "LIGHT",
    success: true,
    action: action,
    list: pattern,
  };
  await sleep(500);
  client.publish(process.env.CONTROL_TOPIC, JSON.stringify(trigg_message));
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function clearCollection(path) {
  const ref = cloudFirestore.collection(path);
  ref.onSnapshot((snapshot) => {
    snapshot.docs.forEach((doc) => {
      ref.doc(doc.id).delete();
    });
  });
}

app.get("/healthZ", cors(), function (_, res, __) {
  console.log("don't sleep");
  return res.sendStatus(200);
});

app.get("/lightRefresh", cors(), function (_, res, __) {
  setTimeout(() => {
    computeLightPattern();
  }, 1000);
  return res.sendStatus(200);
});

app.get("/resetData", function (req, res, __) {
  let path = req.query.path;

  if (path === undefined || path === "") {
    return res.sendStatus(400);
  }

  setTimeout(() => {
    clearCollection(path);
  }, 1000);
  return res.sendStatus(200);
});

app.listen(port, () =>
  console.log(`Experiment app listening on port ${port}!`)
);
