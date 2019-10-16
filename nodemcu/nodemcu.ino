#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
//#include <ArduinoJson.h>

int redLed = D5;
int greenLed = D1;
int smoke  = A0 ;
// Your threshold value
int sensorThres = 690;

#define LED D0


const char *ssid =  "JAIN"; 

void request_send(String *, int *);

void setup() {
  Serial.begin(115200);
  String thisBoard= ARDUINO_BOARD;
  Serial.println(thisBoard);
  Serial.println("Connecting to ");
  Serial.println(ssid); 

  WiFi.begin(ssid); 
  while (WiFi.status() != WL_CONNECTED) 
  {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");
  
  pinMode(redLed, OUTPUT);
  pinMode(greenLed, OUTPUT);
  pinMode(smoke , INPUT);
  pinMode(LED, OUTPUT);
}

void loop() {
  int analogSensor = analogRead(smoke);

  digitalWrite(LED, HIGH);

  Serial.print("Pin A0: ");
  Serial.println(analogSensor);
  // Checks if it has reached the threshold value
  if (analogSensor > sensorThres)
  {
    Serial.println("Something happening abnormal");
    digitalWrite(redLed, HIGH);
    digitalWrite(greenLed, LOW);
  }
  else
  {
    Serial.println("Everything is alright");
    digitalWrite(redLed, LOW);
    digitalWrite(greenLed, HIGH);
  }

  //sending data to normal pc
  request_send("http://192.168.43.151:3001/smoke-data/", analogSensor);

  //sending data to rpi
  //request_send("http://192.168.43.124:3001/smoke-data/", analogSensor);

  delay(1000);
  digitalWrite(LED, LOW); 
  delay(10000); 
}

void request_send(String url, int data){  
  
  HTTPClient http;  //Declare an object of class HTTPClient
  http.begin(url);  //Specify request destination
 
  http.addHeader("User-Agent","Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv","66.0) Gecko/20100101 Firefox/66.0");
  http.addHeader("Accept","text/html,application/xhtml+xml,application/xml;q=0.9,/;q=0.8");
  http.addHeader("Accept-Language","en-US,en;q=0.5");
  http.addHeader("Accept-Encoding","gzip, deflate, br");
  http.addHeader("DNT","1");
  http.addHeader("Connection","keep-alive");
  http.addHeader("Upgrade-Insecure-Requests","1");
  http.addHeader("Cache-Control","max-age=0");
  http.addHeader("Content-Type", "application/x-www-form-urlencoded");   

  String postData = "data="+String(data);
  int httpCode = http.POST(postData); 
  String payload = http.getString();   //Get the request response payload
  Serial.println(payload); 
  http.end();
}
