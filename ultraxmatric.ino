// MADE BY VINICIUS LOPES
#include <Ultrasonic.h>
#include "LedControl.h"
#include "binary.h"
Ultrasonic sensor (6,5);// PIN 6 = TRIG // PIN 5 = ECHO
LedControl lc = LedControl(8,10,9,1);// DIN = 8  // CS = 9 // CLK = 10

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
B00111100};

void setup() {
  lc.shutdown(0,false);
  lc.setIntensity(0,8);
  lc.clearDisplay(0);  
}

void desenhaFaces(){


}

void loop(){
  
  int dist = sensor.read();
  if(dist<30){
      lc.setRow(0,0,ff[0]);
  lc.setRow(0,1,ff[1]);
  lc.setRow(0,2,ff[2]);
  lc.setRow(0,3,ff[3]);
  lc.setRow(0,4,ff[4]);
  lc.setRow(0,5,ff[5]);
  lc.setRow(0,6,ff[6]);
  lc.setRow(0,7,ff[7]);

  }else{
      lc.setRow(0,0,ft[0]);
  lc.setRow(0,1,ft[1]);
  lc.setRow(0,2,ft[2]);
  lc.setRow(0,3,ft[3]);
  lc.setRow(0,4,ft[4]);
  lc.setRow(0,5,ft[5]);
  lc.setRow(0,6,ft[6]);
  lc.setRow(0,7,ft[7]);

  }delay(100);

  
  
}
