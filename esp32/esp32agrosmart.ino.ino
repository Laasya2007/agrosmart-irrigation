#include <OneWire.h>
#include <DallasTemperature.h>

// ----- Pin Definitions -----
#define RELAY_PIN 5
#define SOIL1_PIN 34
#define SOIL2_PIN 35
#define SOIL3_PIN 32
#define ONE_WIRE_BUS 4   // DS18B20 Data Pin

// ----- Soil Moisture Threshold -----
int moistureThreshold = 1800; // Adjust after calibration

// ----- DS18B20 Setup -----
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// ----- Control Flags -----
bool pauseOutput = false;
bool manualOverride = false;   // True if ON/OFF manually forced

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH); // Relay OFF initially
  sensors.begin();
  delay(1000); // Allow sensor to initialize

  Serial.println(" AgroSmart ESP32 ready");
  Serial.println("Commands: 'ON' / 'OFF' / 'AUTO' / 'STATUS' / 'p'");
}

void loop() {
  // ---- Check Serial Input ----
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    command.trim();

    if (command.equalsIgnoreCase("ON")) {
      digitalWrite(RELAY_PIN, LOW); // Pump ON
      manualOverride = true;
      Serial.println("💧 Sensor reading forced ON ");
    }
    else if (command.equalsIgnoreCase("OFF")) {
      digitalWrite(RELAY_PIN, HIGH); // Pump OFF
      manualOverride = true;
      Serial.println("✅ Sensor reading forced OFF ");
    }
    else if (command.equalsIgnoreCase("AUTO")) {
      manualOverride = false;
      Serial.println("⚙ Auto control resumed.");
    }
    else if (command.equalsIgnoreCase("STATUS")) {
      readAndPrintSensors();
    }
    else if (command.equalsIgnoreCase("p")) {
      pauseOutput = !pauseOutput;
      Serial.println(pauseOutput ? "⏸ Output Paused" : "▶ Output Resumed");
    }
    else {
      Serial.println("❌ Unknown command. Use: ON / OFF / AUTO / STATUS / p");
    }
  }

  // ---- Automatic Pump Control ----
  if (!manualOverride) {
    autoControlPump();
  }

  delay(500); // Small delay to avoid Serial flooding
}

// ----- Automatic Pump Control -----
void autoControlPump() {
  int soil1 = analogRead(SOIL1_PIN);
  int soil2 = analogRead(SOIL2_PIN);
  int soil3 = analogRead(SOIL3_PIN);
  int avgSoil = (soil1 + soil2 + soil3) / 3;

  if (avgSoil < moistureThreshold) {
    digitalWrite(RELAY_PIN, LOW);  // Pump ON
  } else {
    digitalWrite(RELAY_PIN, HIGH); // Pump OFF
  }

  if (!pauseOutput) {
    Serial.print(" Auto Check - Avg Soil: "); Serial.print(avgSoil);
    Serial.print(" |  "); Serial.println(digitalRead(RELAY_PIN) == LOW ? "ON" : "OFF");
  }
}

// ----- Function to Read Sensors + Print -----
void readAndPrintSensors() {
  if (pauseOutput) {
    Serial.println("⏸ Output is paused. Resume with 'p'");
    return;
  }

  int soil1 = analogRead(SOIL1_PIN);
  int soil2 = analogRead(SOIL2_PIN);
  int soil3 = analogRead(SOIL3_PIN);
  int avgSoil = (soil1 + soil2 + soil3) / 3;

  sensors.requestTemperatures();
  float temperatureC = sensors.getTempCByIndex(0);

  // Handle disconnected sensor
  if (temperatureC == -127.0) {
    Serial.println("⚠ Temperature sensor not detected!");
    temperatureC = 0; // Optional fallback value
  }

  Serial.println("---- Sensor Readings ----");
  Serial.print("Soil 1: "); Serial.println(soil1);
  Serial.print("Soil 2: "); Serial.println(soil2);
  Serial.print("Soil 3: "); Serial.println(soil3);
  Serial.print("Average Soil: "); Serial.println(avgSoil);
  Serial.print("Temperature: "); Serial.print(temperatureC); Serial.println(" °C");
  Serial.print("Pump: "); Serial.println(digitalRead(RELAY_PIN) == LOW ? "ON" : "OFF");
  Serial.println("--------------------------\n");
}