import dayjs from "dayjs";
import { Team } from "@/types/team.type";
import { COUNTRY_CODES } from "@/constants/country";
import { Depot } from "@/types/depots.type";

export const statusStyleMap = {
  active: "bg-green-100 text-green-700 border border-green-200",
  inactive: "bg-red-100 text-red-700 border border-red-200",
  online: "bg-blue-100 text-blue-700 border border-blue-200",
  offline: "bg-gray-100 text-gray-700 border border-gray-200",
};

interface LocationOptions {
  startLocationSameAsDepot: boolean;
  endLocationSameAsDepot: boolean;
  depot?: Depot;
}

/**
 * Transform form values to API format for team member submission
 */
export const transformFormToApi = (
  values: any,
  skills: string[],
  scheduleBreak: boolean,
  initialData?: Team | null,
  locationOptions?: LocationOptions
): any => {
  const transformedValues: any = {
    ...values,
    id: initialData?.id,
    skills: skills,
  };

  // Transform work times: dayjs object -> string (HH:mm)
  if (values.work_start_time) {
    transformedValues.work_start_time = dayjs(values.work_start_time).format(
      "HH:mm"
    );
  }
  if (values.work_end_time) {
    transformedValues.work_end_time = dayjs(values.work_end_time).format(
      "HH:mm"
    );
  }

  // Transform break times
  if (scheduleBreak && values.break_time_start) {
    transformedValues.break_time_start = dayjs(values.break_time_start).format(
      "HH:mm"
    );
  }
  if (scheduleBreak && values.break_time_end) {
    transformedValues.break_time_end = dayjs(values.break_time_end).format(
      "HH:mm"
    );
  }

  // Transform phone: object {countryCode, number} -> string phone_number
  if (values.phone) {
    const { countryCode, number } = values.phone;
    const codeOnly = countryCode.match(/\+\d+/)?.[0] || "";
    transformedValues.phone_number = `${codeOnly}-${number}`;
    delete transformedValues.phone;
  }

  // Handle start/end location based on "same as depot" checkboxes
  if (locationOptions) {
    const { startLocationSameAsDepot, endLocationSameAsDepot, depot } =
      locationOptions;

    if (startLocationSameAsDepot && depot) {
      // Use depot location when "same as depot" is checked
      transformedValues.start_address = depot.address?.formatted_address;
      transformedValues.start_location = depot.location;
    }

    if (endLocationSameAsDepot && depot) {
      // Use depot location when "same as depot" is checked
      transformedValues.end_address = depot.address?.formatted_address;
      transformedValues.end_location = depot.location;
    }
  }

  return transformedValues;
};

/**
 * Transform API data to form format for editing
 */
export const transformApiToForm = (initialData: Team): any => {
  const formValues: any = { ...initialData };

  // Transform work times: string (HH:mm) -> dayjs object
  if (formValues.work_start_time) {
    formValues.work_start_time = dayjs(formValues.work_start_time, "HH:mm");
  }
  if (formValues.work_end_time) {
    formValues.work_end_time = dayjs(formValues.work_end_time, "HH:mm");
  }

  // Transform break times
  if (formValues.break_time_start) {
    formValues.break_time_start = dayjs(formValues.break_time_start, "HH:mm");
  }
  if (formValues.break_time_end) {
    formValues.break_time_end = dayjs(formValues.break_time_end, "HH:mm");
  }

  // Transform phone_number: string "+1-298372138" -> object {countryCode, number}
  if (formValues.phone_number) {
    const [code, number] = formValues.phone_number.split("-");
    const country = COUNTRY_CODES.find((c) => c.code === code);
    formValues.phone = {
      countryCode: country ? `${country.flag} ${code}` : `🇺🇸 ${code}`,
      number: number,
    };
    delete formValues.phone_number;
  }

  return formValues;
};
