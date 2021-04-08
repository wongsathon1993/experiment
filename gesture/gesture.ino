#include <WiFi.h>
#include <ArduinoJson.h>
#include <binary.h>
#include <PubSubClient.h>
#include <SPI.h>
#include <Adafruit_GFX.h>
#include <Max72xxPanel.h>
#include <HTTPClient.h>

#define WIFI_STA_NAME "True_IoT_Pocket_WiFi_P1_39955" //change to your own ssid
#define WIFI_STA_PASS "39639955" //change to your own password

#define MQTT_SERVER "m16.cloudmqtt.com"
#define MQTT_PORT 16319
#define MQTT_USER_ID "GESTURE01"
#define MQTT_USERNAME "ggaomyqh"
#define MQTT_PASSWORD "3wjA27NFU3ET"

const int uOneTrigPin = 25;
const int uOneEchoPin = 26;

const int uTwoTrigPin = 17;
const int uTwoEchoPin = 16;

int soundPortValue;

Max72xxPanel matrix = Max72xxPanel(5, 1, 1);

char output[1024];

WiFiClient client;
PubSubClient mqtt(client);

HTTPClient http;

void noFace()
{
  matrix.drawPixel(0, 0, 1);
  matrix.write();
}

void happyFace()
{
  matrix.drawPixel(1, 2, 1);

  matrix.drawPixel(6, 2, 1);

  matrix.drawPixel(1, 3, 1);
  matrix.drawPixel(3, 3, 1);

  matrix.drawPixel(6, 3, 1);

  matrix.drawPixel(2, 5, 1);
  matrix.drawPixel(5, 5, 1);

  matrix.drawPixel(3, 6, 1);
  matrix.drawPixel(4, 6, 1);
  matrix.write();
}

void sadFace()
{
  matrix.drawPixel(0, 2, 1);
  matrix.drawPixel(1, 2, 1);
  matrix.drawPixel(2, 2, 1);
  matrix.drawPixel(5, 2, 1);
  matrix.drawPixel(6, 2, 1);
  matrix.drawPixel(7, 2, 1);

  matrix.drawPixel(1, 3, 1);
  matrix.drawPixel(6, 3, 1);

  matrix.drawPixel(1, 4, 1);
  matrix.drawPixel(6, 4, 1);

  matrix.drawPixel(3, 5, 1);
  matrix.drawPixel(4, 5, 1);

  matrix.drawPixel(2, 6, 1);
  matrix.drawPixel(5, 6, 1);
  matrix.write();
}

void normalFace()
{
  matrix.drawPixel(1, 2, 1);
  matrix.drawPixel(6, 2, 1);

  matrix.drawPixel(1, 3, 1);
  matrix.drawPixel(6, 3, 1);

  matrix.drawPixel(3, 4, 1);

  matrix.drawPixel(3, 6, 1);
  matrix.drawPixel(4, 6, 1);
  matrix.write();
}

void boredFace()
{
  matrix.drawPixel(1, 2, 1);
  matrix.drawPixel(6, 2, 1);

  matrix.drawPixel(1, 3, 1);
  matrix.drawPixel(4, 3, 1);
  matrix.drawPixel(6, 3, 1);

  matrix.drawPixel(2, 6, 1);
  matrix.drawPixel(3, 6, 1);
  matrix.drawPixel(4, 6, 1);
  matrix.drawPixel(5, 6, 1);
  matrix.write();
}

void angryFace()
{
  matrix.drawPixel(2, 1, 1);
  matrix.drawPixel(5, 1, 1);

  matrix.drawPixel(1, 2, 1);
  matrix.drawPixel(2, 2, 1);
  matrix.drawPixel(5, 2, 1);
  matrix.drawPixel(6, 2, 1);

  matrix.drawPixel(1, 3, 1);
  matrix.drawPixel(6, 3, 1);

  matrix.drawPixel(3, 4, 1);
  matrix.drawPixel(4, 4, 1);

  matrix.drawPixel(2, 5, 1);
  matrix.drawPixel(5, 5, 1);

  matrix.drawPixel(1, 6, 1);
  matrix.drawPixel(6, 6, 1);
  matrix.write();
}

void anxiousFace()
{
  matrix.drawPixel(2, 1, 1);
  matrix.drawPixel(5, 1, 1);

  matrix.drawPixel(1, 2, 1);
  matrix.drawPixel(6, 2, 1);

  matrix.drawPixel(1, 3, 1);
  matrix.drawPixel(4, 3, 1);
  matrix.drawPixel(6, 3, 1);

  matrix.drawPixel(2, 5, 1);
  matrix.drawPixel(5, 5, 1);

  matrix.drawPixel(1, 6, 1);
  matrix.drawPixel(3, 6, 1);
  matrix.drawPixel(4, 6, 1);
  matrix.drawPixel(6, 6, 1);
  matrix.write();
}

int currentIndex = 0;

