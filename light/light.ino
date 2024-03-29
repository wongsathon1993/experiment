#include <WiFi.h>
#include <ArduinoJson.h>
#include <binary.h>
#include <PubSubClient.h>
#include <FastLED.h>
#include <HTTPClient.h>

#define LED_PIN 5
#define NUM_LEDS 24
#define BRIGHTNESS 255
#define LED_TYPE WS2811
#define COLOR_ORDER GRB

#define WIFI_STA_NAME "True_IoT_Pocket_WiFi_P1_39955" //change to your own ssid
#define WIFI_STA_PASS "39639955"                      //change to your own password

#define MQTT_SERVER "m16.cloudmqtt.com"
#define MQTT_PORT 16319
#define MQTT_USER_ID "LIGHT01"
#define MQTT_USERNAME "ggaomyqh"
#define MQTT_PASSWORD "3wjA27NFU3ET"

#define UPDATES_PER_SECOND 100

CRGB leds[NUM_LEDS];

unsigned long delaytime = 1000;

WiFiClient client;
PubSubClient mqtt(client);

HTTPClient http;

char output[1024];

String hwid = 5027;

void callback(char *topic, byte *payload, unsigned int length)
{

    DynamicJsonDocument incoming(1024);
    Serial.println(topic);

    payload[length] = '\0';
    String topic_str = topic;

    deserializeJson(incoming, (char *)payload);
    JsonObject obj = incoming.as<JsonObject>();
    String action = obj["action"];
    String triggerDevice = obj["to"];

    JsonArray array = incoming["list"].as<JsonArray>();

    Serial.println(action);
    delay(1000);
    digitalWrite(LED_BUILTIN, (action == "ON") ? HIGH : LOW);
    delay(1000);
    if (action == "ON" && triggerDevice == hwid)
    {

        FastLED.clear();

        for (int index = 0; index < NUM_LEDS; index++)
        {
            int number = array[index];
            switch (number)
            {
            case 0 /* constant-expression */:
                leds[index] = CRGB::Yellow;
                break;
            case 1 /* constant-expression */:
                leds[index] = CRGB::Blue;
                break;
            case 2 /* constant-expression */:
                leds[index] = CRGB::White;
                break;
            case 3 /* constant-expression */:
                leds[index] = CRGB::Green;
                break;
            case 4 /* constant-expression */:
                leds[index] = CRGB::Red;
                break;
            case 5 /* constant-expression */:
                leds[index] = CRGB::Purple;
                break;
            default:
                leds[index] = CRGB::Black;
                break;
            }
        }

        FastLED.show();
        FastLED.delay(1000 / UPDATES_PER_SECOND);
    }
    else
    {
        FastLED.clear();
    }
}

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

    int currentLED = 0;

    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
        digitalWrite(LED_BUILTIN, !digitalRead(LED_BUILTIN));
        runningLEDs(currentLED) if (currentLED < NUM_LEDS)
        {
            currentLED++;
        }
        else
        {
            currentLED = 0;
        }
    }

    digitalWrite(LED_BUILTIN, HIGH);
    Serial.println("");
    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());

    mqtt.setServer(MQTT_SERVER, MQTT_PORT);
    mqtt.setCallback(callback);
    delay(3000); // power-up safety delay
    FastLED.addLeds<LED_TYPE, LED_PIN, COLOR_ORDER>(leds, NUM_LEDS).setCorrection(TypicalLEDStrip);
    FastLED.setBrightness(BRIGHTNESS);
    checkLEDs();
}

void loop()
{
    if (mqtt.connected() == false)
    {
        Serial.print("MQTT connection... ");
        if (mqtt.connect(MQTT_USER_ID, MQTT_USERNAME, MQTT_PASSWORD))
        {
            Serial.println("connected");
            mqtt.subscribe("/controls");
            sendSensorData();
            resetSystem();
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
    }
}

void sendSensorData()
{
    StaticJsonDocument<1024> doc;

    doc["sensor"] = "LIGHT";
    doc["id"] = hwid;
    doc["config"] = 24;
    doc["active"] = true;

    serializeJson(doc, output);

    mqtt.publish("/sensors", output);
}

void resetSystem()
{
    http.begin("https://emotional-collector-6xbr2pwt3a-as.a.run.app/lightRefresh");

    int httpCode = http.GET();
    if (httpCode > 0)
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

void checkLEDs()
{
    for (int index = 0; index < NUM_LEDS; index += 3)
    {
        leds[index] = CRGB::White;
    }

    FastLED.show();
    FastLED.delay(1000 / UPDATES_PER_SECOND);
    delay(5000);
    FastLED.clear();
}

void runningLEDs(int index)
{
    if (index != 0)
    {
        leds[index - 1] = CRGB::Black;
    }
    leds[index] = CRGB::White;
    FastLED.show();
    FastLED.delay(1000 / UPDATES_PER_SECOND);
    FastLED.clear();
}