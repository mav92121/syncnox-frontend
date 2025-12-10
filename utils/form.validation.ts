import { Rule } from "antd/es/form";
import { Dayjs } from "dayjs";

/**
 * Common validation utilities for forms
 */

/**
 * Creates a validator for start time of a time window
 * Validates that start time is before end time
 * Also ensures that if start time is present, end time must be present
 *
 * @param form - Form instance
 * @param endFieldName - Name of the end time field to compare against
 * @param startLabel - Label for start field (e.g., "Start time", "Work start time")
 * @param endLabel - Label for end field (e.g., "End time", "Work end time")
 */
export const createTimeWindowStartValidator = (
  form: any,
  endFieldName: string,
  startLabel: string = "Start time",
  endLabel: string = "End time"
): Rule => ({
  validator: async (_, value: Dayjs) => {
    const endTime = form.getFieldValue(endFieldName);

    // If start time is present, end time must also be present
    if (value && !endTime) {
      return Promise.reject(
        new Error(
          `${endLabel} is required when ${startLabel.toLowerCase()} is set`
        )
      );
    }

    // If both are present, start must be before end
    if (value && endTime && (value.isAfter(endTime) || value.isSame(endTime))) {
      return Promise.reject(
        new Error(`${startLabel} must be before ${endLabel.toLowerCase()}`)
      );
    }

    return Promise.resolve();
  },
});

/**
 * Creates a validator for end time of a time window
 * Validates that end time is after start time
 * Also ensures that if end time is present, start time must be present
 *
 * @param form - Form instance
 * @param startFieldName - Name of the start time field to compare against
 * @param startLabel - Label for start field (e.g., "Start time", "Work start time")
 * @param endLabel - Label for end field (e.g., "End time", "Work end time")
 */
export const createTimeWindowEndValidator = (
  form: any,
  startFieldName: string,
  startLabel: string = "Start time",
  endLabel: string = "End time"
): Rule => ({
  validator: async (_, value: Dayjs) => {
    const startTime = form.getFieldValue(startFieldName);

    // If end time is present, start time must also be present
    if (value && !startTime) {
      return Promise.reject(
        new Error(
          `${startLabel} is required when ${endLabel.toLowerCase()} is set`
        )
      );
    }

    // If both are present, end must be after start
    if (
      value &&
      startTime &&
      (startTime.isAfter(value) || startTime.isSame(value))
    ) {
      return Promise.reject(
        new Error(`${endLabel} must be after ${startLabel.toLowerCase()}`)
      );
    }

    return Promise.resolve();
  },
});

/**
 * Phone number validation pattern
 */
export const phoneNumberPattern = {
  pattern: /^[0-9]{7,15}$/,
  message: "Please enter a valid phone number (7-15 digits)",
};
