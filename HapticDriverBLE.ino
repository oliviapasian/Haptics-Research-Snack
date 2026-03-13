# --------------------------------------------------------
# HapticDriverBLE.ino
#(Olivia Pasian, last updated 2026-03-12)

#   This sketch receives short commands over BLE from a p5.js GUI and plays
#   predefined haptic patterns using the Adafruit DRV2605 haptic
#   motor driver.
#
# Notes:
# - Ensure BLE UUIDs in the p5.js `sketch.js` match the values in this file.
# - Web Bluetooth (p5.ble) typically sends bytes or strings depending on
#   how it's written; the microcontroller code reads the first byte and treats it as
#   a pattern id (0..255). If you send ASCII characters (e.g. '1'), the
#   value will be the ASCII code (49) — adjust the host or microcontroller code as needed.
#
# --------------------------------------------------------

// Required libraries
#include <ArduinoBLE.h>
#include <Wire.h>
#include "Adafruit_DRV2605.h"

Adafruit_DRV2605 drv;

// BLE service + characteristic used to receive pattern commands
// These UUIDs must match the values used by the p5.js GUI.
BLEService hapticService("19b10000-e8f2-537e-4f6c-d104768a1214");
// Characteristic configured for writes from the central (browser)
// The third parameter is the max length in bytes.
BLECharacteristic hapticCharacteristic("19b10001-e8f2-537e-4f6c-d104768a1214", BLEWrite, 10);

void setup() {
  Serial.begin(9600);
  if (Serial) {
    Serial.println("USB connected");
  }
  Serial.println("KiT Haptic Prototype v1");

  if (!drv.begin()) {  //Note that if you use the STEMMA QT version of the driver this changes -- see Adafruit docs on STEMMA for details 
    Serial.println("Could not find DRV2605");
    while (1) delay(10);
  }

  // Initialize the DRV2605 haptic driver and select an internal waveform library. The DRV2605 supports a set of predefined waveforms that can be played by index
  drv.selectLibrary(1); 

  // Use internal trigger mode 

  if (!BLE.begin()) {
    Serial.println("BLE fail");
    while (1);
  }

  BLE.setLocalName("MyDeviceName"); // RENAME to your device name!!! I guess not super essential but helps with debugging and connecting from the p5.js GUI
  BLE.setAdvertisedService(hapticService);
  hapticService.addCharacteristic(hapticCharacteristic);
  BLE.addService(hapticService);
  BLE.advertise();

  Serial.println("BLE ready");
}

void playHapticPattern(int pattern) {

  // Prepare the sequence buffer for a new pattern.
  // The DRV2605 supports waveform sequence slots (0..n). Each slot holds an index into the internal waveform library (0..123). A value of 0 is treated as "no waveform / end-of-sequence" so we clear multiple slots to ensure no leftover waveforms remain from a previous play.
  for (int i = 0; i < 8; i++) {
    drv.setWaveform(i, 0);
  }

  // Note: See the DRV2605 datasheet / Adafruit docs for the mapping of index # -> effect (e., 1 = Strong Click, 53 = etc.).

  switch (pattern) {
  
   // Multi-step preset sequences. Each setWaveform(index, waveform_id) places a waveform into a sequential slot. The sequence is executed from slot 0 upwards until a slot contains 0 (end marker).

    case 1:
      drv.setWaveform(0, 53); //(first value is index, second value is `waveform_id` from the DRV2605 library)
      drv.setWaveform(1, 19);
      drv.setWaveform(2, 53);
      drv.setWaveform(3, 19);
      drv.setWaveform(4, 55);
      drv.setWaveform(5, 19);
      drv.setWaveform(6, 19);
      drv.setWaveform(7, 18);
      drv.setWaveform(8, 69);
      drv.setWaveform(9, 18);
      drv.setWaveform(10, 55);
      drv.setWaveform(11, 0); // explicit end marker (0 == stop)
      Serial.println("P1: heart/close");
      break;


    case 2:  // hug/squeeze (longer multi-wave sequence)
      drv.setWaveform(0, 84);
      drv.setWaveform(1, 13);
      drv.setWaveform(2, 119);
      drv.setWaveform(3, 119);
      drv.setWaveform(4, 119);
      drv.setWaveform(5, 119);
      drv.setWaveform(6, 120);
      drv.setWaveform(7, 120);
      drv.setWaveform(8, 121);
      drv.setWaveform(9, 122);
      drv.setWaveform(10, 0); // end
      Serial.println("P2: hug/squeeze");
      break;

    case 3:  // tap/attention (short, two-step)
      drv.setWaveform(0, 1);
      drv.setWaveform(1, 59);
      drv.setWaveform(2, 68);
      drv.setWaveform(3, 0); // end
      Serial.println("P3: tap/attention");
      break;

    // Single presets (simple one-shot effects from the driver library, see datasheet linked in README for details on each effect)
    case 4:  
      drv.setWaveform(0, 1);
      drv.setWaveform(1, 0); // end
      Serial.println("S1: strong click");
      break;

    case 5: 
      drv.setWaveform(0, 37);
      drv.setWaveform(1, 0); // end
      Serial.println("S2: LongDoubleStrong");
      break;

    case 6:  
      drv.setWaveform(0, 47);
      drv.setWaveform(1, 0); // end
      Serial.println("S3: Buzz1");
      break;

    case 7:  
      drv.setWaveform(0, 53);
      drv.setWaveform(1, 0); // end
      Serial.println("S4: Pulsing");
      break;

    case 8:  
      drv.setWaveform(0, 7);
      drv.setWaveform(1, 0); // end
      Serial.println("S5: Soft Bump");
      break;

    case 9:  
      drv.setWaveform(0, 119);
      drv.setWaveform(1, 0); // end
      Serial.println("S6: Smooth Hum");
      break;

   case 10:  
      drv.setWaveform(0, 15);
      drv.setWaveform(1, 0); // end
      Serial.println("S7: Alert / long buzz");
      break;

    case 11:  
      drv.setWaveform(0, 84);
      drv.setWaveform(1, 0); // end
      Serial.println("S8: Ramp Up");
      break;

    case 12:  
      drv.setWaveform(0, 76);
      drv.setWaveform(1, 0); // end
      Serial.println("S9: Ramp Down");
      break;

    default:
        // If an unknown pattern id is received, log and return without triggering
        Serial.print("Unknown pattern id: ");
        Serial.println(pattern);
      return;

  }

  drv.go();
  delay(100); // A short delay after calling go() avoids re-triggering instantly if the host sends commands rapidly. Increase the delay if patterns are being interrupted or if your hardware requires longer completion time.

}

void loop() {
  BLEDevice central = BLE.central();

  if (central) {
    Serial.print("Connected: ");
    Serial.println(central.address());

    while (central.connected()) {
      if (hapticCharacteristic.written()) {
        int len = hapticCharacteristic.valueLength();
        const uint8_t* val = hapticCharacteristic.value();

        if (len > 0) {
          // Read the first byte sent by the central. If the host sends a string like "1" (ASCII '1'), `val[0]` will be 49. If you want to support ASCII digits, convert like: `pattern = val[0] - '0';`
          int pattern = val[0];
          Serial.print("received pattern no.: ");
          Serial.println(pattern);

          // Play the corresponding pattern. Ensure the GUI and microcontroller code agree on the encoding (raw byte vs ASCII digit).
          playHapticPattern(pattern);
        }
      }
    }

    Serial.println("Disconnected");
  }
}
