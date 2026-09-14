import { cache } from "react";
import {
  fetchWarId,
  fetchWarInfo,
  fetchWarStatus,
  fetchWarSummary,
  fetchNewsFeed,
} from "@/lib/services/war-metadata";
import {
  mapWarInfoDto,
  mapWarStatusDto,
  mapWarSummaryDto,
  mapNewsFeedItems,
  type WarMetadata,
  type WarStatusView,
  type GalaxySummary,
  type SuperEarthNewsItem,
} from "@/lib/transformers/war-metadata";

// Every raw endpoint is keyed by the current war season id, which is itself a
// request. Caching the resolved id means the four war-metadata loaders below
// share one lookup per render instead of each fetching it.
async function _getWarId(): Promise<number | null> {
  try {
    const dto = await fetchWarId();
    return dto.id;
  } catch (error) {
    console.error("getWarId failed:", error);
    return null;
  }
}

async function _getWarMetadata(): Promise<WarMetadata | null> {
  try {
    const warId = await _getWarId();
    if (warId === null) return null;
    const dto = await fetchWarInfo(warId);
    return mapWarInfoDto(dto);
  } catch (error) {
    console.error("getWarMetadata failed:", error);
    return null;
  }
}

async function _getWarStatus(): Promise<WarStatusView | null> {
  try {
    const warId = await _getWarId();
    if (warId === null) return null;
    const dto = await fetchWarStatus(warId);
    return mapWarStatusDto(dto);
  } catch (error) {
    console.error("getWarStatus failed:", error);
    return null;
  }
}

async function _getGalaxySummary(): Promise<GalaxySummary | null> {
  try {
    const warId = await _getWarId();
    if (warId === null) return null;
    const dto = await fetchWarSummary(warId);
    return mapWarSummaryDto(dto);
  } catch (error) {
    console.error("getGalaxySummary failed:", error);
    return null;
  }
}

async function _getSuperEarthNews(): Promise<SuperEarthNewsItem[] | null> {
  try {
    const warId = await _getWarId();
    if (warId === null) return null;
    const [items, metadata] = await Promise.all([
      fetchNewsFeed(warId),
      _getWarMetadata(),
    ]);
    return mapNewsFeedItems(items, metadata?.startDate ?? null);
  } catch (error) {
    console.error("getSuperEarthNews failed:", error);
    return null;
  }
}

export const getWarId = cache(_getWarId);
export const getWarMetadata = cache(_getWarMetadata);
export const getWarStatus = cache(_getWarStatus);
export const getGalaxySummary = cache(_getGalaxySummary);
export const getSuperEarthNews = cache(_getSuperEarthNews);
