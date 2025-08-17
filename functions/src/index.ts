import admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { onValueUpdated } from "firebase-functions/v2/database";

import { WeatherEntry } from "./types";
import { getTimestamp, sendWeatherToUser } from "./utils";

// Initialize Firebase Admin SDK
admin.initializeApp();

export const sendWeatherNotification = onValueUpdated(
  { ref: "/devices/{deviceId}/weather", region: "asia-southeast1" },
  async (event) => {
    try {
      const deviceId = event.params.deviceId;

      const before = event.data.before.val() || {};
      const after = event.data.after.val() || {};

      const afterEntries = Object.values<WeatherEntry>(after);
      if (afterEntries.length === 0) {
        logger.info(`No weather data found for ${deviceId}`);
        return null;
      }

      const latestFilter = (latest: WeatherEntry, current: WeatherEntry) => {
        return getTimestamp(current.timestamp) >= getTimestamp(latest.timestamp)
          ? current
          : latest;
      };

      // Use first entry as initial value to prevent type issues
      let latestAfter: WeatherEntry = afterEntries.reduce(
        latestFilter,
        afterEntries[0]
      );

      const beforeEntries = Object.values<WeatherEntry>(before);
      
      // Handle case when there's no previous data (first entry)
      if (beforeEntries.length === 0) {
        logger.info(`Initial weather data for ${deviceId}, sending notification`);
      } else {
        // Use first entry as initial value to prevent type issues
        let latestBefore: WeatherEntry = beforeEntries.reduce(
          latestFilter,
          beforeEntries[0]
        );

        // Check if rain data has changed
        if (latestBefore.rain === latestAfter.rain) {
          logger.info(`No change in rain data for ${deviceId}`);
          return null;
        }
      }

      logger.info(`New weather for ${deviceId}:`, latestAfter);

      const slotsSnapshot = await admin
        .database()
        .ref(`/devices/${deviceId}/slots`)
        .get();

      const notifications: Promise<boolean>[] = [];

      slotsSnapshot.forEach((slotSnap) => {
        const slotData = slotSnap.val();
        if (slotData && slotData.userId) {
          notifications.push(
            sendWeatherToUser({
              userId: slotData.userId,
              weatherData: latestAfter,
              deviceId: deviceId,
            })
          );
        }
      });

      return Promise.all(notifications);
    } catch (error) {
      logger.error(`Error processing weather notification for device ${event.params.deviceId}:`, error);
      return null;
    }
  }
);
