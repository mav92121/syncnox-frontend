import { Route, Stop } from "@/types/routes.type";
import { decodePolyline } from "@/utils/googleMaps.utils";
import { getRouteColor } from "@/utils/timeline.utils";
import { Job } from "@/types/job.type";

export const generateRoutePolylines = (route: Route) => {
  if (!route?.result?.routes) return [];

  return route.result.routes.flatMap((routeItem, index) => {
    if (!routeItem.route_polyline) return [];
    const color = getRouteColor(index);
    return [
      {
        path: decodePolyline(routeItem.route_polyline),
        options: {
          strokeColor: color,
          strokeWeight: 4,
        },
      },
    ];
  });
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
      .filter(
        (stop: any) =>
          typeof stop.latitude === "number" &&
          typeof stop.longitude === "number",
      )
      .map((stop: any, stopIndex: number) => {
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
