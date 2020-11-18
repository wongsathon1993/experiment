// MADE BY VINICIUS LOPES
#include <Ultrasonic.h>
#include <LedControl.h>
#include <EEPROM.h>
#include <ArduinoJson.h>
#include <binary.h>
Ultrasonic ultrasonicLeft(6, 5);
Ultrasonic ultrasonicRight(3, 4);        // PIN 6 = TRIG // PIN 5 = ECHO
LedControl lc = LedControl(8, 10, 9, 1); // DIN = 8  // CS = 9 // CLK = 10

int addr1 = 0;
int addr2 = 5;
byte value1 = 1;
byte value2 = 2;

unsigned long delaytime = 1000;


byte fZero[8] = {
    B00000000,
    B00000000,
    B00000000,
    B00000000,
    B00000000,
    B00000000,
    B00000000,
    B00000000,
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

int currentIndex = 0;

void setup()
{
  lc.shutdown(0, false);
  lc.setIntensity(0, 8);
  lc.clearDisplay(0);
  displayFace(fOne);
}

void loop()
{
  value1 = EEPROM.read(addr1);
  value2 = EEPROM.read(addr2);

  int dist = ultrasonicLeft.read();
  int dist2 = ultrasonicRight.read();

  if ((dist < 20) && (value2 == 2))
  {
    currentIndex = goLeft(currentIndex);
    selectFace(currentIndex);
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
  }
  if ((dist2 < 20) && (value1 != 1))
  {
    EEPROM.write(addr2, 2);
    delay(10);
  }
}

int goLeft(int idx)
{
  Serial.print(idx);
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
      displayFace(ff);
      break;
    case 1:
      displayFace(ft);
      break;
    default:
      displayFace(fZero);
      break;
    }
    sendDataToServer();
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
  Serial.print(idx);
  if(idx == 7) { //right most index
    return idx;
  } else {
    idx += 1;
  }
  return idx;
}

void sendDataToServer() {
  StaticJsonDocument<500> doc;

  // Create the "analog" array
  JsonArray analogValues = doc.createNestedArray("analog");
  for (int pin = 0; pin < 6; pin++) {
    // Read the analog input
    int value = analogRead(pin);

    // Add the value at the end of the array
    analogValues.add(value);
  }

  // Create the "digital" array
  JsonArray digitalValues = doc.createNestedArray("digital");
  for (int pin = 0; pin < 14; pin++) {
    // Read the digital input
    int value = digitalRead(pin);

    // Add the value at the end of the array
    digitalValues.add(value);
  }
}