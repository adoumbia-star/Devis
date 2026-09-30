import { jsonStore } from "@/db/json-store";
import * as neonStore from "@/db/neon-store";
import { databaseUrl } from "@/db/url";
import type { ContactChannel, InquiryInput, InquiryStatus, ProposalStatus } from "@/lib/types";

function neonEnabled() {
  return Boolean(databaseUrl());
}

export function storageMode() {
  return neonEnabled() ? "neon" : "local";
}

export async function createInquiry(input: InquiryInput) {
  if (neonEnabled()) return neonStore.createInquiry(input);
  return jsonStore.createInquiry(input);
}

export async function listInquiries() {
  if (neonEnabled()) return neonStore.listInquiries();
  return jsonStore.listInquiries();
}

export async function unreadCount() {
  if (neonEnabled()) return neonStore.unreadCount();
  return jsonStore.unreadCount();
}

export async function listNotifications() {
  if (neonEnabled()) return neonStore.listNotifications();
  return jsonStore.listNotifications();
}

export async function getInquiry(id: string) {
  if (neonEnabled()) return neonStore.getInquiry(id);
  return jsonStore.getInquiry(id);
}

export async function markRead(id: string) {
  if (neonEnabled()) return neonStore.markRead(id);
  return jsonStore.markRead(id);
}

export async function saveProposal(proposalId: string, body: string, status: ProposalStatus) {
  if (neonEnabled()) return neonStore.saveProposal(proposalId, body, status);
  return jsonStore.saveProposal(proposalId, body, status);
}

export async function logContact(inquiryId: string, proposalId: string | null, channel: ContactChannel) {
  if (neonEnabled()) return neonStore.logContact(inquiryId, proposalId, channel);
  return jsonStore.logContact(inquiryId, proposalId, channel);
}

export async function setStatus(inquiryId: string, status: InquiryStatus) {
  if (neonEnabled()) return neonStore.setStatus(inquiryId, status);
  return jsonStore.setStatus(inquiryId, status);
}
