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
  let trigg_message = {
    message: "hello",
  };

  client.subscribe(process.env.SYSTEM_TOPIC, function(err) {
    if (!err) {
      client.publish(process.env.SYSTEM_TOPIC, JSON.stringify(trigg_message));
    }
  });

  client.subscribe(process.env.VISION_TOPIC, function(err) {
    if (!err) {
      client.publish(process.env.VISION_TOPIC, JSON.stringify(trigg_message));
    }
  });

  client.subscribe(process.env.LIGHT_TOPIC, function(err) {
    if (!err) {
      client.publish(process.env.LIGHT_TOPIC, JSON.stringify(trigg_message));
    }
  });
});

client.on("error", function () {
  console.log("Can't connect")
  client.end();
});


client.on('message', function(topic, message) {
  console.log(`${topic}:${message.toString()}`);
  if (topic == process.env.SYSTEM_TOPIC) {
    saveDataToFireStore(topic, message);
    queryFireStore();
  }
});

function saveDataToFireStore(topic, message) {
  let now = new Date();
  const db = cloudFirestore.collection(topic);
  const doc = db.doc();

  doc.set({
    topic: topic,
    selectedFace: message.toString(),
    createAt: now.toLocaleString(),
    timestamp: now.valueOf(),
  });
}

function queryFireStore(){
  let _faceProp = [];
  const faceDb = cloudFirestore.collection('faceLogs');
  faceDb.onSnapshot(snapshot => {
    snapshot.forEach((face) => {
      console.log(face.id)
      _faceProp.push(face.data()['selectedFace'])
    });
    console.log(_faceProp.length);
   }, err => {
    console.log(`Error: ${err}`);
   });
}

express().listen(port, () => console.log(`Experiment app listening on port ${port}!`));
