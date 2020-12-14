// LIB IMPORT
require("dotenv").config();
const express = require("express");
const mqtt = require("mqtt");
const admin = require("firebase-admin");
const app = express()

const port = process.env.PORT;
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
const fireStore = process.env.DATABASE_URL;

const base64ToJSON = (s) => (s ? JSON.parse(Buffer.from(s, 'base64').toString()) : undefined);

admin.initializeApp({
  credential: admin.credential.cert(
    base64ToJSON(serviceAccount),
  ),
  databaseURL: fireStore,
});

const cloudFirestore = admin.firestore();

cloudFirestore.settings({ timestampsInSnapshots: true });

const client = mqtt.connect(`${process.env.MQTT_BROKER_URL}`);

client.on('connect', function() {
  // system topic event
  client.subscribe(process.env.SYSTEM_TOPIC, function(err) {
    if (!err) {
      console.log(`subscribed to ${process.env.SYSTEM_TOPIC}`)
    }
  });

  // controls topic
  client.subscribe(process.env.CONTROL_TOPIC, function(err) {
    if (!err) {
      console.log(`subscribed to ${process.env.CONTROL_TOPIC}`)
    }
  });

  // light and gesture sensor topic
  client.subscribe(process.env.SENSOR_TOPIC, function(err) {
    if (!err) {
      console.log(`subscribed to ${process.env.SENSOR_TOPIC}`)
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
  console.log("Can't connect")
  client.end();
});


client.on('message', function(topic, message) {
  /* topic list = ['/system', '/controls', '/sensors'] */
  var action = JSON.parse(message);
  console.log(`${topic}:${message.toString()}`);
  if (topic == process.env.SENSOR_TOPIC) {
    if (isSensorExist(message)) {
      registerNewSensor(message);
    }
  } else if (topic == "/system") {
    if (action.type == 'GESTURE') {
      saveSelectedFaceToFireStore(message);
      let lightPattern = computeLightPattern();
      publishLightControlMessage(lightPattern, "ON");
      saveActionToFireStore(message);
    }
  } else if (topic == process.env.CONTROL_TOPIC) {
    if (action.type == 'LIGHT') {
      console.log(`${topic}:${message.toString()}`);
      saveActionToFireStore(message);
    }
  }
});

function saveActionToFireStore(message) {
  let now = new Date();
  const db = cloudFirestore.collection('actions');
  const doc = db.doc();

  doc.set({
    topic: 'actions',
    action: message.toString(),
    createAt: now.toLocaleString(),
    timestamp: now.valueOf(),
  });
}

function saveSelectedFaceToFireStore(message) {
  let now = new Date();
  const db = cloudFirestore.collection('faceLogs');
  const doc = db.doc();

  doc.set({
    topic: 'faces',
    selectedFace: message.toString(),
    createAt: now.toLocaleString(),
    timestamp: now.valueOf(),
  });
}

function registerNewSensor(message) {
  var device = JSON.parse(message);
  let now = new Date();
  const db = cloudFirestore.collection('sensor');
  const doc = db.doc(device.id.toString());

  doc.set({
    topic: 'sensor',
    sensor: message.toString(),
    createAt: now.toLocaleString(),
    timestamp: now.valueOf(),
  });
}

function computeLightPattern() {
  let _pattern_value = 0;
  let _face0Prop = [];
  let _face1Prop = [];
  let _face2Prop = [];
  let _face3Prop = [];
  let _face4Prop = [];
  let _face5Prop = [];

  let faceLogs = [];

  const faceDb = cloudFirestore.collection('faceLogs');
  faceDb.onSnapshot(snapshot => {
    snapshot.forEach((face) => {
      faceLogs.push(face.data());
      if (face.data()['face'] == 0) {
        _face0Prop.push(face.data());
      }

      if (face.data()['face'] == 1) {
        _face1Prop.push(face.data());
      }

      if (face.data()['face'] == 2) {
        _face2Prop.push(face.data());
      }

      if (face.data()['face'] == 3) {
        _face3Prop.push(face.data());
      }

      if (face.data()['face'] == 4) {
        _face4Prop.push(face.data());
      }

      if (face.data()['face'] == 5) {
        _face5Prop.push(face.data());
      }
    });

    console.log((_face0Prop.length / faceLogs.length) * 100);
    console.log((_face1Prop.length / faceLogs.length) * 100);
    console.log((_face2Prop.length / faceLogs.length) * 100);
    console.log((_face3Prop.length / faceLogs.length) * 100);
    console.log((_face4Prop.length / faceLogs.length) * 100);
    console.log((_face5Prop.length / faceLogs.length) * 100);

   }, err => {
    console.log(`Error: ${err}`);
   });

  return 25;
}

async function publishLightControlMessage(pattern, action) {
  let trigg_message = {
    type: "LIGHT",
    success: true,
    action: action,
    prob: pattern,
  };
  await sleep(1000);
  client.publish(process.env.CONTROL_TOPIC, JSON.stringify(trigg_message));
}

async function isSensorExist(message) {
  var device = JSON.parse(message);
  let sensorRef = cloudFirestore.collection('sensor');
  let not_exist = false;
  await sensorRef.doc(device.id.toString()).get().then(function(doc){
    if (doc.exists) {
      not_exist = false;
    } else {
      not_exist = true
    }
  }).catch(function(error) {
    console.log("Error getting document:", error);
  });
  return not_exist;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

app.get('/heathZ', function (req, res) {
  console.log("don't sleep")
  return res.sendStatus(200);
})

app.listen(port, () => console.log(`Experiment app listening on port ${port}!`));
