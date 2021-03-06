#include <Adafruit_DotStar.h>
#include <SPI.h> 
#include <ESP8266WiFi.h>
#include <DNSServer.h>
#include <ESP8266WebServer.h>
#include "FS.h"
#include <stdlib.h>

#define DEBUG 0

//these need to be set for the specific hardware setup and transmitted to the 
//client app 
uint8_t pixels = 36;  //just for test setup: total pixels in strip for addressing
        //rows is determined by hardware and never changes
const uint8_t rows = 36;
uint8_t cols = 30;
uint8_t *pixelArray;
uint8_t imageLoaded = 0;


Adafruit_DotStar strip = Adafruit_DotStar(pixels, DOTSTAR_BGR);
/*
extern "C" {
  #include "user_interface.h"
}
*/
const byte DNS_PORT = 53;
IPAddress apIP(192, 168, 1, 1);
DNSServer dnsServer;
ESP8266WebServer server(80);

void serveMain() {
  File root = SPIFFS.open("/main.html", "r");
  if (!root) {
    Serial.println("Failed to open main");
    return;
  }
  size_t sent = server.streamFile(root, "text/html");
  root.close();
}

void getSavedFiles() {
//returns list of file names, no data
  String fileList = "";
  Dir dir = SPIFFS.openDir("/img");
  while (dir.next()) {
    fileList += dir.fileName();
    fileList += "\n";
  }
  server.send(200, "text/plain", fileList);
}

void canvasInit() {
  String initString = "rows=";
  initString += rows;
  server.send(200, "text/plain", initString);
}

void deleteFile() {
  String path = server.arg("name");
  SPIFFS.remove(path);
  File img = SPIFFS.open(path, "r");
  if (!img) {
    server.send(200, "text/plain", "Success");
  } else {
    server.send(500, "text/plain", "Error");
  }
}

void getImageData() {
  String imagePath = server.arg("name");
  int imageSize = loadImage(imagePath);

  if (imageSize == 0) {
    server.send(500, "text/plain", "image file not found");
  }
  String imageString = "cols=";
  imageString += imageSize / rows;
  imageString += "&data=";
  
  for (int i = 0; i < imageSize; i++) {
    imageString += pixelArray[i];
    imageString += ',';
  }  
  server.send(200, "text/plain", imageString);
}

void saveFile() {
  String path = server.arg("name");
  path.trim();
  String recImage = server.arg("image");
  String width = server.arg("width");
  cols = width.toInt();
  int arrayLen = cols * rows;

  free(pixelArray);
  pixelArray = (uint8_t *)malloc(arrayLen);

  File img = SPIFFS.open(path, "w+");

  if (!img) {
    Serial.println("Failed to open file for writing");
    return;
  }
  
  String tempString = "";
  char tempChar;
  int index = 0;
  for (int i = 0; i < recImage.length(); i++) {
    tempChar = recImage.charAt(i);
    //add end-of-string check since there's no trailing comma
    if (tempChar == ',' || i == recImage.length() - 1) {
      pixelArray[index++] = tempString.toInt();
      tempString = "";
    } else {
      tempString += tempChar;
    }
  }

  img.write(pixelArray, arrayLen);
  img.close();
  imageLoaded = 1;

  //minimal check to make sure file was saved
  if (SPIFFS.exists(path)) {
//    saveAsLastImage(path);
    server.send(200, "text/plain", "file saved");
  } else {
    server.send(500, "text/plain", "error: file not saved");
  }
  getSavedFiles();
}

void handleNotFound(){
  server.send(404, "text/html", "<h1>404 Not Found</h1>");
}


//uint8_t deleteImage(String path) {
//  //also clear array and stop updating pixels if this was the image
//  //currently loaded into buffer? 
//  SPIFFS.remove(path);
//}

void displaySaved() {
  String path = server.arg("name");
  path.trim();
  if (loadImage(path)) {
    server.send(200, "text/plain", "loading success");  
  } else {
    server.send(500, "text/plain", "file may not exist");
  }
}