void setup()
{
  Serial.begin(9600);
  pinMode(LED_BUILTIN, OUTPUT);

  Serial.println();
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(WIFI_STA_NAME);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_STA_NAME, WIFI_STA_PASS);

  while (WiFi.status() != WL_CONNECTED)
  {
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
  matrix.setIntensity(7);
  matrix.fillScreen(1);
  matrix.write();
  delay(500);
  matrix.fillScreen(0);
  matrix.write();
  pinMode(uOneTrigPin, OUTPUT);
  pinMode(uOneEchoPin, INPUT);
  delay(500);
  pinMode(uTwoTrigPin, OUTPUT);
  pinMode(uTwoEchoPin, INPUT);
}

void loop()
{
  if (mqtt.connected() == false)
  {
    Serial.print("MQTT connection... ");
    if (mqtt.connect(MQTT_USER_ID, MQTT_USERNAME, MQTT_PASSWORD))
    {
      Serial.println("connected");
      resetSystem();
      sendSensorData();
    }
    else
    {
      Serial.println("failed");
      delay(5000);
    }
  }
  else
  {
    mqtt.loop();
    soundPortValue = analogRead(36);

    Serial.println(soundPortValue);

    if (((soundPortValue < 2047) && (soundPortValue > 0)) || (soundPortValue == 4095))
    {
      long duration1, distance1;
      digitalWrite(uOneTrigPin, LOW);
      delay(50);
      digitalWrite(uOneTrigPin, HIGH);
      delay(50);
      digitalWrite(uOneTrigPin, LOW);
      duration1 = pulseIn(uOneEchoPin, HIGH);
      distance1 = (duration1 / 2) / 29.1;

      Serial.print("Sensor One: ");
      Serial.println(distance1);

      delay(100);

      if ((distance1 < 8) && (distance1 > 0))
      {
        if ((currentIndex >= 0) && (currentIndex != 5))
        {
          currentIndex += 1;
        }
        delay(100);
        displayFace(currentIndex);
      }

      delay(100);

      long duration2, distance2;
      digitalWrite(uTwoTrigPin, LOW);
      delay(50);
      digitalWrite(uTwoTrigPin, HIGH);
      delay(50);
      digitalWrite(uTwoTrigPin, LOW);
      duration2 = pulseIn(uTwoEchoPin, HIGH);
      distance2 = (duration2 / 2) / 29.1;

      Serial.print("Sensor Two: ");
      Serial.println(distance2);

      delay(100);

      if ((distance2 < 8) && (distance2 > 0))
      {
        if ((currentIndex <= 5) && (currentIndex != 0))
        {
          currentIndex -= 1;
        }
        delay(100);
        displayFace(currentIndex);
      }

      delay(100);
    }
    else
    {
      delay(100);
      sendDataToServer(currentIndex);
    }
    delay(100);
  }
}

void displayFace(int index)
{
  matrix.fillScreen(0);
  matrix.write();
  delay(100);
  switch (index)
  {
  case 0:
    happyFace();
    break;
  case 1:
    sadFace();
    break;
  case 2:
    normalFace();
    break;
  case 3:
    boredFace();
    break;
  case 4:
    angryFace();
    break;
  case 5:
    anxiousFace();
    break;
  default:
    noFace();
    break;
  }
}

void sendSensorData()
{
  StaticJsonDocument<1024> doc;

  doc["sensor"] = "GESTURE";
  doc["id"] = 140137;
  doc["config"] = 64;
  doc["active"] = true;

  serializeJson(doc, output);

  mqtt.publish("/sensors", output);
}

void sendDataToServer(int index)

{
  long prob = 0;
  StaticJsonDocument<1024> doc;

  doc["type"] = "GESTURE";
  doc["face"] = index;

  switch (index)
  {
  case 0:
    doc["value"] = 0.1;
    doc["color"] = "yellow";
    break;
  case 1:
     doc["value"] = 0.2;
     doc["color"] = "blue";
    break;
  case 2:
     doc["value"] = 0.3;
     doc["color"] = "white";
    break;
  case 3:
     doc["value"] = 0.5;
     doc["color"] = "green";
    break;
  case 4:
     doc["value"] = 0.8;
     doc["color"] = "red";
    break;
  case 5:
     doc["value"] = 1.3;
     doc["color"] = "purple";
    break;
  default:
    doc["value"] = 9;
    doc["color"] = "black";
    break;
  }

  delay(100);

  serializeJson(doc, output);

  delay(100);

  mqtt.publish("/system", output);
}

void resetSystem()
{
  currentIndex = 0;
  http.begin("https://emotional-collector-6xbr2pwt3a-as.a.run.app/healthZ");

  int httpCode = http.GET();
  if(httpCode > 0)
  {
    String payload = http.getString();
    Serial.println(httpCode);
    Serial.println(payload);
  }
  else
  {
    Serial.println("Error on HTTP request");
  }

  http.end();

  delay(1000);
}
