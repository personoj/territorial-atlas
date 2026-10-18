import { useMemo } from "react";
import type { GeographicPlanningMap, SearchResult } from "../map";

export function usePlaceSearch(
  map: GeographicPlanningMap | null,
  query: string,
): SearchResult[] {
  return useMemo(
    () =>
      map?.search(query).map((feature) => {
        const level = feature.get("level");
        const kind =
          level === "province"
            ? "省域"
            : feature.get("capitalKind") && feature.get("capital")
              ? feature.get("capitalKind")
              : feature.get("municipality")
                ? "直辖市"
                : feature.get("capital")
                  ? "省会"
                  : level === "county"
                    ? "区县"
                    : feature.get("subdivisionLabel") || "城市";
        return {
          feature,
          name: feature.get("name") as string,
          key: `${feature.get("regionId") || ""}:${level}:${feature.get("adcode")}`,
          description:
            level === "province"
              ? kind
              : `${feature.get("regionName") || ""} · ${kind}`,
        };
      }) ?? [],
    [map, query],
  );
}
