// components/ChartExporter.tsx

"use client";

import html2canvas from "html2canvas";

/**
 * Utility to capture a chart by DOM ID and return a base64 PNG string.
 * @param elementId - ID of the DOM element (chart container)
 */
export async function exportChartAsImage(
  elementId: string
): Promise<string | null> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Chart element with id '${elementId}' not found.`);
    return null;
  }

  try {
    // Using `as any` to bypass typing issues with html2canvas options
    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 2,
    } as any);

    return canvas.toDataURL("image/png");
  } catch (err) {
    console.error("Error capturing chart as image:", err);
    return null;
  }
}
