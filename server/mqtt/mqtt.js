require("dotenv").config();
const mqtt = require("mqtt");
const admin = require("firebase-admin");

const serviceAccount =
  "ewogICJ0eXBlIjogInNlcnZpY2VfYWNjb3VudCIsCiAgInByb2plY3RfaWQiOiAiZXhwZXJpbWVudC1kOWY2NCIsCiAgInByaXZhdGVfa2V5X2lkIjogIjc5MDI5NjkzNmQ5MWI0MzNhMDliYWIxMWRkNTllMDNmODBhOGNjN2YiLAogICJwcml2YXRlX2tleSI6ICItLS0tLUJFR0lOIFBSSVZBVEUgS0VZLS0tLS1cbk1JSUV2QUlCQURBTkJna3Foa2lHOXcwQkFRRUZBQVNDQktZd2dnU2lBZ0VBQW9JQkFRQ1lwZHI3ckNUQk9KK25cbjFKZklGVnRRVXcvS0xrNWtSWStxaFlvcEV5YVFKdTN0emlDbTBrNlBBQ0dySlVRWHUyQm02VHh3emtWRjB3d2lcbkZkd1dMSnlSd0w1MCtxeUowZk10QWxwRVdFS0NueFdaUmJQYnhpQ00vbDRScFA5MWxaMmpLZ2hJTUV2dUdldFdcbk5vTnVoTGJLWjJVS3U3a1B0NDZMZFptQ1hVSHlLb0crT2hHM0crTXZRWWJjZFZGU3NRbjBhWDhRWjVJaFpNNDhcbmxhbGJQV05NR01FQ3FYam5CMlExSjd2ZHNtSHVPY01NREEvem1sRzN5ZncvTktEdDFHWTM3WVhIN05DQklFUXVcbkcvN3YwOUJmVFZZb3JIeFNWbmp4eS81WndmeXgzZ3BqZVo0V05ROWNMbFh2dFF2VzlxTWlsbkdHZWxWZGtLVVZcbmtyWitObS8xQWdNQkFBRUNnZ0VBRnVDVWh5OXZlcjNmdjZsdTdmKzFaYjV0R1dJRFFhZmpOaTA1WFpxUEp2K09cbm5SdE5iWE1MYndjWUJLeGJIaXRvOFVOM1dYaXdqUnhxTHhtVG1JY3JGL1VKRmtNVFpMeGdjNWhzcXQySGFrZ3BcblZvVkp4V0JXTkl0UzBkWW1xeHEzTzJMclJ0Wm1LdE1ib0JvZmJJcmJVazVZcUZrbURTTDNiQk05NUhuUmpsZHhcbk5zdGJkR2piOVZ5aU9NenpySXVEOWVYbS9udW9qWFpvWDJiWUkwbzR2U2pGM09IZmRzcWM2dDR3OXpnaEl0YUFcbldTYUxYRFVra2pNclZTZkRoemZ1TXp0SHhndXh5eWMyMDNUZ1dONjJoSjBxc2JGc3VBRFZpcUtDeHgvMERtK2JcbnVBZUx5UjVLaFpDald3ajUyZTBFM3EvZ0tZMyt3ZjhCQTlGbGJLNHo2UUtCZ1FET2s2dzVEdC9PbVU5ZzZlTk9cbkN5T2tWNVlQYWUwN2Q0eU96NXdJN1JvZ0VFNGJkcTArM2pOaGtrVUYwTm05L0lCVUE2MVNlTGNBbmQxL2ZOVVpcbnVDR1F5c0N6MnRaeTVyVncvMlNMUTA4aFd4MzNqOTdIejU1eG5WMktFSXo5SXVpbVZIblRSL2VrbUd1aU82YmFcblRlRzkzREhYNXRSdS9na09IQ1ltK3gyelp3S0JnUUM5S3lvcjIvMVBFVVBYN1VaYzVvTG44cFJ4UVpmcmtFYnJcblpvZ2FxcVlhVkUzdUhpaWhjRm9rbGNYSTFPSnVZam5MTkMrMUhyWjNickRDejRodVJGeFJDeUxXWCtNR0hFc3ZcbkVRTHdLWER4Y2Q3TVFHUTlYSGY1cjZka3FEZVM2ZTR4YzYxaUF1TVd2UUY5OTlBallxUUVuSXA1bEcrN0czVDBcbktGUVVpbG9rUXdLQmdFYVhLZVA1bERzcUluandrNjhvbVU1Z2E3UHFzNWw5bWJkM2RFK01qai9rc253cUNydVBcbi9LamI3ZUExNVNKSjlhUS8rV3RVT3R6b0ZUZXFkYnVyTXpVaVE4VnlBNVFTQ0hDTHBWVDlkRDNtd0EvSHh3NHFcbmdXODdvaW82eTZMNDJkMTB3b2lUY0NsN3VGUWc1RHgzSHF2ZFlkN3dUeWw2ZjZlbHNOZmpPZHdEQW9HQVpFV2tcbkpmbUhiVWoya0ZlS3E2WFlrQUNLNVBuakFJL0t0Kzd5aUVnYW9ldzhIdE5Ic0VOdzFPRzdKSGlMeWYweEsyQnZcblJXK1JRditlbkxVTFdYL00rM3lPcTluSjZpeEhRaHlmVlJSeWRObHFReFNDemUvYy9MSTZaZVd4QjZRT2laSUtcbnZ1Qk81WGVzZWN4SlBPaUZqcGczNHJobS9XUlJlemFCVXgzL0tDY0NnWUJ5Q1pWYzd3WmljVVpRRVBXZDdUT0xcbjh1a2twaFBFMEZzNkNZK2dVNnRMT0hMNGhRRVBGNkliK29rV3V0VFc0ekg3eHdpK21pRlgrL04yTW5lWlRsSGdcbjZaRHZtZ2gvcE1JY3g5VnBHekJqR1NnM3lvT28xaWtTUWxaRUVsNkJsWERwOHIwbUh3eVd2anh6eFhOdldNbEJcbmFZbkV3RGlQQmVkcmsrUUxWeUovVGc9PVxuLS0tLS1FTkQgUFJJVkFURSBLRVktLS0tLVxuIiwKICAiY2xpZW50X2VtYWlsIjogImZpcmViYXNlLWFkbWluc2RrLTNtZW5sQGV4cGVyaW1lbnQtZDlmNjQuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iLAogICJjbGllbnRfaWQiOiAiMTA3ODQwMDkwNTE5NzQ2MDk2OTY3IiwKICAiYXV0aF91cmkiOiAiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tL28vb2F1dGgyL2F1dGgiLAogICJ0b2tlbl91cmkiOiAiaHR0cHM6Ly9vYXV0aDIuZ29vZ2xlYXBpcy5jb20vdG9rZW4iLAogICJhdXRoX3Byb3ZpZGVyX3g1MDlfY2VydF91cmwiOiAiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vb2F1dGgyL3YxL2NlcnRzIiwKICAiY2xpZW50X3g1MDlfY2VydF91cmwiOiAiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vcm9ib3QvdjEvbWV0YWRhdGEveDUwOS9maXJlYmFzZS1hZG1pbnNkay0zbWVubCU0MGV4cGVyaW1lbnQtZDlmNjQuaWFtLmdzZXJ2aWNlYWNjb3VudC5jb20iCn0K";

