/**
 * Looma.sh Mobile SDK for V2V Communication
 * React Native compatible library for mobile app integration
 */

import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import PushNotification from 'react-native-push-notification';

class LoomaMobileClient {
  constructor(config = {}) {
    this.config = {
      apiKey: config.apiKey || '',
      deviceId: config.deviceId || this.generateDeviceId(),
      serverUrl: config.serverUrl || 'https://api.looma.sh',
      enableLocation: config.enableLocation !== false,
      enableNotifications: config.enableNotifications !== false,
      language: config.language || 'en',
      debug: config.debug || false,
      ...config
    };

    this.isConnected = false;
    this.messageHandlers = new Map();
    this.locationCache = null;
    this.lastSyncTime = null;
    this.eventEmitter = new NativeEventEmitter();
    this.retryAttempts = 0;
    this.maxRetries = 3;

    // Initialize
    this.initialize();
  }

  async initialize() {
    try {
      // Load saved configuration
      await this.loadConfiguration();

      // Setup push notifications
      if (this.config.enableNotifications) {
        await this.setupNotifications();
      }

      // Setup location services
      if (this.config.enableLocation) {
        await this.setupLocationServices();
      }

      // Connect to server
      await this.connect();

      this.log('Looma Mobile SDK initialized successfully');
    } catch (error) {
      this.logError('Failed to initialize Looma SDK:', error);
      throw error;
    }
  }

