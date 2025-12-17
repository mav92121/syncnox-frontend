import { JobStatus } from "@/types/job.type";
import { STATUS_COLORS } from "./jobs.utils";

/**
 * Creates a custom map marker icon as an SVG data URL
 * @param number - The number to display on the marker
 * @param status - The job status for color selection
 * @param isSelected - Whether the marker is selected (for size adjustment)
 * @returns Google Maps Icon configuration
 */
export const createCustomMarkerIcon = (
  number: string | number,
  status: JobStatus,
  isSelected: boolean = false,
  colorOverride?: string,
  isDepot: boolean = false
): google.maps.Icon => {
  const color = isDepot
    ? "#1f2937"
    : colorOverride || STATUS_COLORS[status] || STATUS_COLORS.draft;

  const scale = isSelected ? 1.2 : 1;
  /* 
    Depot markers are square (36x36 base) and centred.
    Stop markers are pins (32x45 base) and bottom-anchored.
    We need consistent base dimensions for scaling but dynamic viewboxes for the SVG content.
  */
  // Base dimensions for the SVG coordinate system
  const baseWidth = 32;
  const baseHeight = isDepot ? 32 : 45; // Depots are square, pins are taller

  // Rendered dimensions
  const width = (isDepot ? 36 : 32) * scale;
  const height = (isDepot ? 36 : 45) * scale;

  // SVG marker icon - teardrop pin with number and dot trail
  const svg = `

    <svg width="${width}" height="${height}" viewBox="0 0 ${baseWidth} ${baseHeight}" xmlns="http://www.w3.org/2000/svg">
      <!-- Drop shadow -->
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.5"/>
          <feOffset dx="0" dy="1" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- Main pin body (teardrop shape) -->
      <!-- Main pin body (teardrop for stops, rounded square for depot) -->
      ${
        isDepot
          ? `<rect x="2" y="2" width="28" height="28" rx="6" fill="${color}" filter="url(#shadow)"/>
           <!-- House Icon -->
           <path d="M16 8L8 15V24H12V20H20V24H24V15L16 8Z" fill="white"/>`
          : `<path 
            d="M16 0C9.4 0 4 5.4 4 12c0 8 12 24 12 24s12-16 12-24c0-6.6-5.4-12-12-12z" 
            fill="${color}"
            filter="url(#shadow)"
          />
          <!-- White circle background for number -->
          <circle cx="16" cy="12" r="8" fill="white"/>
          
          <!-- Number text -->
          <text 
            x="16" 
            y="12" 
            font-family="Arial, sans-serif" 
            font-size="11" 
            font-weight="bold" 
            fill="${color}" 
            text-anchor="middle" 
            dominant-baseline="central"
          >${number}</text>`
      }
      
      <!-- Dot trail -->
      <circle cx="16" cy="38" r="1.5" fill="${color}" opacity="0.6"/>
      <circle cx="16" cy="41" r="1.2" fill="${color}" opacity="0.4"/>
      <circle cx="16" cy="43.5" r="0.8" fill="${color}" opacity="0.2"/>
    </svg>
  `;

  // Convert SVG to data URL
  const dataUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

  return {
    url: dataUrl,
    scaledSize: new google.maps.Size(width, height),
    anchor: new google.maps.Point(width / 2, isDepot ? height / 2 : height - 5), // Center for depot, bottom for pin
  };
};
