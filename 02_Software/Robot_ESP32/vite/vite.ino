#include "esp_camera.h"
#include <WiFi.h>

#define CAMERA_MODEL

const char* ssid = "DIGI-37Eb";   
const char* password = "PTuKxzQke3"; 

#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

int gpLf = 13; 
int gpLb = 15; 
int gpRf = 12; 
int gpRb = 14; 
int gpLed = 4; 
String WiFiAddr ="";

#define TRIG_PIN 2      
#define ECHO_FATA 4  
#define ECHO_SPATE 3   
#define BUZZER_PIN 1   

int vitezaStanga = 0;
int vitezaDreapta = 0;
unsigned long ultimulMesaj = 0; 
unsigned long timpUltimulBip = 0;
bool stareBuzzer = false;

int activeEmote = 0;
bool isAutoPilot = false;
bool obstacleWarning = false;

void startCameraServer();

void WheelAct_PWM(int vLeft, int vRight) {
  vitezaStanga = constrain(vLeft, -255, 255);
  vitezaDreapta = constrain(vRight, -255, 255);

  if (vitezaStanga >= 0) {
    analogWrite(gpLf, vitezaStanga); analogWrite(gpLb, 0);
  } else {
    analogWrite(gpLf, 0); analogWrite(gpLb, -vitezaStanga); 
  }

  if (vitezaDreapta >= 0) {
    analogWrite(gpRf, vitezaDreapta); analogWrite(gpRb, 0);
  } else {
    analogWrite(gpRf, 0); analogWrite(gpRb, -vitezaDreapta);
  }
}

void setup() {
  Serial.begin(115200);

  pinMode(gpLb, OUTPUT); pinMode(gpLf, OUTPUT);
  pinMode(gpRb, OUTPUT); pinMode(gpRf, OUTPUT);
  WheelAct_PWM(0, 0); 

  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0; config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM; config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM; config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM; config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM; config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM; config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM; config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM; config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM; config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000; config.pixel_format = PIXFORMAT_JPEG;
  
  if(psramFound()){
    config.frame_size = FRAMESIZE_UXGA; config.jpeg_quality = 10; config.fb_count = 2;
  } else {
    config.frame_size = FRAMESIZE_SVGA; config.jpeg_quality = 12; config.fb_count = 1;
  }

  esp_camera_init(&config);
  sensor_t * s = esp_camera_sensor_get();
  s->set_vflip(s, 1); s->set_hmirror(s, 0); s->set_framesize(s, FRAMESIZE_CIF);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { 
      delay(500); 
      Serial.print("."); 
  }
  
  Serial.println("");
  Serial.print("Sistem conectat! Adresa IP este: ");
  Serial.println(WiFi.localIP());
  
  startCameraServer();

  delay(2000); 
  Serial.end(); 
  delay(100); 
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW); 

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_FATA, INPUT);
  pinMode(ECHO_SPATE, INPUT);
}

int masoaraDistanta(int pinEcho) {
  digitalWrite(TRIG_PIN, LOW); delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long durata = pulseIn(pinEcho, HIGH, 20000); 
  if(durata == 0) return 999; 
  return durata * 0.034 / 2;
}

void bip(int durata_ON, int durata_OFF) {
  digitalWrite(BUZZER_PIN, HIGH);
  delay(durata_ON);
  digitalWrite(BUZZER_PIN, LOW);
  delay(durata_OFF);
}

void loop() {
  if (activeEmote != 0) {
    if (activeEmote == 1) {
      bip(80, 50); bip(80, 50); bip(80, 50); bip(400, 0);
      for(int i=0; i<3; i++) {
        WheelAct_PWM(255, -255); delay(100);
        WheelAct_PWM(-255, 255); delay(100);
      }
      WheelAct_PWM(0, 0);
    } 
    else if (activeEmote == 2) {
      bip(400, 200); bip(800, 0);
      WheelAct_PWM(-150, -150); delay(400); WheelAct_PWM(0, 0);
      for(int i=0; i<2; i++){
        WheelAct_PWM(100, -100); delay(200);
        WheelAct_PWM(-100, 100); delay(200);
      }
      WheelAct_PWM(0, 0);
    }
    else if (activeEmote == 3) {
      for(int i=0; i<4; i++){
        digitalWrite(gpLed, HIGH); bip(60, 0); 
        WheelAct_PWM(200, -200); delay(200);
        digitalWrite(gpLed, LOW); delay(50);
      }
      WheelAct_PWM(0, 0);
    }
    
    activeEmote = 0; ultimulMesaj = millis(); 
    return; 
  }

  if (isAutoPilot) {
    int distFata = masoaraDistanta(ECHO_FATA);
    
    if (distFata > 0 && distFata < 20) {
      obstacleWarning = true;      
      WheelAct_PWM(0, 0); delay(200);
      bip(200, 0); 
      int distSpate = masoaraDistanta(ECHO_SPATE);
      if (distSpate == 0 || distSpate > 15) {
        WheelAct_PWM(-150, -150); delay(400); 
      }
      
      int directie = random(0, 2); 
      int timpRotire = random(250, 700); 
      
      if (directie == 0) {
        WheelAct_PWM(-150, 150); 
      } else {
        WheelAct_PWM(150, -150);
      }
      delay(timpRotire);
      
      WheelAct_PWM(0, 0); delay(200);
    } else {
      obstacleWarning = false;
      WheelAct_PWM(130, 130); delay(50);
    }
    
    ultimulMesaj = millis(); 
    return;
  }

  if (millis() - ultimulMesaj > 1000 && ultimulMesaj != 0) {
    if (vitezaStanga != 0 || vitezaDreapta != 0) { WheelAct_PWM(0, 0); }
  }

  bool miscareFata = (vitezaStanga > 0 || vitezaDreapta > 0);
  bool miscareSpate = (vitezaStanga < 0 || vitezaDreapta < 0);
  bool obstacolFata = false;
  bool obstacolSpate = false;

  if (miscareFata) {
    int distFata = masoaraDistanta(ECHO_FATA); 
    if (distFata > 0 && distFata < 20) { 
      WheelAct_PWM(0, 0); delay(300); 
      obstacolFata = true; 
    }
    delay(10); 
  } 
  if (miscareSpate) {
    if (millis() - timpUltimulBip > 400) { 
      stareBuzzer = !stareBuzzer;
      digitalWrite(BUZZER_PIN, stareBuzzer ? HIGH : LOW);
      timpUltimulBip = millis();
    }
    int distSpate = masoaraDistanta(ECHO_SPATE); 
    if (distSpate > 0 && distSpate < 20) {
      WheelAct_PWM(0, 0); digitalWrite(BUZZER_PIN, HIGH); delay(300); 
      obstacolSpate = true;
    }
  } else {
    digitalWrite(BUZZER_PIN, LOW); stareBuzzer = false;
  }
  obstacleWarning = (obstacolFata || obstacolSpate);

  delay(50); 
}
