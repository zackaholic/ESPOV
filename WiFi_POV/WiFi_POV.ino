#include <Adafruit_DotStar.h>
#include <SPI.h> 
#include <ESP8266WiFi.h>
#include <DNSServer.h>
#include <ESP8266WebServer.h>
#include "FS.h"
#include <stdlib.h>
#include <EEPROM.h>

#define NUMPIXELS 36 // Number of LEDs in strip
#define DEBUG 0
//pixel dimensions of display
int height = 36;
int imgWidth;
uint8_t image_received = 0;
Adafruit_DotStar strip = Adafruit_DotStar(NUMPIXELS, DOTSTAR_BGR);
// Here's how to control the LEDs from any two pins:
//#define DATAPIN    4
//#define CLOCKPIN   5
//Adafruit_DotStar strip = Adafruit_DotStar(NUMPIXELS, DATAPIN, CLOCKPIN, DOTSTAR_BRG);

extern "C" {
  #include "user_interface.h"
}

//hardware spi:
//Adafruit_DotStar strip = Adafruit_DotStar(height, DOTSTAR_BGR);

const byte DNS_PORT = 53;
IPAddress apIP(192, 168, 1, 1);
DNSServer dnsServer;
ESP8266WebServer server(80);

uint8_t pixelArray[1080];

void handleRoot() {
  File root = SPIFFS.open("/uploadTool.html", "r");
  if (!root) {
    Serial.println("Failed to open file");
    return;
  }
  String html = root.readString();
  root.close();

  server.send(200, "text/html", html);
}

void handleGetImageFiles() {
  String fileList = "";
  Dir dir = SPIFFS.openDir("/img");
  while (dir.next()) {
    fileList += dir.fileName();
    fileList += "\n";
  }
  server.send(200, "text/plain", fileList);
}

void handleGetImage() {
  String imagePath = server.arg("image");
  String imageString = "";
  for (int i = 0; i < 1080; i++) {
    imageString += pixelArray[i];
    imageString += ',';
  }
  loadImage(imagePath);
  server.send(200, "text/plain", imageString);
}

void handleUpload() {
  //freezes if filename is too long, freezes if too many files uploaded???
  String path = server.arg("name");
  Serial.print(path);
  Serial.print(" len: ");
  Serial.println(path.length());
  String recImage = server.arg("image");
  File img = SPIFFS.open(path, "w+");
  
  saveAsLastImage(path);
  
  img.print(recImage);
  img.seek(0, SeekSet);
  imgWidth = img.parseInt();
  
  for (int i = 0; i < imgWidth * NUMPIXELS; i++) {
    pixelArray[i] = (uint8_t)img.parseInt();
  }
  img.close();
  
  // if (!image_received) {
  //   image_received = 1;
//    strip = Adafruit_DotStar(height, DOTSTAR_BGR);
//    strip.begin(); // Initialize pins for output
//    strip.show();  // Turn all LEDs off ASAP    
  // }
  //have to send a response so client doesn't hang
  server.send(200, "text/plain", "ok");
}

void handleNotFound(){
  server.send(404, "text/plain", "Go to <a href= \"http://www.pov.com\">www.pov.com</a>");
}

void pushPixelColumn(int col, int len) {
//column(zero referenced), and vertical length of strip
  uint32_t color;
  int i;
  int startP = col * len + len - 1;
  uint32_t red;
  uint32_t green;
  uint32_t blue;
  for (i = 0; i < len; i++) {     
    red = pixelArray[startP - i] &   0b11100000;
    green = pixelArray[startP - i] & 0b00011100;
    blue = pixelArray[startP - i] &  0b00000011;
    color = (red << 16)|(green << 11)|(blue << 6);
    strip.setPixelColor(i, color);
  }
  strip.show();
}

void servicePOV(int hertz, int width){
  static int index = 0;
  pushPixelColumn(index, height);
  index++;
  if (index >= width) {
    index = 0;
  }
}

uint8_t loadImage(String path) {
  File img = SPIFFS.open(path, "r");
  if (!img) {
    Serial.print(path);
    Serial.println(" does not appear to exist");
    return 0;
  }
  imgWidth = img.parseInt();
  for (int i = 0; i < imgWidth * NUMPIXELS; i++) {
    pixelArray[i] = (uint8_t)img.parseInt();
  }
  img.close();
  return 1;
}

void saveAsLastImage(String path) {
  for (int i = 0; i < 80; i++) {
    if (i < path.length()){
      EEPROM.write(i, path.charAt(i));
    } else {
      EEPROM.write(i, ' ');
    }
  }
  EEPROM.commit();
}

String getLastImage() {
  char fileName[80];
  for (int i = 0; i < 80; i++) {
    fileName[i] = EEPROM.read(i);
  }
  String path = String(fileName);
  path.trim();
  return path;
}

void setup(void){
Serial.begin(115200);
EEPROM.begin(80);

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
  server.on("/getImages", handleGetImageFiles);  
  server.on("/getImage", handleGetImage);
  server.onNotFound(handleNotFound);

  server.begin();
  Serial.println("HTTP server started");

  
  Serial.println("Beginning SPIFFS");
  if (!SPIFFS.begin()) {
    Serial.println("Failed to mount file system");
  }

///////////////////dotstar setup
  strip.begin(); // Initialize pins for output
  strip.show();  // Turn all LEDs off ASAP

  loadImage(getLastImage());
}

void loop(void){
  dnsServer.processNextRequest();
  server.handleClient();
//  delay(10); 

  
    servicePOV(15, imgWidth);
    delayMicroseconds(2500); //2.5ms = 400hz

}
