import { Route, Stop } from "@/types/routes.type";
import { decodePolyline } from "@/utils/googleMaps.utils";
import { getRouteColor } from "@/utils/timeline.utils";
import { Job } from "@/types/job.type";

/** Stroke colour used for routes that are not the focused one. */
const DIMMED_ROUTE_COLOR = "#9ca3af";

export const generateRoutePolylines = (
  route: Route,
  focusedRouteIndex?: number | null,
) => {

  if (!route?.result?.routes) return [];

  return route.result.routes
    .map((routeItem, index) => ({ routeItem, index }))
    .filter(({ routeItem, index }) => {
      if (!routeItem.route_polyline) return false;
      if (
        focusedRouteIndex !== null &&
        focusedRouteIndex !== undefined &&
        focusedRouteIndex !== index
      ) {
        return false;
      }
      return true;
    })
    .map(({ routeItem, index }) => ({
      id: `route-${index}`,
      path: decodePolyline(routeItem.route_polyline),
      options: {
        strokeColor: getRouteColor(index),
        strokeWeight: 4,
        strokeOpacity: 1,
        zIndex: 10,
        clickable: true,
      },
    }));
};

export type MarkerJobData = Pick<
  Job,
  "id" | "address_formatted" | "status" | "location"
>;

export const generateMapMarkers = (route: Route, jobs: Job[]) => {
  if (!route?.result?.routes) return [];
  const jobsMap = new Map(jobs.map((j) => [Number(j.id), j]));
  return route.result.routes.flatMap((routeItem, index) => {
    const color = getRouteColor(index);
    return routeItem.stops
      // Keep the original stop index so marker ids stay aligned with the route's
      // stop sequence even when a stop has no resolvable coordinates.
      .map((stop: any, stopIndex: number) => ({ stop, stopIndex }))
      .filter(
        ({ stop }) =>
          typeof stop.latitude === "number" &&
          typeof stop.longitude === "number",
      )
      .map(({ stop, stopIndex }) => {
        let job: Job | MarkerJobData | undefined = stop.job_id
          ? jobsMap.get(Number(stop.job_id))
          : undefined;

        if (
          !job &&
          stop.job_id != null &&
          stop.stop_type !== "depot" &&
          stop.stop_type !== "break"
        ) {
          job = {
            id: stop.job_id,
            address_formatted: stop.address_formatted,
            status: "assigned",
            location: { lat: stop.latitude, lng: stop.longitude },
          };
        }

        return {
          id: `${index}-${stopIndex}`,
          position: { lat: stop.latitude, lng: stop.longitude },
          label: {
            text: stopIndex.toString(),
            color: "white",
            fontWeight: "bold",
          },
          title: stop.address_formatted || "Unknown location",
          description: stop.arrival_time
            ? `ETA: ${new Date(stop.arrival_time).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}`
            : undefined,
          jobData: job,
          sequenceNumber: stopIndex,
          isDepot: stop.stop_type === "depot",
          color: color,
          routeIndex: index,
        };
      });
  });
};

export const prepareExportData = (route: Route, jobs: Job[]) => {
  const flattenData: any[] = [];

  if (route.result?.routes) {
    route.result.routes.forEach((routeItem) => {
      routeItem.stops.forEach((stop: Stop) => {
        // Find primitive job details if available
        const jobDetails = stop.job_id
          ? jobs.find((j) => j.id === stop.job_id)
          : null;

        flattenData.push({
          Priority: jobDetails?.priority_level || "Medium",
          Address: stop.address_formatted,
          ETA: stop.arrival_time
            ? new Date(stop.arrival_time).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
            : "-",
          "Phone Number": jobDetails?.phone_number || "-",
          Duration: jobDetails?.service_duration,
          "Team Member (Driver)": routeItem.team_member_name || "Unassigned",
        });
      });
    });
  }
  return flattenData;
};
