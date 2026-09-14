import { z } from "zod";
import { getAPI } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { validate } from "@/lib/api/validate";
import {
  WarIdDtoSchema,
  WarInfoDtoSchema,
  WarStatusDtoSchema,
  WarSummaryDtoSchema,
  NewsFeedItemDtoSchema,
  type WarIdDto,
  type WarInfoDto,
  type WarStatusDto,
  type WarSummaryDto,
  type NewsFeedItemDto,
} from "@/types/war-metadata";

export async function fetchWarId(): Promise<WarIdDto> {
  const result = await getAPI<unknown>({
    url: ENDPOINTS.WAR_ID.url,
    revalidate: ENDPOINTS.WAR_ID.revalidate,
  });
  if (!result.success) {
    throw new Error(`Failed to fetch war id: ${result.error.message}`);
  }
  return validate(WarIdDtoSchema, result.data, "war id");
}

export async function fetchWarInfo(warId: number | string): Promise<WarInfoDto> {
  const endpoint = ENDPOINTS.WAR_INFO(warId);
  const result = await getAPI<unknown>({
    url: endpoint.url,
    revalidate: endpoint.revalidate,
  });
  if (!result.success) {
    throw new Error(`Failed to fetch war info: ${result.error.message}`);
  }
  return validate(WarInfoDtoSchema, result.data, "war info");
}

export async function fetchWarStatus(
  warId: number | string,
): Promise<WarStatusDto> {
  const endpoint = ENDPOINTS.WAR_STATUS(warId);
  const result = await getAPI<unknown>({
    url: endpoint.url,
    revalidate: endpoint.revalidate,
  });
  if (!result.success) {
    throw new Error(`Failed to fetch war status: ${result.error.message}`);
  }
  return validate(WarStatusDtoSchema, result.data, "war status");
}

export async function fetchWarSummary(
  warId: number | string,
): Promise<WarSummaryDto> {
  const endpoint = ENDPOINTS.WAR_SUMMARY(warId);
  const result = await getAPI<unknown>({
    url: endpoint.url,
    revalidate: endpoint.revalidate,
  });
  if (!result.success) {
    throw new Error(`Failed to fetch war summary: ${result.error.message}`);
  }
  return validate(WarSummaryDtoSchema, result.data, "war summary");
}

export async function fetchNewsFeed(
  warId: number | string,
): Promise<NewsFeedItemDto[]> {
  const endpoint = ENDPOINTS.NEWSFEED(warId);
  const result = await getAPI<unknown>({
    url: endpoint.url,
    revalidate: endpoint.revalidate,
  });
  if (!result.success) {
    throw new Error(`Failed to fetch newsfeed: ${result.error.message}`);
  }
  return validate(z.array(NewsFeedItemDtoSchema), result.data, "newsfeed");
}
