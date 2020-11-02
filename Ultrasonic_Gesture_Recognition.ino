#include <EEPROM.h>
#define trigPin1 2
#define echoPin1 3
#define trigPin2 4
#define echoPin2 5   
int addr1 = 0;
int addr2 = 5;
byte value1 = 1;
byte value2 = 2;

void setup() {
  Serial.begin(9600);
  pinMode(trigPin1, OUTPUT);
  pinMode(echoPin1, INPUT);
  pinMode(trigPin2, OUTPUT);
  pinMode(echoPin2, INPUT);
  EEPROM.write(addr1, 0);
  EEPROM.write(addr2, 0);
}

void loop(){
  value1 = EEPROM.read(addr1);
  value2 = EEPROM.read(addr2);
  long duration1, distance1;
  digitalWrite(trigPin1, LOW); 
  digitalWrite(trigPin1, HIGH);
  digitalWrite(trigPin1, LOW);
  duration1 = pulseIn(echoPin1, HIGH);
  distance1 = (duration1/2) / 29.1;
  long duration2, distance2;
  digitalWrite(trigPin2, LOW); 
  digitalWrite(trigPin2, HIGH);
  digitalWrite(trigPin2, LOW);
  duration2 = pulseIn(echoPin2, HIGH);
  distance2 = (duration2/2) / 29.1;
  if ((distance1 <20)&& (value2 == 2)){
    
  }
  if ((distance1 <20)&& (value2 != 2)){
    EEPROM.write(addr1, 1);
    delay(10);
  }
  if ((distance2 <20)&& (value1 == 1)){
    
  }
  if ((distance2 <20)&& (value1 != 1)){
    EEPROM.write(addr2, 2);
    delay(10);
  }
}
