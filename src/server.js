require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT;

const mqtt = require("mqtt");

const admin = require("firebase-admin");
const base64ToJSON = (s) => (s ? JSON.parse(Buffer.from(s, 'base64').toString()) : undefined);

admin.initializeApp({
  credential: admin.credential.cert(
    base64ToJSON(process.env.FIREBASE_SERVICE_ACCOUNT),
  ),
  databaseURL: process.env.DATABASE_URL,
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
});

client.on("error", function () {
  console.log("Can't connect")
  client.end();
});


client.on('message', function(topic, message) {
  switch (topic) {
    case process.env.SYSTEM_TOPIC:
      console.log(topic);
      break;
    case process.env.VISION_TOPIC:
      console.log('hi');
      break;
    case process.env.LIGHT_TOPIC:
      let faceProp = queryFireStore();
      console.log(faceProp);
      break;
    default:
      console.log(`${topic}:${message.toString()}`);
      break;
  }
  saveDataToFireStore(topic, message);
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
  faceDb.onSnapshot(snapshot => {
    snapshot.forEach((face) => {
      faceProp.push(face.data()['selectedFace'])
    });
   }, err => {
    console.log(`Error: ${err}`);
   });
   return _faceProp;
}

app.listen(port, () => console.log(`Experiment app listening on port ${port}!`));
