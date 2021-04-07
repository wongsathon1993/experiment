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
const fireStore = process.env.DATABASE_URL;

const base64ToJSON = (s) =>
  s ? JSON.parse(Buffer.from(s, "base64").toString()) : undefined;

admin.initializeApp({
  credential: admin.credential.cert(base64ToJSON(serviceAccount)),
  databaseURL: fireStore,
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
  // system topic event
  client.subscribe(process.env.SYSTEM_TOPIC, function (err) {
    if (!err) {
      console.log(`subscribed to ${process.env.SYSTEM_TOPIC}`);
    }
  });

  // controls topic
  client.subscribe(process.env.CONTROL_TOPIC, function (err) {
    if (!err) {
      console.log(`subscribed to ${process.env.CONTROL_TOPIC}`);
    }
  });

  // light and gesture sensor topic
  client.subscribe(process.env.SENSOR_TOPIC, function (err) {
    if (!err) {
      console.log(`subscribed to ${process.env.SENSOR_TOPIC}`);
    }
  });
});

client.on("reconnect", () => {
  console.log("MQTT client is reconnecting...");
});

client.on("disconnect", () => {
  console.log("MQTT client is disconnecting...");
});

client.on("error", function () {
  console.log("Can't connect");
  client.end();
});

client.on("message", function (topic, message) {
  /* topic list = ['/system', '/controls', '/sensors'] */
  if (isJsonString(message)) {
    var action = JSON.parse(message);
    console.log(`${topic}:${message.toString()}`);
    switch (topic) {
      case process.env.SENSOR_TOPIC:
        if (isSensorExist(message)) {
          registerNewSensor(message);
        }
        break;
      case process.env.SYSTEM_TOPIC:
        const transaction = Sentry.startTransaction({
          op: "experiment",
          name: "System Transaction",
        });

        if (action.type == "GESTURE") {
          saveSelectedFaceToFireStore(message);
          setTimeout(() => {
            try {
              computeLightPattern();
              saveActionToFireStore(message);
            } catch (e) {
              Sentry.captureException(e);
            } finally {
              transaction.finish();
            }
          }, 99);
        }
        break;
      case process.env.CONTROL_TOPIC:
        if (action.type == "LIGHT") {
          console.log(`${topic}:${message.toString()}`);
          saveActionToFireStore(message);
        }
        break;
      default:
        break;
    }
  }
});

function isJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

function saveActionToFireStore(message) {
  let now = new Date();
  const db = cloudFirestore.collection("actions");
  const doc = db.doc();

  doc.set({
    topic: "actions",
    action: message.toString(),
    createAt: now.toLocaleString(),
    timestamp: now.valueOf(),
  });
}

function saveSelectedFaceToFireStore(message) {
  let now = new Date();
  const db = cloudFirestore.collection("faceLogs");
  const doc = db.doc();

  doc.set({
    topic: "faces",
    selectedFace: message.toString(),
    createAt: now.toLocaleString(),
    timestamp: now.valueOf(),
  });
}

function registerNewSensor(message) {
  var device = JSON.parse(message);
  let now = new Date();
  const db = cloudFirestore.collection("sensors");
  const doc = db.doc(device.id.toString());

  doc.set({
    topic: "sensors",
    sensor: message.toString(),
    createAt: now.toLocaleString(),
    timestamp: now.valueOf(),
  });
}

function computeLightPattern() {
  let _face0Prop = [];
  let _face1Prop = [];
  let _face2Prop = [];
  let _face3Prop = [];
  let _face4Prop = [];
  let _face5Prop = [];

  let faceLogs = [];

  const faceDb = cloudFirestore.collection("faceLogs");
  faceDb.onSnapshot(
    (snapshot) => {
      snapshot.forEach((face) => {
        faceLogs.push(face.data());
        var data = JSON.parse(face.data()["selectedFace"]);
        if (data["color"] == "yellow") {
          _face0Prop.push(face.data());
        }

        if (data["color"] == "red") {
          _face1Prop.push(face.data());
        }

        if (data["color"] == "blue") {
          _face2Prop.push(face.data());
        }

        if (data["color"] == "green") {
          _face3Prop.push(face.data());
        }

        if (data["color"] == "purple") {
          _face4Prop.push(face.data());
        }

        if (data["color"] == "orange") {
          _face5Prop.push(face.data());
        }
      });

      // genterate list of 24

      var pattern_list = [];

      var yellow = (_face0Prop.length / faceLogs.length) * 100;
      var yellow_length = Math.round((yellow / 100) * 24);

      for (var i = 0; i < yellow_length; i++) {
        pattern_list.push(0);
      }

      var red = (_face1Prop.length / faceLogs.length) * 100;
      var red_length = Math.round((red / 100) * 24);

      for (var j = 0; j < red_length; j++) {
        pattern_list.push(1);
      }

      var blue = (_face2Prop.length / faceLogs.length) * 100;
      var blue_length = Math.round((blue / 100) * 24);

      for (var k = 0; k < blue_length; k++) {
        pattern_list.push(2);
      }

      var green = (_face3Prop.length / faceLogs.length) * 100;
      var green_length = Math.round((green / 100) * 24);

      for (var l = 0; l < green_length; l++) {
        pattern_list.push(3);
      }

      var purple = (_face4Prop.length / faceLogs.length) * 100;
      var purple_length = Math.round((purple / 100) * 24);

      for (var m = 0; m < purple_length; m++) {
        pattern_list.push(4);
      }

      var orange = (_face5Prop.length / faceLogs.length) * 100;
      var orange_length = Math.round((orange / 100) * 24);

      for (var n = 0; n < orange_length; n++) {
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
    },
    (err) => {
      console.log(`Error: ${err}`);
      return [];
    }
  );
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

async function isSensorExist(message) {
  var device = JSON.parse(message);
  let sensorRef = cloudFirestore.collection("sensor");
  let not_exist = false;
  await sensorRef
    .doc(device.id.toString())
    .get()
    .then(function (doc) {
      if (doc.exists) {
        not_exist = false;
      } else {
        not_exist = true;
      }
    })
    .catch(function (error) {
      console.log("Error getting document:", error);
    });
  return not_exist;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

app.get("/healthZ", cors(), function (_, res, __) {
  console.log("don't sleep");
  return res.sendStatus(200);
});

app.get("/lightRefresh", cors(), function (_, res, __) {
  const transaction = Sentry.startTransaction({
    op: "experiment",
    name: "System Transaction",
  });

  setTimeout(() => {
    try {
      computeLightPattern();
    } catch (e) {
      Sentry.captureException(e);
    } finally {
      transaction.finish();
    }
  }, 1000);
  return res.sendStatus(200);
});

app.listen(port, () =>
  console.log(`Experiment app listening on port ${port}!`)
);
