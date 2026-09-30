import Link from "next/link";
import { AdminBar } from "@/components/admin-bar";
import { getSector, getSolution } from "@/data/catalog";
import { listInquiries, listNotifications } from "@/db";
import { formatWhen, label } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const [inquiries, notifications] = await Promise.all([listInquiries(), listNotifications()]);
  const unread = notifications.filter((item) => !item.readAt);

  return (
    <div className="space-y-8">
      <AdminBar />
      <section>
        <h1 className="font-serif text-3xl">Notifications</h1>
        {unread.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Aucune notification en attente.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line border border-line bg-card">
            {unread.map((item) => (
              <li key={item.id}>
                <Link href={`/admin/${item.inquiryId}`} className="block px-4 py-3 hover:bg-paper">
                  <span className="font-medium">{item.title}</span>
                  <span className="mt-1 block text-sm text-muted">
                    {item.body} · {formatWhen(item.createdAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-serif text-3xl">Demandes</h2>
        {inquiries.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Aucune demande pour le moment.</p>
        ) : (
          <div className="mt-3 overflow-x-auto border border-line bg-card">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-paper text-muted">
                <tr>
                  <th className="px-3 py-2 font-medium">Client</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Classe</th>
                  <th className="px-3 py-2 font-medium">Statut</th>
                  <th className="px-3 py-2 font-medium">Reçue</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inquiry) => {
                  const sector = inquiry.sectorId ? getSector(inquiry.sectorId)?.name : "Secteur ouvert";
                  const solutionNames = inquiry.solutionIds
                    .map((id) => getSolution(id)?.name)
                    .filter(Boolean)
                    .join(", ");
                  return (
                    <tr key={inquiry.id} className="border-t border-line">
                      <td className="px-3 py-3">
                        <Link href={`/admin/${inquiry.id}`} className="underline">
                          {inquiry.fullName}
                        </Link>
                        {inquiry.unread ? (
                          <span className="ml-2 inline-block h-2 w-2 rounded-full bg-clay align-middle" />
                        ) : null}
                        <span className="block text-muted">{inquiry.company}</span>
                      </td>
                      <td className="px-3 py-3">{label(inquiry.kind)}</td>
                      <td className="px-3 py-3">
                        {sector}
                        <span className="block text-muted">{solutionNames || "À qualifier"}</span>
                      </td>
                      <td className="px-3 py-3">{label(inquiry.status)}</td>
                      <td className="px-3 py-3">{formatWhen(inquiry.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
