#ifndef Faces_h
#define Faces_h

#include <avr/pgmspace.h>

#if (ARDUINO >= 100)
#include <Arduino.h>
#else
#include <WProgram.h>
#endif

class Faces
{
  public:
    uint8_t byte faceZero();
  private:
    byte fZero;
};

#endif	//Faces.h