// LIB IMPORT
require("dotenv").config();
const express = require("express");
const mqtt = require("mqtt");
const admin = require("firebase-admin");

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

  // contorls topic
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
  if (topic == process.env.SENSOR_TOPIC) {
    if (isSensorExist(message)) {
      registerNewSensor(message);
    }
    console.log(`${topic}:${message.toString()}`);
  } else if (topic == "/system") {
    if (action.type == 'GESTURE') {
      saveSelectedFaceToFireStore(message);
      publishLightControlMessage();
      // saveActionToFireStore(message);
    }
    console.log(`${topic}:${message.toString()}`);
  } else if (topic == process.env.CONTROL_TOPIC) {
    if (action.type == 'LIGHT') {
    console.log(`${topic}:${message.toString()}`);
    }
  }
});

function saveActionToFireStore( message) {
  let now = new Date();
  const db = cloudFirestore.collection('action');
  const doc = db.doc();

  doc.set({
    topic: 'action',
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
    topic: 'face',
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


function publishLightControlMessage() {
  let trigg_message = {
    type: "LIGHT",
    success: true,
    action: "ON",
    pattern: [],
  };
  client.publish(process.env.CONTROL_TOPIC, JSON.stringify(trigg_message));
}

function isSensorExist(message) {
  var device = JSON.parse(message);
  let sensorRef = cloudFirestore.collection('sensor');
  let not_exist = false;
  sensorRef.doc(device.id.toString()).get().then(function(doc){
    if (!doc.exists) {
      not_exist = true;
    }
  }).catch(function(error) {
    console.log("Error getting document:", error);
  });
  return not_exist;
}

express().get('/', function (req, res) {
  console.log("don't sleep")
})

express().listen(port, () => console.log(`Experiment app listening on port ${port}!`));
