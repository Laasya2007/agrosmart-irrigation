import type { IrrigationBox, SensorReading, CropProfile, Alert } from "./types"

const STORAGE_KEYS = {
  BOXES: "agrosmart_boxes",
  SENSOR_READINGS: "agrosmart_sensor_readings",
  CROP_PROFILES: "agrosmart_crop_profiles",
  SCHEDULES: "agrosmart_schedules",
  ALERTS: "agrosmart_alerts",
  IRRIGATION_EVENTS: "agrosmart_irrigation_events",
  SYNC_QUEUE: "agrosmart_sync_queue",
} as const

export class LocalStorage {
  static get<T>(key: string, defaultValue: T): T {
    if (typeof window === "undefined") return defaultValue

    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Error reading from localStorage key ${key}:`, error)
      return defaultValue
    }
  }

  static set<T>(key: string, value: T): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error writing to localStorage key ${key}:`, error)
    }
  }

  static remove(key: string): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(key)
  }

  static clear(): void {
    if (typeof window === "undefined") return
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key)
    })
  }
}

export class DataManager {
  // Boxes
  static getBoxes(): IrrigationBox[] {
    return LocalStorage.get(STORAGE_KEYS.BOXES, [])
  }

  static saveBoxes(boxes: IrrigationBox[]): void {
    LocalStorage.set(STORAGE_KEYS.BOXES, boxes)
  }

  static addBox(box: IrrigationBox): void {
    const boxes = this.getBoxes()
    boxes.push(box)
    this.saveBoxes(boxes)
  }

  static updateBox(boxId: string, updates: Partial<IrrigationBox>): void {
    const boxes = this.getBoxes()
    const index = boxes.findIndex((box) => box.id === boxId)
    if (index !== -1) {
      boxes[index] = { ...boxes[index], ...updates }
      this.saveBoxes(boxes)
    }
  }

  // Sensor Readings
  static getSensorReadings(boxId?: string): SensorReading[] {
    const readings = LocalStorage.get(STORAGE_KEYS.SENSOR_READINGS, [])
    return boxId ? readings.filter((reading) => reading.boxId === boxId) : readings
  }

  static addSensorReading(reading: SensorReading): void {
    const readings = this.getSensorReadings()
    readings.push(reading)
    // Keep only last 1000 readings to prevent storage overflow
    if (readings.length > 1000) {
      readings.splice(0, readings.length - 1000)
    }
    LocalStorage.set(STORAGE_KEYS.SENSOR_READINGS, readings)
  }

  // Crop Profiles
  static getCropProfiles(): CropProfile[] {
    return LocalStorage.get(STORAGE_KEYS.CROP_PROFILES, [])
  }

  static saveCropProfiles(profiles: CropProfile[]): void {
    LocalStorage.set(STORAGE_KEYS.CROP_PROFILES, profiles)
  }

  // Alerts
  static getAlerts(): Alert[] {
    return LocalStorage.get(STORAGE_KEYS.ALERTS, [])
  }

  static saveAlerts(alerts: Alert[]): void {
    LocalStorage.set(STORAGE_KEYS.ALERTS, alerts)
  }

  static markAlertAsRead(alertId: string): void {
    const alerts = this.getAlerts()
    const alert = alerts.find((a) => a.id === alertId)
    if (alert) {
      alert.isRead = true
      this.saveAlerts(alerts)
    }
  }

  // Sync Queue for offline operations
  static addToSyncQueue(operation: any): void {
    const queue = LocalStorage.get(STORAGE_KEYS.SYNC_QUEUE, [])
    queue.push({
      ...operation,
      timestamp: new Date().toISOString(),
      id: Math.random().toString(36).substr(2, 9),
    })
    LocalStorage.set(STORAGE_KEYS.SYNC_QUEUE, queue)
  }

  static getSyncQueue(): any[] {
    return LocalStorage.get(STORAGE_KEYS.SYNC_QUEUE, [])
  }

  static clearSyncQueue(): void {
    LocalStorage.set(STORAGE_KEYS.SYNC_QUEUE, [])
  }
}
