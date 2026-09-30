"use server";

import { redirect } from "next/navigation";
import { endSession, isAdmin, startSession } from "@/lib/auth";
import { logContact, saveProposal, setStatus } from "@/db";
import type { ContactChannel, InquiryStatus, ProposalStatus } from "@/lib/types";

export type LoginState = { error: string } | null;

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  const result = await startSession(password);
  if (result.error) return { error: result.error };
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Session administrateur requise.");
}

export async function updateProposal(proposalId: string, body: string, status: ProposalStatus) {
  await requireAdmin();
  await saveProposal(proposalId, body, status);
}

export async function recordContact(inquiryId: string, proposalId: string | null, channel: ContactChannel) {
  await requireAdmin();
  await logContact(inquiryId, proposalId, channel);
}

export async function updateStatus(inquiryId: string, status: InquiryStatus) {
  await requireAdmin();
  await setStatus(inquiryId, status);
}
