import { unreadCount } from "@/db";

export async function AdminBar() {
  const unread = await unreadCount();
  return (
    <p className="mb-6 text-sm text-muted">
      {unread === 0
        ? "Aucune notification en attente."
        : `${unread} notification${unread > 1 ? "s" : ""} non lue${unread > 1 ? "s" : ""}.`}
    </p>
  );
}
