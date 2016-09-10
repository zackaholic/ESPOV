#include <Adafruit_DotStar.h>
#include <SPI.h> 
#include <ESP8266WiFi.h>
#include <DNSServer.h>
#include <ESP8266WebServer.h>
#include "FS.h"

#define NUMPIXELS 20 // Number of LEDs in strip

// Here's how to control the LEDs from any two pins:
//#define DATAPIN    4
//#define CLOCKPIN   5
//Adafruit_DotStar strip = Adafruit_DotStar(NUMPIXELS, DATAPIN, CLOCKPIN, DOTSTAR_BRG);

//hardware spi:
Adafruit_DotStar strip = Adafruit_DotStar(NUMPIXELS, DOTSTAR_BGR);

const byte DNS_PORT = 53;
IPAddress apIP(192, 168, 1, 1);
DNSServer dnsServer;
ESP8266WebServer server(80);

uint8_t pixelArray[300];

void handleRoot() {
  File root = SPIFFS.open("/uploaderTestRGB.html", "r");
  if (!root) {
    Serial.println("Failed to open file");
    return;
  }
  String html = root.readString();
  root.close();

  server.send(200, "text/html", html);
}

void handleUpload() {
//TODO: test sending each pixel as a separate argument. Each arg is a
//struct with key and value String objects. More memory maybe but more
//intuitive parsing? Any other benefits?

  String message = server.arg(0);

  String numString;
  uint8_t index = 0;
  
  for (int i = 0;  i < 300; i++) {
    if (message.charAt(i) != ',') {
      numString += message.charAt(i);    
    } else {
      pixelArray[index] = (uint8_t)(numString.toInt());
//      Serial.println(pixelArray[index]);
      numString = "";
      index++;
    }
    //special case: last element
    if (i == message.length() - 1) {
      pixelArray[index] = (uint8_t)(numString.toInt());
    }
  }
  //have to send a response so client doesn't hang
  server.send(200, "text/plain", "ok");
}

void handleNotFound(){
  server.send(404, "text/plain", "not found");
}

void pushPixelColumn(int col, int len) {
//column(zero referenced), and vertical length of strip
  uint32_t color;
  int i;
  int startP = col * len;
  uint32_t red;
  uint32_t green;
  uint32_t blue;
  for (i = 0; i < len; i++) {           
    red = pixelArray[startP + i] & 0b11100000;
    green = pixelArray[startP + i] & 0b00011100;
    blue = pixelArray[startP + i] & 0b00000011;
    color = (red << 16)|(green << 11)|(blue << 6);
    strip.setPixelColor(i, color);
  }
  strip.show();
}

void servicePOV(int hertz, int width){
  static int index = 0;
//problem's in this function call.
  pushPixelColumn(index, NUMPIXELS);
  index++;
  if (index == width) {
    index = 0;
  }
}

void setup(void){
Serial.begin(115200);

///////////////////dotstar setup
strip.begin(); // Initialize pins for output
strip.show();  // Turn all LEDs off ASAP

//////////////////////wifi setup
  WiFi.mode(WIFI_AP);
  WiFi.softAPConfig(apIP, apIP, IPAddress(255, 255, 255, 0));
  WiFi.softAP("POV WIFI");

  // modify TTL associated  with the domain name (in seconds)
  // default is 60 seconds
  dnsServer.setTTL(300);
  // set which return code will be used for all other domains (e.g. sending
  // ServerFailure instead of NonExistentDomain will reduce number of queries
  // sent by clients)
  // default is DNSReplyCode::NonExistentDomain
  dnsServer.setErrorReplyCode(DNSReplyCode::ServerFailure);

  // start DNS server for a specific domain name
  dnsServer.start(DNS_PORT, "www.pov.com", apIP);
  
  server.on("/", handleRoot);
  server.on("/upload", handleUpload);
  server.onNotFound(handleNotFound);

  server.begin();
  Serial.println("HTTP server started");

  
  Serial.println("Beginning SPIFFS");
  if (!SPIFFS.begin()) {
    Serial.println("Failed to mount file system");
  }
}

void loop(void){
  dnsServer.processNextRequest();
  server.handleClient();
//yielding to firmware to service wifi routines seems to help reset problem
//try implementing a state machine to switch b/t server and POV modes?
  delay(10); 
  
  servicePOV(10, 5);
  delay(250);                        


}
