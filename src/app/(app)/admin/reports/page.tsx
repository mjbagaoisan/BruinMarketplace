"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

type Report = {
  id: number;
  listing_id: number | null;
  reported_user_id: string | null;
  reporter_id: string;
  reason: string;
  notes: string | null;
  status: "open" | "in_review" | "resolved";
  created_at: string;
  reported_user?: {
    id: string;
    is_suspended: boolean;
  } | null;
};

export default function AdminReportsPage() {
  const { user, isLoading } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadReports() {
    setLoadingReports(true);
    setError(null);

    try {
      const base = process.env.NEXT_PUBLIC_API_URL;
      if (!base) throw new Error("API URL not configured");

      const res = await fetch(`${base}/api/admin/reports`, {
        credentials: "include",
      });

      if (res.status === 401 || res.status === 403) {
        throw new Error("Not authorized");
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load reports");
      }

      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to load reports");
      setReports([]);
    } finally {
      setLoadingReports(false);
    }
  }

  useEffect(() => {
    if (!isLoading && user?.role === "admin") {
      loadReports();
    }
  }, [isLoading, user]);

  if (isLoading) return <div className="p-6">Loading...</div>;

  if (!user || user.role !== "admin") {
    return (
      <div className="p-6">
        <p>You do not have access to this page.</p>
      </div>
    );
  }

  async function updateStatus(id: number, status: Report["status"]) {
    try {
      const base = process.env.NEXT_PUBLIC_API_URL!;
      const res = await fetch(`${base}/api/admin/reports/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update status");
      }

      await loadReports();
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  }

  async function removeListing(report: Report) {
    if (!report.listing_id) return;
    if (!confirm("Remove this listing?")) return;

    try {
      const base = process.env.NEXT_PUBLIC_API_URL!;
      const res = await fetch(
        `${base}/api/admin/listings/${report.listing_id}/remove`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ reportId: report.id }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to remove listing");
      }

      await loadReports();
    } catch (err: any) {
      alert(err.message || "Failed to remove listing");
    }
  }

  async function suspendUser(report: Report) {
    if (!report.reported_user_id) return;
    if (!confirm("Suspend this user?")) return;

    try {
      const base = process.env.NEXT_PUBLIC_API_URL!;
      const res = await fetch(
        `${base}/api/admin/users/${report.reported_user_id}/suspend`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ reportId: report.id }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to suspend user");
      }

      await loadReports();
    } catch (err: any) {
      alert(err.message || "Failed to suspend user");
    }
  }

  async function unsuspendUser(report: Report) {
    if (!report.reported_user_id) return;
    if (!confirm("Unsuspend this user?")) return;

    try {
      const base = process.env.NEXT_PUBLIC_API_URL!;
      const res = await fetch(
        `${base}/api/admin/users/${report.reported_user_id}/unsuspend`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to unsuspend user");
      }

      await loadReports();
    } catch (err: any) {
      alert(err.message || "Failed to unsuspend user");
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Reports</h1>
        <Button variant="outline" size="sm" onClick={loadReports}>
          Refresh
        </Button>
      </div>

      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

      {loadingReports ? (
        <p>Loading reports...</p>
      ) : reports.length === 0 ? (
        <p>No reports yet.</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-2">ID</th>
              <th className="text-left p-2">Target</th>
              <th className="text-left p-2">Reason</th>
              <th className="text-left p-2">Notes</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="p-2">{r.id}</td>
                <td className="p-2">
                  {r.listing_id
                    ? `Listing #${r.listing_id}`
                    : r.reported_user_id
                    ? `User ${r.reported_user_id}`
                    : "N/A"}
                </td>
                <td className="p-2">{r.reason}</td>
                <td className="p-2 max-w-xs truncate" title={r.notes || ""}>
                  {r.notes}
                </td>
                <td className="p-2">{r.status}</td>
                <td className="p-2 space-x-2">
                  {r.status !== "in_review" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateStatus(r.id, "in_review")}
                    >
                      In review
                    </Button>
                  )}
                  {r.status !== "resolved" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateStatus(r.id, "resolved")}
                    >
                      Resolve
                    </Button>
                  )}
                  {r.listing_id && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-700"
                      onClick={() => removeListing(r)}
                    >
                      Remove listing
                    </Button>
                  )}

                  {r.reported_user_id && r.reported_user && (
                    <span className="inline-flex gap-2">
                      {r.reported_user.is_suspended ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => unsuspendUser(r)}
                        >
                          Unsuspend user
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs text-red-700"
                          onClick={() => suspendUser(r)}
                        >
                          Suspend user
                        </Button>
                      )}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
