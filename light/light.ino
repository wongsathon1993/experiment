#include <WiFi.h>
#include <ArduinoJson.h>
#include <binary.h>
#include <PubSubClient.h>
#include <SPI.h>
#include <Adafruit_GFX.h>
#include <Max72xxPanel.h>

#define WIFI_STA_NAME "xxxxxxxxxx"
#define WIFI_STA_PASS "xxxxxxxxxx"

#define MQTT_SERVER "m16.cloudmqtt.com"
#define MQTT_PORT 16319
#define MQTT_USERNAME "ggaomyqh"
#define MQTT_PASSWORD "3wjA27NFU3ET"

unsigned long delaytime = 1000;

WiFiClient client;
PubSubClient mqtt(client);

void callback(char *topic, byte *payload, unsigned int length)
{
    payload[length] = '\0';
    String topic_str = topic, payload_str = (char *)payload;
    Serial.println("[" + topic_str + "]: " + payload_str);

    digitalWrite(LED_BUILTIN, (payload_str == "ON") ? HIGH : LOW);
}

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
    mqtt.setCallback(callback);
}

void loop()
{
    if (mqtt.connected() == false)
    {
        Serial.print("MQTT connection... ");
        if (mqtt.connect(MQTT_USERNAME, MQTT_USERNAME, MQTT_PASSWORD))
        {
            Serial.println("connected");
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
        Serial.print("hi");
        delay(1000);
    }
}