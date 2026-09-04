"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import Navbar from "../components/Navbar";
import AppDialog from "../components/AppDialog";
import { useRouter } from "next/navigation";

export default function SalesDashboard() {
  const [sales, setSales] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isadmin, setisadmin] = useState(false);

  const router = useRouter();

  useEffect(() => {
    let data = async () => {
      let inn = await fetch("/api/clientvalidation");
      let result = await inn.json();

      if (result["status"]) {
        console.log("ok")
      } else {
        router.push("/");
      }

    };

    data();
  }, [router]);

  async function checkAdminPassword(password) {
    let inn = await fetch("/api/clientvalidation");
    let result = await inn.json();

    if (!result["status"]) {
      console.log("Unauthorized!");
    } else if (password === result["userid"]) {
      setisadmin(true);
    } else {
      console.log("Unauthorized!");
    }
  }

  // Fetch Sales Data
  const fetchSales = useCallback(async () => {
    try {
      const res = await fetch("/api/sales");
      const data = await res.json();
      setSales(data);
    } catch (err) {
      console.error("Failed to fetch sales:", err);
    }
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  // Cancel / Delete Single Sale
  const deleteSale = async (id) => {
    const pass = prompt("Enter admin password:");
    if (!pass) return;

    try {
      const res = await fetch("/api/sales/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password: pass }),
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
      } else {
        alert("Sale Cancelled");
        fetchSales();
      }
    } catch (err) {
      alert("An error occurred while cancelling sale.");
    }
  };

  // Filtered Sales Computation
  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      if (!fromDate || !toDate) return true;

      const saleDate = new Date(sale.createdAt);
      return (
        saleDate >= new Date(fromDate) &&
        saleDate <= new Date(toDate + "T23:59:59")
      );
    });
  }, [sales, fromDate, toDate]);

  // Cancel Filtered Sales
  const deleteFiltered = async () => {
    if (filteredSales.length === 0) {
      return alert("No sales available in current filter to cancel.");
    }

    const confirmDelete = confirm(
      `Are you sure you want to cancel ${filteredSales.length} sale(s)?`
    );
    if (!confirmDelete) return;

    const pass = prompt("Enter admin password:");
    if (!pass) return;

    const ids = filteredSales.map((s) => s.id);

    try {
      const res = await fetch("/api/sales/delete-many", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, password: pass }),
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
      } else {
        alert("Filtered sales cancelled successfully.");
        fetchSales();
      }
    } catch (err) {
      alert("Error cancelling filtered sales.");
    }
  };

  // Download CSV Export
  const downloadCSV = () => {
    if (filteredSales.length === 0) {
      return alert("No data available to download.");
    }

    const headers = [
      "Bill No",
      "Date",
      "Staff",
      "Medicine",
      "Quantity",
      "Selling Price",
      "Cost Price",
      "Discount",
      "Final Amount",
      "Item Profit",
      "Total Amount",
      "Total Profit",
      "Status",
    ];

    const rows = [];

    filteredSales.forEach((sale) => {
      sale.items.forEach((item) => {
        rows.push([
          `"${sale.billNo}"`,
          `"${new Date(sale.createdAt).toLocaleDateString()}"`,
          `"${sale.staffName || ""}"`,
          `"${item.medicine?.name || "Unknown Medicine"}"`,
          item.quantity,
          item.sellingPrice,
          item.costPrice,
          item.discount || 0,
          item.finalAmount ||
          (item.sellingPrice * item.quantity) - (item.discount || 0),
          item.profit,
          sale.totalAmount,
          sale.totalProfit,
          sale.isCancelled ? "Cancelled" : "Completed",
        ]);
      });
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows]
        .map((row) => row.join(","))
        .join("\n");

    const encodedUri = encodeURI(csvContent);

    const link = document.createElement("a");

    link.setAttribute("href", encodedUri);

    link.setAttribute(
      "download",
      `sales_report_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`
    );

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  // Totals calculations
  const filteredTotalSales = useMemo(() => {
    return filteredSales
      .filter((s) => !s.isCancelled)
      .reduce((acc, s) => acc + s.totalAmount, 0);
  }, [filteredSales]);

  const filteredTotalProfit = useMemo(() => {
    return filteredSales
      .filter((s) => !s.isCancelled)
      .reduce((acc, s) => acc + (s.totalProfit || 0), 0);
  }, [filteredSales]);

  if (!isadmin) {
    return (
      <AppDialog
        title="Admin Password"
        message="Enter The Owner/Admin Userid Plz"
        type="password"
        onSubmit={(password) => {
          checkAdminPassword(password);
        }}
        onCancel={() => {
          <>Failed to Log IN</>
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Sales Analytics
            </h1>
            <p className="text-sm text-slate-500">
              Monitor revenue, profit margins, and manage order logs.
            </p>
          </div>

          {/* Export & Actions */}
          <div className="flex gap-2">
            <button
              onClick={deleteFiltered}
              className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors duration-200"
            >
              Cancel Filtered
            </button>
            <button
              onClick={downloadCSV}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors duration-200"
            >
              Export CSV
            </button>
          </div>
        </header>

        {/* Date Filters Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <span>Filter Date:</span>
          </div>

          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-3 py-1.5 border rounded-lg text-sm border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <span className="text-slate-400">to</span>

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-3 py-1.5 border rounded-lg text-sm border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={() => {
              setFromDate("");
              setToDate("");
            }}
            className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-sm transition-colors"
          >
            Clear Filter
          </button>
        </div>

        {/* KPI Metrics Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-400">
              Total Revenue
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              Rs {filteredTotalSales.toLocaleString()}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-400">
              Total Profit
            </p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              Rs {filteredTotalProfit.toLocaleString()}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-400">
              Orders Count
            </p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {filteredSales.length}
            </p>
          </div>
        </div>

        {/* Sales Orders Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-800">Recent Transactions</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4">Bill #</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Items</th>
                  <th className="p-4 text-right">Total Amount</th>
                  <th className="p-4 text-right">Profit</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No transactions recorded.
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => {
                    const isCancelled = sale.isCancelled;

                    const hasHighDiscount = sale.items.some((item) => {
                      const original = item.sellingPrice * item.quantity;
                      if (!original) return false;
                      const percent = ((item.discount || 0) / original) * 100;
                      return percent > 3;
                    });

                    return (
                      <tr
                        key={sale.id}
                        className={`transition-colors hover:bg-slate-50/80 ${isCancelled
                          ? "bg-slate-100/70 text-slate-400 line-through"
                          : hasHighDiscount
                            ? "bg-amber-50/60"
                            : ""
                          }`}
                      >
                        <td className="p-4 font-mono text-xs font-semibold text-slate-900">
                          {sale.billNo}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          {new Date(sale.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            {sale.items.map((item, i) => {
                              const original = item.sellingPrice * item.quantity;
                              const percent = original
                                ? (((item.discount || 0) / original) * 100).toFixed(1)
                                : 0;

                              return (
                                <div key={i} className="text-xs">
                                  <span className="font-medium text-slate-800">
                                    {item.medicine?.name || "Unknown Medicine"}
                                  </span>{" "}
                                  x{item.quantity}
                                  {Number(percent) > 0 && (
                                    <span className="ml-1 text-[10px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.5 rounded">
                                      {percent}% Off
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </td>
                        <td className="p-4 text-right font-medium text-slate-900 whitespace-nowrap">
                          Rs {sale.totalAmount}
                        </td>
                        <td className="p-4 text-right text-emerald-600 font-medium whitespace-nowrap">
                          Rs {sale.totalProfit || 0}
                        </td>
                        <td className="p-4 text-center">
                          {!isCancelled ? (
                            <button
                              onClick={() => deleteSale(sale.id)}
                              className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
                              title="Cancel Sale"
                            >
                              ❌
                            </button>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-200 text-slate-600 no-underline">
                              Cancelled
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}