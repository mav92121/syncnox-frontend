import { Rule } from "antd/es/form";
import { Dayjs } from "dayjs";

/**
 * Validation rules for Job Form
 */

/**
 * Validates that start time is before end time
 * Also ensures that if start time is present, end time must be present
 */
export const validateTimeWindowStart = (form: any): Rule => ({
  validator: async (_, value: Dayjs) => {
    const endTime = form.getFieldValue("time_window_end");

    // If start time is present, end time must also be present
    if (value && !endTime) {
      return Promise.reject(
        new Error("End time is required when start time is set")
      );
    }

    // If both are present, start must be before end
    if (value && endTime && (value.isAfter(endTime) || value.isSame(endTime))) {
      return Promise.reject(new Error("Start time must be before end time"));
    }

    return Promise.resolve();
  },
});

/**
 * Validates that end time is after start time
 * Also ensures that if end time is present, start time must be present
 */
export const validateTimeWindowEnd = (form: any): Rule => ({
  validator: async (_, value: Dayjs) => {
    const startTime = form.getFieldValue("time_window_start");

    // If end time is present, start time must also be present
    if (value && !startTime) {
      return Promise.reject(
        new Error("Start time is required when end time is set")
      );
    }

    // If both are present, end must be after start
    if (
      value &&
      startTime &&
      (startTime.isAfter(value) || startTime.isSame(value))
    ) {
      return Promise.reject(new Error("End time must be after start time"));
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

/**
 * Validates that job duration does not exceed maximum allowed time (540 minutes)
 */
export const validateJobDuration = (): Rule => ({
  validator: async (_, value) => {
    const numValue = Number(value);
    if (value && numValue > 540) {
      return Promise.reject(
        new Error("The duration cannot exceed the maximum allowed time.")
      );
    }
    return Promise.resolve();
  },
});