  async connect() {
    try {
      const response = await fetch(`${this.config.serverUrl}/device/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          device_id: this.config.deviceId,
          platform: Platform.OS,
          app_version: this.config.appVersion || '1.0.0',
          capabilities: this.getDeviceCapabilities()
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.isConnected = true;
        this.retryAttempts = 0;

        // Save connection info
        await AsyncStorage.setItem('looma_connection_token', data.token);
        await AsyncStorage.setItem('looma_device_id', this.config.deviceId);

        // Start message polling
        this.startMessagePolling();

        this.log('Connected to Looma.sh server');
        this.emit('connected', data);
      } else {
        throw new Error(`Connection failed: ${response.status}`);
      }
    } catch (error) {
      this.logError('Connection failed:', error);

      // Retry logic
      if (this.retryAttempts < this.maxRetries) {
        this.retryAttempts++;
        setTimeout(() => this.connect(), 2000 * this.retryAttempts);
      } else {
        this.emit('connection_failed', error);
      }
    }
  }

  async disconnect() {
    try {
      this.stopMessagePolling();

      const token = await AsyncStorage.getItem('looma_connection_token');
      if (token) {
        await fetch(`${this.config.serverUrl}/device/disconnect`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      }

      this.isConnected = false;
      this.emit('disconnected');
    } catch (error) {
      this.logError('Disconnect error:', error);
    }
  }

  async sendMessage(message) {
    try {
      if (!this.isConnected) {
        throw new Error('Not connected to server');
      }

      const token = await AsyncStorage.getItem('looma_connection_token');

      // Add metadata
      const enrichedMessage = {
        ...message,
        device_id: this.config.deviceId,
        timestamp: new Date().toISOString(),
        location: await this.getCurrentLocation(),
        platform: Platform.OS
      };

      const response = await fetch(`${this.config.serverUrl}/v2v/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(enrichedMessage)
      });

      if (response.ok) {
        const data = await response.json();
        this.emit('message_sent', { message: enrichedMessage, response: data });
        return data;
      } else {
        throw new Error(`Send failed: ${response.status}`);
      }
    } catch (error) {
      this.logError('Send message failed:', error);
      this.emit('send_error', { message, error: error.message });
      throw error;
    }
  }

  async sendHazardAlert(hazardType, location, severity = 'medium') {
    return this.sendMessage({
      type: 'hazard_alert',
      hazard_type: hazardType,
      location: location,
      severity: severity,
      content: this.getHazardMessage(hazardType)
    });
  }

  async sendEmergencyAlert(location, emergencyType = 'accident') {
    const message = await this.sendMessage({
      type: 'emergency_alert',
      emergency_type: emergencyType,
      location: location,
      severity: 'critical',
      content: this.getEmergencyMessage(emergencyType)
    });

    // Send push notification to nearby devices
    this.sendEmergencyNotification(location, emergencyType);

    return message;
  }

  async sendTrafficUpdate(location, trafficCondition, speed = null) {
    return this.sendMessage({
      type: 'traffic_update',
      location: location,
      traffic_condition: trafficCondition,
      speed: speed,
      severity: this.getTrafficSeverity(trafficCondition)
    });
  }

  on(event, callback) {
    this.eventEmitter.addListener(event, callback);
  }

  off(event, callback) {
    this.eventEmitter.removeListener(event, callback);
  }

  emit(event, data) {
    this.eventEmitter.emit(event, data);
  }

  // Location Services
  async setupLocationServices() {
    return new Promise((resolve, reject) => {
      Geolocation.requestAuthorization(
        () => {
          this.log('Location permission granted');
          this.startLocationTracking();
          resolve();
        },
        (error) => {
          this.logError('Location permission denied:', error);
          reject(error);
        }
      );
    });
  }

  startLocationTracking() {
    this.locationWatcher = Geolocation.watchPosition(
      (position) => {
        this.locationCache = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        this.emit('location_updated', this.locationCache);
      },
      (error) => {
        this.logError('Location error:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Update every 10 meters
        interval: 5000 // Update every 5 seconds
      }
    );
  }

  stopLocationTracking() {
    if (this.locationWatcher) {
      Geolocation.clearWatch(this.locationWatcher);
    }
  }

  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (this.locationCache) {
        resolve(this.locationCache);
      } else {
        Geolocation.getCurrentPosition(
          (position) => {
            const location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp
            };
            this.locationCache = location;
            resolve(location);
          },
          (error) => {
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        );
      }
    });
  }

  // Push Notifications
  async setupNotifications() {
    PushNotification.configure({
      onRegister: (token) => {
        this.log('Push notification token:', token);
        this.savePushToken(token);
      },
      onNotification: (notification) => {
        this.handleNotification(notification);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true
      }
    });

    PushNotification.requestPermissions();
  }

  handleNotification(notification) {
    if (notification.userInteraction) {
      // User tapped the notification
      this.emit('notification_tapped', notification);
    } else {
      // Notification received while app in foreground
      this.emit('notification_received', notification);
    }
  }

  sendEmergencyNotification(location, emergencyType) {
    const title = this.getEmergencyNotificationTitle(emergencyType);
    const message = this.getEmergencyNotificationMessage(emergencyType, location);

    PushNotification.localNotification({
      title: title,
      message: message,
      actions: ['View Details', 'Ignore'],
      userInfo: {
        type: 'emergency',
        emergencyType: emergencyType,
        location: location
      }
    });
  }

  // Message Polling
  startMessagePolling() {
    this.messagePollingInterval = setInterval(async () => {
      try {
        await this.fetchMessages();
      } catch (error) {
        this.logError('Message polling error:', error);
      }
    }, 5000); // Poll every 5 seconds
  }

  stopMessagePolling() {
    if (this.messagePollingInterval) {
      clearInterval(this.messagePollingInterval);
    }
  }

  async fetchMessages() {
    const token = await AsyncStorage.getItem('looma_connection_token');
    const location = await this.getCurrentLocation();

    const response = await fetch(
      `${this.config.serverUrl}/v2v/messages?` +
      `lat=${location.latitude}&lon=${location.longitude}&` +
      `radius=5&limit=50`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data.messages && data.messages.length > 0) {
        data.messages.forEach(message => {
          this.emit('message_received', message);
        });
      }
    }
  }

  // Utility Methods
  generateDeviceId() {
    return 'mobile_' + Math.random().toString(36).substr(2, 9);
  }

  getDeviceCapabilities() {
    return {
      gps: true,
      push_notifications: this.config.enableNotifications,
      bluetooth: true,
      nfc: true,
      camera: true,
      microphone: true,
      sensors: ['accelerometer', 'gyroscope', 'compass']
    };
  }

  getHazardMessage(hazardType) {
    const messages = {
      'pothole': 'Pothole detected on road',
      'debris': 'Road debris ahead',
      'construction': 'Construction zone ahead',
      'accident': 'Accident reported ahead',
      'weather': 'Hazardous weather conditions',
      'animal': 'Animal on road',
      'object': 'Unknown object on road'
    };
    return messages[hazardType] || 'Hazard detected';
  }

  getEmergencyMessage(emergencyType) {
    const messages = {
      'accident': 'Vehicle accident - immediate assistance required',
      'medical': 'Medical emergency - help needed',
      'breakdown': 'Vehicle breakdown - roadside assistance needed',
      'fire': 'Fire reported - emergency services notified',
      'police': 'Police assistance required'
    };
    return messages[emergencyType] || 'Emergency situation';
  }

  getTrafficSeverity(condition) {
    const severityMap = {
      'free_flow': 'low',
      'light': 'low',
      'moderate': 'medium',
      'heavy': 'high',
      'congested': 'high',
      'blocked': 'critical'
    };
    return severityMap[condition] || 'medium';
  }

  getEmergencyNotificationTitle(emergencyType) {
    const titles = {
      'accident': '🚨 Accident Alert',
      'medical': '🏥 Medical Emergency',
      'breakdown': '🔧 Vehicle Breakdown',
      'fire': '🔥 Fire Alert',
      'police': '🚓 Police Alert'
    };
    return titles[emergencyType] || '🚨 Emergency Alert';
  }

  getEmergencyNotificationMessage(emergencyType, location) {
    return `Emergency ${emergencyType} reported near your location. Please proceed with caution.`;
  }

  async loadConfiguration() {
    try {
      const savedDeviceId = await AsyncStorage.getItem('looma_device_id');
      if (savedDeviceId) {
        this.config.deviceId = savedDeviceId;
      }

      const savedLanguage = await AsyncStorage.getItem('looma_language');
      if (savedLanguage) {
        this.config.language = savedLanguage;
      }
    } catch (error) {
      this.logError('Failed to load configuration:', error);
    }
  }

  async savePushToken(token) {
    try {
      await AsyncStorage.setItem('looma_push_token', token);

      // Send token to server
      const savedToken = await AsyncStorage.getItem('looma_connection_token');
      if (savedToken) {
        await fetch(`${this.config.serverUrl}/device/push-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${savedToken}`
          },
          body: JSON.stringify({ token })
        });
      }
    } catch (error) {
      this.logError('Failed to save push token:', error);
    }
  }

  log(message) {
    if (this.config.debug) {
      console.log('[Looma SDK]', message);
    }
  }

  logError(message, error) {
    if (this.config.debug) {
      console.error('[Looma SDK ERROR]', message, error);
    }
  }
}

// Export singleton instance
export const LoomaClient = new LoomaMobileClient();

// Export class for multiple instances
export { LoomaMobileClient };

export default LoomaClient;