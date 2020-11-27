#include "Arduino.h"
#include "Faces.h"


unit8_t byte Faces::faceZero()
{
  return fZero[8] = {
    B00111100,
    B01000010,
    B10000101,
    B10000001,
    B10000001,
    B10000101,
    B01000010,
    B00111100,
  };
}