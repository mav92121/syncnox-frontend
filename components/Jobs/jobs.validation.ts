import { Rule } from "antd/es/form";
import { Dayjs } from "dayjs";
import {
  createTimeWindowStartValidator,
  createTimeWindowEndValidator,
  phoneNumberPattern as commonPhonePattern,
} from "@/utils/form.validation";

/**
 * Validation rules for Job Form
 */

/**
 * Validates that start time is before end time
 * Also ensures that if start time is present, end time must be present
 */
export const validateTimeWindowStart = (form: any): Rule =>
  createTimeWindowStartValidator(
    form,
    "time_window_end",
    "Start time",
    "End time"
  );

/**
 * Validates that end time is after start time
 * Also ensures that if end time is present, start time must be present
 */
export const validateTimeWindowEnd = (form: any): Rule =>
  createTimeWindowEndValidator(
    form,
    "time_window_start",
    "Start time",
    "End time"
  );

/**
 * Phone number validation pattern
 */
export const phoneNumberPattern = commonPhonePattern;

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
