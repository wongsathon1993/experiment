// MADE BY VINICIUS LOPES
#include <EEPROM.h>
#include <Ultrasonic.h>
#include "LedControl.h"
#include "binary.h"

Ultrasonic ultraleft(4,5);   // (Trig PIN,Echo PIN)
Ultrasonic ultraright(2,3);  // (Trig PIN,Echo PIN)

LedControl lc = LedControl(8,10,9,1);// DIN = 8  // CS = 9 // CLK = 10
int addr1 = 0;
int addr2 = 5;
byte value1 = 1;
byte value2 = 2;

unsigned long delaytime=1000;
// PIN 6 = TRIG // PIN 5 = ECHO
// DIN = 8  // CS = 9 // CLK = 10

byte ff[8]= {
  
B00111100,
B01000010,
B10010101,
B10100001,
B10100001,
B10010101,
B01000010,
B00111100
};

byte ft[8]= {
B00111100,
B01000010,
B10100101,
B10010001,
B10010001,
B10100101,
B01000010,
B00111100,
};

char *myStrings[] = {"ff[8]", "ft[8]"};

int currentIndex = 0;

void setup() {
  Serial.begin(9600);
  lc.shutdown(0,false);
  lc.setIntensity(0,8);
  lc.clearDisplay(0);  
  EEPROM.write(addr1, 0);
  EEPROM.write(addr2, 0);
  }

void desenhaFaces(){


}

void loop(){
  value1 = EEPROM.read(addr1);
  value2 = EEPROM.read(addr2);

  int dist = ultraright.read();
  int dist2 = ultraleft.read();
  
 if ((dist <20)&& (value2 == 2)){
    goleft(currentIndex);
  }
  if ((dist <20)&& (value2 != 2)){
    EEPROM.write(addr1, 1);
    delay(10);
  }
  if ((dist2 <20)&& (value1 == 1)){
    goright(currentIndex);
  }
  if ((dist2 <20)&& (value1 != 1)){
    EEPROM.write(addr2, 2);
    delay(10);
  }
  drawFace(currentIndex);
}

void goleft(int currnetIndex){
    if(currnetIndex != 0) {
      currnetIndex -= 1;
      Serial.print(myStrings[currnetIndex]);
    } else {
      Serial.print(myStrings[currnetIndex]);
    }
}
    void goright(int currnetIndex) {
     if(currnetIndex != 0) {
      currnetIndex += 1;
      Serial.print(myStrings[currnetIndex]);
    }
   }

   void drawFace(int index){
    lc.setRow(0,0,myStrings[index][0]);
    lc.setRow(0,1,myStrings[index][1]);
    lc.setRow(0,2,myStrings[index][2]);
    lc.setRow(0,3,myStrings[index][3]);
    lc.setRow(0,4,myStrings[index][4]);
    lc.setRow(0,5,myStrings[index][5]);
    lc.setRow(0,6,myStrings[index][6]);
    lc.setRow(0,7,myStrings[index][7]);
    delay(300);
    EEPROM.write(addr1, 0);
    delay(10);
    EEPROM.write(addr2, 0);
    delay(10);
   }
