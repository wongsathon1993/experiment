#include <Ultrasonic.h>
#include <LedControl.h>
#include <EEPROM.h>
#include <ArduinoJson.h>
#include <binary.h>
#include <WiFi.h>
#include <PubSubClient.h>


#define WIFI_STA_NAME "xxxxxxxxxx"
#define WIFI_STA_PASS "xxxxxxxxxx"

#define MQTT_SERVER   "m16.cloudmqtt.com"
#define MQTT_PORT     16319
#define MQTT_USERNAME "ggaomyqh"
#define MQTT_PASSWORD "3wjA27NFU3ET"

Ultrasonic ultrasonicLeft(5, 6);        // PIN 5 = TRIG // PIN 6 = ECHO
Ultrasonic ultrasonicRight(3, 4);        // PIN 3 = TRIG // PIN 4 = ECHO
LedControl lc = LedControl(8, 10, 9, 1); // DIN = 8  // CS = 9 // CLK = 1

int addr1 = 0;
int addr2 = 5;
byte value1 = 1;
byte value2 = 2;

unsigned long delaytime = 1000;

WiFiClient client;
PubSubClient mqtt(client);

void callback(char* topic, byte* payload, unsigned int length) {
  payload[length] = '\0';
  String topic_str = topic, payload_str = (char*)payload;
  Serial.println("[" + topic_str + "]: " + payload_str);

  digitalWrite(LED_BUILTIN, (payload_str == "ON") ? HIGH : LOW);
}


byte fZero[8] = {
   B00111100,
   B01000010,
   B10000101,
   B10000001,
   B10000001,
   B10000101,
   B01000010,
   B00111100,
};

byte fOne[8] = {
    B11111111,
    B11111111,
    B11111111,
    B11111111,
    B11111111,
    B11111111,
    B11111111,
    B11111111,
};

byte ff[8] = {
    B00111100,
    B01000010,
    B10010101,
    B10100001,
    B10100001,
    B10010101,
    B01000010,
    B00111100,
};

byte ft[8] = {
    B00111100,
    B01000010,
    B10100101,
    B10010001,
    B10010001,
    B10100101,
    B01000010,
    B00111100,
};

byte fTwo[8] = {
    B00111100,
    B01000010,
    B10100101,
    B10110001,
    B10110001,
    B10100101,
    B01000010,
    B00111100,
};

byte fThree[8] = {
    B00111100,
    B01000010,
    B10000101,
    B10110001,
    B10110001,
    B10000101,
    B01000010,
    B00111100,
};

byte fFour[8] = {
    B00111100,
    B01000010,
    B10010101,
    B10010001,
    B10010001,
    B10010101,
    B01000010,
    B00111100,
};

int currentIndex = 0;

void setup()
{
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);

  Serial.println();
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(WIFI_STA_NAME);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_STA_NAME, WIFI_STA_PASS);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    digitalWrite(LED_BUILTIN, !digitalRead(LED_BUILTIN));
  }

  digitalWrite(LED_BUILTIN, HIGH);
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  mqtt.setServer(MQTT_SERVER, MQTT_PORT);
  mqtt.setCallback(callback);
  lc.shutdown(0, false);
  lc.setIntensity(0, 8);
  lc.clearDisplay(0);
  displayFace(fOne);
}

void loop()
{
  if (mqtt.connected() == false) {
    Serial.print("MQTT connection... ");
    if (mqtt.connect(MQTT_NAME, MQTT_USERNAME, MQTT_PASSWORD)) {
      Serial.println("connected");

      value1 = EEPROM.read(addr1);
      value2 = EEPROM.read(addr2);

      int dist = ultrasonicLeft.read();
      int dist2 = ultrasonicRight.read();

      if ((dist < 20) && (value2 == 2))
      {
        currentIndex = goLeft(currentIndex);
        selectFace(currentIndex);
        sendDataToServer();
      }
      if ((dist < 20) && (value2 != 2))
      {
        EEPROM.write(addr1, 1);
        delay(10);
      }
      if ((dist2 < 20) && (value1 == 1))
      {
        currentIndex = goRight(currentIndex);
        selectFace(currentIndex);
        sendDataToServer();
      }
      if ((dist2 < 20) && (value1 != 1))
      {
        EEPROM.write(addr2, 2);
        delay(10);
      }
    } else {
      Serial.println("failed");
      delay(5000);
    }
  } else {
    mqtt.loop();
  }
}

int goLeft(int idx)
{
  if(idx == 0) { //left most index
    return idx;
  } else {
    idx -= 1;
  }
  return idx;
}

void selectFace(int index) {
    switch (index)
    {
    case 0:
      displayFace(fZero);
      break;
    case 1:
      displayFace(ft);
      break;
    case 2:
      displayFace(fTwo);
      break;
    case 3:
      displayFace(fThree);
      break;
    case 4:
      displayFace(fFour);
      break;
    default:
      displayFace(fZero);
      break;
    }
}

void displayFace(byte* face) {
  lc.setRow(0, 0, face[0]);
  lc.setRow(0, 1, face[1]);
  lc.setRow(0, 2, face[2]);
  lc.setRow(0, 3, face[3]);
  lc.setRow(0, 4, face[4]);
  lc.setRow(0, 5, face[5]);
  lc.setRow(0, 6, face[6]);
  lc.setRow(0, 7, face[7]);
  EEPROM.write(addr1, 0);
  delay(10);
  EEPROM.write(addr2, 0);
  delay(10);
}

int goRight(int idx)
{
  if(idx == 7) { //right most index
    return idx;
  } else {
    idx += 1;
  }
  return idx;
}

void sendDataToServer() {
  StaticJsonDocument<500> doc;

  JsonArray analogValues = doc.createNestedArray("analog");
  for (int pin = 0; pin < 6; pin++) {
    int value = analogRead(pin);
    analogValues.add(value);
  }

  JsonArray digitalValues = doc.createNestedArray("digital");
  for (int pin = 0; pin < 14; pin++) {
    int value = digitalRead(pin);
    digitalValues.add(value);
  }

  String message = serialized(doc);
  mqtt.publish("/system", message);
}
