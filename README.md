# 🏙️ Light Estate

**Smart Real Estate Dashboard – Instantly track apartment sales, notify your team, and manage all projects in the cloud.**

![Light Estate UI](https://raw.githubusercontent.com/jamesrmoro/light-estate-extension/main/assets/images/cover.png)


[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Supabase](https://img.shields.io/badge/backed%20by-Supabase-3ecf8e.svg)](https://supabase.com/)
[![Deploy on Vercel](https://vercel.com/button)](https://vercel.com/)

---

## ✨ Features

- **Real-time Sales Tracking** – Visual building model, click apartments to register sales.
- **Instant Notifications** – Email and Push notifications for your team using Postmark and webhooks.
- **Chrome Extension Integration** – Register new sales directly from your browser.
- **Team Management** – Add and manage team emails per project.
- **Project Configs** – Support for multiple real estate projects, with custom floors and apartments.
- **Cloud-first** – Built on Supabase, deployable anywhere (Vercel, Netlify, your server).
- **Mobile Friendly** – Works on all devices.

---

## 🚀 Demo

[![Watch the demo on YouTube](https://img.youtube.com/vi/Cc812fVl26I/maxresdefault.jpg)](https://youtu.be/Cc812fVl26I "Watch the full demo on YouTube")

> ▶️ **Click the image above to watch the full demo on YouTube!**  
> [https://youtu.be/Cc812fVl26I](https://youtu.be/Cc812fVl26I)
>
> _See the extension in action, real-time sales, notifications, and project management in under 5 minutes._


---

## 🛠️ Setup

1. **Clone the repository**

```bash
git clone https://github.com/jamesrmoro/light-estate-extension.git
cd light-estate-extension
```

2. **Configure your Supabase credentials**  
   Open the file `popup-login.js` (or wherever indicated in the code) and insert your Supabase **URL** and **Anon Key**.

3. **Load the Extension in Chrome:**

   1. Go to [`chrome://extensions/`](chrome://extensions/)
   2. Enable **Developer mode** (top right corner)
   3. Click **Load unpacked**
   4. Select the project folder (`light-estate-extension`)

4. **Done!**  
   The extension is now ready to use.

---

> ⚠️ **Important:**  
> You must **replace all occurrences** of  
> - `https://lightestate-backend.vercel.app/api/webhook`  
> - `https://lightestate-backend.vercel.app/api/send-email`  
> (and any other backend URLs in the source code)  
> with the URL of **your own deployed backend API**!
>
> These URLs are found wherever API calls are made in the source code.  
> Make sure your backend is running and accessible for notifications and email delivery to work.

---

## 🔗 Related Repositories

This extension requires a backend and a PWA (Progressive Web App) for full functionality:

- **Backend API (notifications, email, integration):**  
  [jamesrmoro/lightestate-backend](https://github.com/jamesrmoro/lightestate-backend)

- **PWA for Push Notifications (optional, recommended):**  
  [jamesrmoro/lightestate-pwa](https://github.com/jamesrmoro/lightestate-pwa)

> Make sure to deploy and configure both before using the Chrome extension.

---

---

## 🤖 Arduino/ESP32 Integration

Want to connect a real building model with LEDs and an LCD display?  
Use the code below on your **ESP32** to sync your LED strip and LCD with apartment sales from the Light Estate backend!

<details>
<summary><strong>Click to show Arduino/ESP32 code</strong></summary>

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Adafruit_NeoPixel.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

#define LED_PIN    18
#define NUM_LEDS   21

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* apiUrl = "https://lightestate-backend.vercel.app/api/leds-status?empreendimento_id=YOUR_ID";

Adafruit_NeoPixel strip(NUM_LEDS, LED_PIN, NEO_GRB + NEO_KHZ800);
LiquidCrystal_I2C lcd(0x27, 16, 2); // Use 0x3F if 0x27 does not work

bool wifiConectado = false;

void setup() {
  Serial.begin(115200);
  Serial.println("Starting setup...");

  strip.begin();
  strip.setBrightness(100);
  strip.show(); // Turn off all LEDs

  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("WiFi: Connecting");

  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);

  unsigned long startAttemptTime = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < 10000) {
    delay(500);
    Serial.print(".");
  }

  lcd.clear();
  if (WiFi.status() == WL_CONNECTED) {
    wifiConectado = true;
    lcd.setCursor(0, 0);
    lcd.print("WiFi: OK         ");
    Serial.println("\nWiFi connected!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  } else {
    wifiConectado = false;
    lcd.setCursor(0, 0);
    lcd.print("WiFi: FAIL       ");
    Serial.println("\nWiFi NOT connected.");
  }
}

void loop() {
  String ledNums = "-";

  Serial.println("------ New cycle ------");
  Serial.print("WiFi status: ");
  Serial.println(WiFi.status() == WL_CONNECTED ? "CONNECTED" : "DISCONNECTED");

  if (wifiConectado && WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    Serial.print("Requesting: ");
    Serial.println(apiUrl);

    http.begin(apiUrl);
    int httpCode = http.GET();

    Serial.print("HTTP status: ");
    Serial.println(httpCode);

    if (httpCode == 200) {
      String payload = http.getString();
      Serial.print("Payload received: ");
      Serial.println(payload);

      StaticJsonDocument<512> doc;
      DeserializationError err = deserializeJson(doc, payload);
      if (!err) {
        JsonArray leds = doc["leds"].as<JsonArray>();

        ledNums = "";
        Serial.print("LEDs from JSON: ");
        bool anyOn = false;

        // Turn all LEDs off before lighting the correct ones
        strip.clear();

        for (int i = 0; i < leds.size(); i++) {
          int ledIndex = leds[i];
          Serial.print(ledIndex);
          Serial.print(" ");
          if (ledIndex >= 1 && ledIndex <= NUM_LEDS) {
            strip.setPixelColor(ledIndex - 1, strip.Color(255, 255, 0)); // Yellow
            ledNums += String(ledIndex) + " ";
            anyOn = true;
          }
        }
        Serial.println();

        if (!anyOn) {
          ledNums = "-";
        }

        strip.show();
      } else {
        Serial.print("JSON parse error: ");
        Serial.println(err.c_str());
      }
    } else {
      Serial.println("HTTP response error.");
    }
    http.end();
  } else {
    lcd.setCursor(0, 0);
    lcd.print("WiFi: FAIL       ");
    ledNums = "-";
    Serial.println("WiFi disconnected during loop.");
  }

  lcd.setCursor(0, 0);
  lcd.print(wifiConectado ? "WiFi: OK         " : "WiFi: FAIL       ");
  lcd.setCursor(0, 1);
  lcd.print("LED: ");
  lcd.print(ledNums);
  for (int i = 5 + ledNums.length(); i < 16; i++) lcd.print(" ");

  Serial.print("Shown on LCD: ");
  Serial.println(ledNums);

  delay(2000);
}
