import { JobStatus } from "@/types/job.type";

// Status color mapping
const STATUS_COLORS: Record<JobStatus, string> = {
  draft: "#722ed1", // Bright purple instead of dull gray
  scheduled: "#1677ff",
  in_progress: "#fa8c16",
  completed: "#52c41a",
  cancelled: "#ff4d4f",
};

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
  isSelected: boolean = false
): google.maps.Icon => {
  const color = STATUS_COLORS[status] || STATUS_COLORS.draft;
  const scale = isSelected ? 1.2 : 1;
  const width = 32 * scale;
  const height = 45 * scale;

  // SVG marker icon - teardrop pin with number and dot trail
  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 32 45" xmlns="http://www.w3.org/2000/svg">
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
      <path 
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
      >${number}</text>
      
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
    anchor: new google.maps.Point(width / 2, height - 5), // Anchor at bottom center
  };
};