const base64ToJSON = (s) =>
  s ? JSON.parse(Buffer.from(s, "base64").toString()) : undefined;

admin.initializeApp({
  credential: admin.credential.cert(base64ToJSON(serviceAccount)),
});

const cloudFirestore = admin.firestore();

cloudFirestore.settings({ timestampsInSnapshots: true });

const client = mqtt.connect(
  "mqtt://ggaomyqh:3wjA27NFU3ET@m16.cloudmqtt.com:16319/"
);

client.on("connect", function () {
  // system topic event
  client.subscribe("/system", function (err) {
    if (!err) {
      console.log(`subscribed to /system`);
    }
  });

  // controls topic
  client.subscribe("/controls", function (err) {
    if (!err) {
      console.log(`subscribed to /controls`);
    }
  });

  // light and gesture sensor topic
  client.subscribe("/sensors", function (err) {
    if (!err) {
      console.log(`subscribed to /sensors`);
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
  client.reconnect();
});

client.on("message", function (topic, message) {
  /* topic list = ['/system', '/controls', '/sensors'] */
  if (isJsonString(message)) {
    var action = JSON.parse(message);
    console.log(`incoming message: ${topic}:${message.toString()}`);
    if (action.type == "GESTURE") {
      saveSelectedFaceToFireStore(message);
    }
    switch (topic) {
      case "/sensors":
        if (isSensorExist(message)) {
          registerNewSensor(message);
        }
        break;
      case "/system":
        if (action.type == "GESTURE") {
          computeLightPattern();
        }
        break;
      case "/controls":
        if (action.type == "LIGHT") {
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

async function saveActionToFireStore(message) {
  let now = new Date();
  const db = cloudFirestore.collection("actions");
  await db
    .doc()
    .set({
      topic: "actions",
      action: message.toString(),
      createAt: now.toLocaleString(),
      timestamp: now.valueOf(),
    })
    .catch((e) => {
      console.log(e);
    });
}

async function saveSelectedFaceToFireStore(message) {
  let now = new Date();
  const db = cloudFirestore.collection("faceLogs");

  await db
    .doc()
    .set({
      topic: "faces",
      selectedFace: message.toString(),
      createAt: now.toLocaleString(),
      timestamp: now.valueOf(),
    })
    .catch((e) => {
      console.log(e);
    });
}

async function registerNewSensor(message) {
  var device = JSON.parse(message);
  let now = new Date();
  const db = cloudFirestore.collection("sensors");
  const doc = db.doc(device.id.toString());

  await doc
    .set({
      topic: "sensors",
      sensor: message.toString(),
      createAt: now.toLocaleString(),
      timestamp: now.valueOf(),
    })
    .catch((e) => {
      console.log(e);
    });
}

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
  client.publish("/controls", JSON.stringify(trigg_message));
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
