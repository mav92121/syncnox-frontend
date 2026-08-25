/**
 * Trip-type (pickup_type) validation for bulk job import.
 *
 * Mirrors `BulkUploadService._validate_trip_requirements` in
 * syncnox-be/app/services/bulk_upload.py — including the exact error strings —
 * so that a row the user fixes in the preview grid is judged the same way the
 * backend judged it after step 2. Keep the two in sync.
 */

export type TripType = "one_way" | "return_only" | "round_trip";

const TRIP_TYPE_LABELS: Record<TripType, string> = {
  one_way: "One-way trip",
  return_only: "Return-only trip",
  round_trip: "Round trip",
};

const PICKUP_POINT_FIELDS = ["go_pickup_point", "pick_up_address"];
const CLIENT_ADDRESS_FIELDS = ["client_address", "address_formatted"];
const DROPOFF_POINT_FIELDS = ["return_dropoff_point", "drop_off_address"];

/** Prefixes of every message this module can produce, used to drop stale errors. */
export const TRIP_ERROR_PREFIXES = [
  "Pickup Type (Trip Type)",
  "Invalid Pickup Type",
  ...Object.values(TRIP_TYPE_LABELS),
];

export const isTripValidationError = (error: string): boolean =>
  TRIP_ERROR_PREFIXES.some((prefix) => error.startsWith(prefix));

const isBlank = (value: unknown): boolean =>
  value === null ||
  value === undefined ||
  String(value).trim() === "" ||
  ["nan", "none"].includes(String(value).trim().toLowerCase());

/** First non-empty value among the given fields, checking custom_fields too. */
const rowValue = (
  row: Record<string, any>,
  ...fields: string[]
): string | null => {
  for (const field of fields) {
    let value = row?.[field];
    if (isBlank(value)) value = row?.custom_fields?.[field];
    if (!isBlank(value)) return String(value).trim();
  }
  return null;
};

/** Does this pickup/drop-off point refer to the candidate's own home? */
const meansCandidateHome = (point: string): boolean => {
  const s = point.toLowerCase().replace(/['’`]/g, "").trim();
  return (
    (s.includes("candidate") && s.includes("house")) ||
    s.includes("domicile") ||
    s.includes("maison") ||
    ["home", "adresse candidat", "candidate address", "domicile candidat", "candidat"].includes(s)
  );
};

export const normalizeTripType = (value: unknown): TripType | null => {
  const s = String(value ?? "").trim().toLowerCase();
  if (s.includes("round")) return "round_trip";
  if (s.includes("return")) return "return_only";
  if (s.includes("one") || s.includes("go")) return "one_way";
  return null;
};

const validateTripPoint = (
  row: Record<string, any>,
  fields: string[],
  tripLabel: string,
  pointLabel: string,
): string[] => {
  const point = rowValue(row, ...fields);
  if (point === null) return [`${tripLabel} requires a ${pointLabel}`];
  if (meansCandidateHome(point) && rowValue(row, "candidate_address") === null) {
    return [
      `${tripLabel} ${pointLabel} is set to the candidate's home ('${point}'), but Candidate Address is empty`,
    ];
  }
  return [];
};

/**
 * Trip type is mandatory, and each type requires a specific set of addresses:
 * - one_way     -> pickup point + client address
 * - return_only -> client address + drop-off point
 * - round_trip  -> pickup point + client address + drop-off point
 */
export const validateTripRequirements = (
  row: Record<string, any>,
): string[] => {
  let pickupTypeVal = rowValue(row, "pickup_type");

  // job_type may carry the trip type instead; a delivery-style job_type is not one.
  if (pickupTypeVal === null) {
    const jobTypeVal = rowValue(row, "job_type");
    if (jobTypeVal && normalizeTripType(jobTypeVal)) pickupTypeVal = jobTypeVal;
  }

  if (pickupTypeVal === null) return ["Pickup Type (Trip Type) is required"];

  const tripType = normalizeTripType(pickupTypeVal);
  if (tripType === null) {
    return [
      `Invalid Pickup Type: '${pickupTypeVal}'. Must be One Way, Round Trip, or Return Only`,
    ];
  }

  const tripLabel = TRIP_TYPE_LABELS[tripType];
  const errors: string[] = [];

  if (tripType === "one_way" || tripType === "round_trip") {
    errors.push(
      ...validateTripPoint(row, PICKUP_POINT_FIELDS, tripLabel, "pickup point"),
    );
  }

  if (rowValue(row, ...CLIENT_ADDRESS_FIELDS) === null) {
    errors.push(`${tripLabel} requires a client address`);
  }

  if (tripType === "return_only" || tripType === "round_trip") {
    errors.push(
      ...validateTripPoint(row, DROPOFF_POINT_FIELDS, tripLabel, "dropoff point"),
    );
  }

  return errors;
};