uint16_t loadImage(String path) {
  Serial.print("loading ");
  Serial.println(path);
  File img = SPIFFS.open(path, "r");
  if (!img) {
    Serial.print(path);
    Serial.println(" does not exist");
    return 0;
  }
  
  int len = img.size();
  free(pixelArray);
  pixelArray = (uint8_t *)malloc(len);

  for (int i = 0; i < len; i++) {
    pixelArray[i] = img.read();
  }
  img.close();
  
  saveAsLastImage(path);
  
  return len;
}

void saveAsLastImage(String path) {
  File last = SPIFFS.open("/lastImage", "w+");
  last.print(path);
  last.close();
}

String getLastImage() {
  File last = SPIFFS.open("/lastImage", "r");
  String path = last.readString();
  last.close();
  return path;
}

void pushPixelColumn(uint8_t column) {
  uint32_t color;
  int i;
  int startIndex = column;
  uint8_t pixelIndex = rows - 1;
  uint32_t red;
  uint32_t green;
  uint32_t blue;
  for (i = 0; i <= rows; i++) {    
    red = pixelArray[startIndex + i * cols] &   0b11100000;
    green = pixelArray[startIndex + i * cols] & 0b00011100;
    blue = pixelArray[startIndex + i * cols] &  0b00000011;
    color = (red << 16)|(green << 11)|(blue << 6);
    strip.setPixelColor(pixelIndex--, color);
  }
  strip.show();
}


void servicePOV(int hertz){
  static int column = 0;
  pushPixelColumn(column);
  column++;
  if (column >= cols) {
    column = 0;
  }
}


void setup(void){
Serial.begin(115200);
Serial.setDebugOutput(true);

//////////////////////wifi setup
//  WiFi.mode(WIFI_AP);
//  WiFi.softAPConfig(apIP, apIP, IPAddress(255, 255, 255, 0));
//  WiFi.softAP("POV WIFI");
//
//  // modify TTL associated  with the domain name (in seconds)
//  // default is 60 seconds
//  dnsServer.setTTL(300);
//  // set which return code will be used for all other domains (e.g. sending
//  // ServerFailure instead of NonExistentDomain will reduce number of queries
//  // sent by clients)
//  // default is DNSReplyCode::NonExistentDomain
//  dnsServer.setErrorReplyCode(DNSReplyCode::ServerFailure);
//
//  // start DNS server for a specific domain name
//  dnsServer.start(DNS_PORT, "www.pov.com", apIP);
  const char* ssid = "XXXX";
  const char* password = "XXXX";
  WiFi.begin(ssid, password);

  IPAddress ip(192, 168, 42, 81); // where xx is the desired IP Address
  IPAddress gateway(10, 0, 0, 1); // set gateway to match your network
  Serial.print(F("Setting static ip to : "));
  Serial.println(ip);
  IPAddress subnet(255, 255, 255, 0); // set subnet mask to match your network
  WiFi.config(ip, gateway, subnet);

  // Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  server.on("/", serveMain);
  server.on("/canvasInit", canvasInit);
  server.on("/saveFile", saveFile);
  server.on("/getSavedFiles", getSavedFiles);  
  server.on("/getFile", getImageData);
  server.on("/displaySaved", displaySaved);
  server.on("/deleteFile", deleteFile);
  server.onNotFound(handleNotFound);

  server.begin();
  Serial.println("HTTP server started");

  
  Serial.println("Beginning SPIFFS");
  if (!SPIFFS.begin()) {
    Serial.println("Failed to mount file system");
  }
  //SPIFFS.format();

///////////////////dotstar setup
  strip.begin(); // Initialize pins for output
  strip.show();  // Turn all LEDs off ASAP

  imageLoaded = loadImage(getLastImage());
}

void loop(void){
  //dnsServer.processNextRequest();
  server.handleClient();

  if (imageLoaded) {
    servicePOV(15);
    delayMicroseconds(2500); //2.5ms = 400hz
  } else {
    yield();
  }
}
