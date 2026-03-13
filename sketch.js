/*
p5.js GUI for BLE microcontroller + Adafruit DRV2605L Haptic Motor Controller 
  - This sketch implements a simple GUI to send numeric 'pattern' commands
    over BLE to an Adafruit haptic motor driver controlled by a BLE-capable
    microcontroller (ex. Arduino Nano 33 BLE / Nano BLE Sense).
  - The microcontroller BLE service and characteristic must
    match SERVICE_UUID and CHARACTERISTIC_UUID below
*/
let myBLE;
const SERVICE_UUID = "19b10000-e8f2-537e-4f6c-d104768a1214";
const CHARACTERISTIC_UUID = "19b10001-e8f2-537e-4f6c-d104768a1214";

let fullscreenButton;
let hapticCharacteristic;


function setup() {
  // createCanvas sets up the p5 drawing surface; the rest builds the GUI.
  createCanvas(1200, 750);
  background('#rgb(250,250,231)');
  myBLE = new p5ble();
  
  stroke("#497BD5");
  line(400, 120, 400, 670);
  
  fullscreenButton = createButton(''); // the tiny secret blue square in the top left corner toggles fullscreen mode
  fullscreenButton.size(20,20);
  fullscreenButton.position(150, 20); 
  fullscreenButton.style('background', 'cornflowerblue');
  fullscreenButton.style('border', 'none');
  fullscreenButton.mousePressed(toggleFullscreen); 
  
  let connectButton = createButton('Click Here to Connect / Disconnect');
  connectButton.position(180, 20);
  connectButton.size(870, 20);
  connectButton.style('font-size', '11px');
  connectButton.style('font-family', 'Monaco');
  connectButton.style('background', 'cornflowerblue');
    connectButton.style('color', 'lightyellow');
  connectButton.style('border', 'none');
  connectButton.mousePressed(connectToHaptic); // starts BLE pairing flow

  
  
  let pattern1 = createButton('Heart / Closeness');
  pattern1.position(150, 120);
  pattern1.size(150, 150);
  pattern1.style('font-size', '20px');
  pattern1.style('font-family', 'Monaco');
  pattern1.style('background', '#59BE8F');
  pattern1.style('color', '#FCFFC1');
  pattern1.style('border', 'none');
  pattern1.mousePressed(() => sendPattern(1)); // Heart / Closeness

  let pattern2 = createButton('Hug / Squeeze');
  pattern2.position(150, 320);
  pattern2.size(150, 150);
  pattern2.style('font-size', '20px');
  pattern2.style('font-family', 'Monaco');
  pattern2.style('background', '#59BE8F');
  pattern2.style('color', '#FCFFC1');
  pattern2.style('border', 'none');
  pattern2.mousePressed(() => sendPattern(2)); // Hug / Squeeze

  let pattern3 = createButton('Tap / Attention');
  pattern3.position(150, 520);
  pattern3.size(150, 150);
  pattern3.style('font-size', '20px');
  pattern3.style('font-family', 'Monaco');
  pattern3.style('color', '#FCFFC1');
  pattern3.style('background', '#59BE8F');
  pattern3.style('border', 'none');
  pattern3.mousePressed(() => sendPattern(3)); // Tap / Attention
  
  
  
  
  let strongClick = createButton('Strong Click');
  strongClick.position(500, 120);
  strongClick.size(150, 150);
  strongClick.style('font-size', '20px');
  strongClick.style('font-family', 'Monaco');
  strongClick.style('background', '#ECD9FB');
  strongClick.style('color', '#497BD5');
  strongClick.style('border', 'none');
  strongClick.mousePressed(() => sendPattern(4)); // Strong Click

  
  let longDouble = createButton(' Double Click');
  longDouble.position(500, 320);
  longDouble.size(150, 150);
  longDouble.style('font-size', '20px');
  longDouble.style('font-family', 'Monaco');
  longDouble.style('background', '#ECD9FB');
    longDouble.style('color', '#497BD5');
  longDouble.style('border', 'none');
  longDouble.mousePressed(() => sendPattern(5)); // Double Click
  
  let buzz1 = createButton('Buzz');
  buzz1.position(500, 520);
  buzz1.size(150, 150);
  buzz1.style('font-size', '20px');
  buzz1.style('font-family', 'Monaco');
  buzz1.style('background', '#ECD9FB');
    buzz1.style('color', '#497BD5');
  buzz1.style('border', 'none');
  buzz1.mousePressed(() => sendPattern(6)); // Buzz
  
  
  
  let longBuzz = createButton('Long Buzz');
  longBuzz.position(700, 120);
  longBuzz.size(150, 150);
  longBuzz.style('font-size', '20px');
  longBuzz.style('font-family', 'Monaco');
  longBuzz.style('background', '#ECD9FB');
    longBuzz.style('color', '#497BD5');
  longBuzz.style('border', 'none');
  longBuzz.mousePressed(() => sendPattern(10)); // Long Buzz

  
  let softBump = createButton('Soft Bump');
  softBump.position(700, 320);
  softBump.size(150, 150);
  softBump.style('font-size', '20px');
  softBump.style('font-family', 'Monaco');
  softBump.style('background', '#ECD9FB');
    softBump.style('color', '#497BD5');
  softBump.style('border', 'none');
  softBump.mousePressed(() => sendPattern(8)); // Soft Bump
  
  let smoothHum = createButton('Smooth Hum');
  smoothHum.position(700, 520);
  smoothHum.size(150, 150);
  smoothHum.style('font-size', '20px');
  smoothHum.style('font-family', 'Monaco');
  smoothHum.style('background', '#ECD9FB');
    smoothHum.style('color', '#497BD5');
  smoothHum.style('border', 'none');
  smoothHum.mousePressed(() => sendPattern(9)); // Smooth Hum

  
  let pulsing = createButton('Flutter');
  pulsing.position(900, 120);
  pulsing.size(150, 150);
  pulsing.style('font-size', '20px');
  pulsing.style('font-family', 'Monaco');
  pulsing.style('background', '#ECD9FB');
    pulsing.style('color', '#497BD5');
  pulsing.style('border', 'none');
  pulsing.mousePressed(() => sendPattern(7)); // Flutter
  
  let rampUp = createButton('Ramp Up');
  rampUp.position(900, 320);
  rampUp.size(150, 150);
  rampUp.style('font-size', '20px');
  rampUp.style('font-family', 'Monaco');
  rampUp.style('background', '#ECD9FB');
    rampUp.style('color', '#497BD5');
  rampUp.style('border', 'none');
  rampUp.mousePressed(() => sendPattern(11)); // Ramp Up
  
  let rampDown = createButton('Ramp Down');
  rampDown.position(900, 520);
  rampDown.size(150, 150);
  rampDown.style('font-size', '20px');
  rampDown.style('font-family', 'Monaco');
  rampDown.style('background', '#ECD9FB');
    rampDown.style('color', '#497BD5');
  rampDown.style('border', 'none');
  rampDown.mousePressed(() => sendPattern(12)); // Ramp Down
  
}

function connectToHaptic() {
  // Initiate a BLE connection to the device advertising SERVICE_UUID.
  // The callback 'gotCharacteristics' receives the available characteristics.
  myBLE.connect(SERVICE_UUID, gotCharacteristics);
}

function gotCharacteristics(error, characteristics) {
  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log('Characteristics:', characteristics);
  // Find the characteristic the microcontroller code uses to receive pattern commands.
  hapticCharacteristic = characteristics.find(c => c.uuid === CHARACTERISTIC_UUID);
}

function sendPattern(patternNum) {
  if (hapticCharacteristic) {
    // Sends a short string representing the pattern number.
    // The microcontroller code should parse this and trigger the motor driver.
    myBLE.write(hapticCharacteristic, String(patternNum), "string");
    console.log(`Sent pattern ${patternNum}`);
  } else {
    console.log('Not connected yet');
  }
}

function toggleFullscreen() {
  let fs = fullscreen(); // Get the current fullscreen state
  fullscreen(!fs); // Toggle the fullscreen state
}