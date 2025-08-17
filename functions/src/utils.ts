import admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

import { WeatherEntry } from "./types";

export const getTimestamp = (timestamp: string | number): number => {
  return typeof timestamp === "string" ? Date.parse(timestamp) : timestamp;
};

// Helper to send FCM notification
export const sendWeatherToUser = async ({
  userId,
  weatherData,
  deviceId,
}: {
  userId: string;
  weatherData: WeatherEntry;
  deviceId?: string; // Optional device ID for better context
}): Promise<boolean> => {
  try {
    // Validate weather data
    if (!weatherData || typeof weatherData.rain !== "boolean") {
      logger.error(`Invalid weather data for user ${userId}:`, weatherData);
      return false;
    }

    const userSnap = await admin.database().ref(`/users/${userId}`).get();
    if (!userSnap.exists()) {
      logger.error(`User ${userId} not found.`);
      return false;
    }

    const userData = userSnap.val();
    const fcmToken = userData?.fcmToken;

    // Validate FCM token
    if (!fcmToken || typeof fcmToken !== "string" || fcmToken.trim() === "") {
      logger.error(`No valid FCM token for user ${userId}`);
      return false;
    }

    // Get device name if available
    let deviceName = deviceId ? `Station ${deviceId}` : "Parking Station";
    try {
      if (deviceId) {
        const deviceSnap = await admin
          .database()
          .ref(`/devices/${deviceId}/name`)
          .get();
        if (deviceSnap.exists()) {
          deviceName = deviceSnap.val();
        }
      }
    } catch (err) {
      // If we can't get the device name, continue with the default
      logger.warn(`Couldn't retrieve device name for ${deviceId}:`, err);
    }

    const rain = weatherData.rain;
    const temperature = weatherData.temperature
      ? `${weatherData.temperature}°C`
      : "";

    const weatherDesc = rain
      ? "It's raining outside!"
      : "Weather is clear now.";
    const tempInfo = temperature ? ` Temperature: ${temperature}` : "";

    const message = {
      token: fcmToken,
      notification: {
        title: `Weather Update for ${deviceName}`,
        body: `${weatherDesc}${tempInfo}`,
      },
      data: {
        deviceId: deviceId || "",
        rain: rain.toString(),
        temperature: weatherData.temperature?.toString() || "",
        timestamp: weatherData.timestamp?.toString() || "",
        type: "weather_update",
      },
    };

    await admin.messaging().send(message);
    logger.info(`Weather notification sent to user ${userId}`);
    return true;
  } catch (error) {
    logger.error(`Error sending notification to user ${userId}:`, error);
    return false;
  }
};
