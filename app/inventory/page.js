"use client";

import { useEffect, useState, useCallback } from "react";
import { useDialog } from "../components/DialogProvider";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";

export default function InventoryPage() {
  const { prompt } = useDialog();
  const [data, setData] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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


  const [form, setForm] = useState({
    name: "",
    supplier: "",
    costPrice: "",
    sellingPrice: "",
    stock: "",
    lastUpdatedBy: "",
    password: "",
  });

  // Filter staff to only include those whose position is "pharmacy" (case-insensitive)
  const pharmacyStaff = staffList.filter(
    (s) => s.position && s.position.toLowerCase() === "pharmacy"
  );

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/medicine");
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    }
  }, []);

  useEffect(() => {
    // Fetch staff list
    fetch("/api/employees")
      .then((res) => res.json())
      .then((data) => setStaffList(data))
      .catch((err) => console.error("Failed to load staff list:", err));

    fetchData();
  }, [fetchData]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.name ||
      !form.supplier ||
      !form.costPrice ||
      !form.sellingPrice ||
      !form.stock ||
      !form.lastUpdatedBy ||
      !form.password
    ) {
      alert("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/medicine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await res.json();

      if (result.error) {
        alert(result.error);
      } else {
        fetchData();
        setForm({
          name: "",
          supplier: "",
          costPrice: "",
          sellingPrice: "",
          stock: "",
          lastUpdatedBy: "",
          password: "",
        });
      }
    } catch (error) {
      alert("An error occurred while adding medicine.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStock = async (item) => {
    const qty = await prompt("Quantity to add", "number");
    if (!qty) return;

    // Pass only pharmacy staff to the prompt select component
    const name = await prompt("Select your name", "select", pharmacyStaff);
    if (!name) return;

    const pass = await prompt("Password", "password");
    if (!pass) return;

    await fetch("/api/medicine/stock", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: item.id,
        quantity: qty,
        name,
        password: pass,
      }),
    });

    fetchData();
  };

  const handleUpdatePrice = async (item) => {
    const cost = await prompt("New cost price:", "number");
    if (!cost) return;

    const selling = await prompt("New selling price:", "number");
    if (!selling) return;

    // Pass only pharmacy staff to the prompt select component
    const name = await prompt("Select your name:", "select", pharmacyStaff);
    if (!name) return;

    const pass = await prompt("Password:", "password");
    if (!pass) return;

    const res = await fetch("/api/medicine/price", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: item.id,
        costPrice: Number(cost),
        sellingPrice: Number(selling),
        name,
        password: pass,
      }),
    });

    const result = await res.json();

    if (result.error) {
      alert(result.error);
    } else {
      alert("Price updated successfully");
      fetchData();
    }
  };

  const handleDelete = async (item) => {
    const pass = await prompt("Admin password:", "password");
    if (!pass) return;

    await fetch("/api/medicine/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: item.id,
        password: pass,
      }),
    });

    fetchData();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Inventory Management
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage stock levels, price updates, and medicine logs.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">
            Add New Medicine
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Medicine Name"
              className="px-3 py-2 border rounded-lg text-sm border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="supplier"
              value={form.supplier}
              onChange={handleChange}
              placeholder="Supplier"
              className="px-3 py-2 border rounded-lg text-sm border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              name="costPrice"
              value={form.costPrice}
              onChange={handleChange}
              placeholder="Cost Price"
              className="px-3 py-2 border rounded-lg text-sm border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              name="sellingPrice"
              value={form.sellingPrice}
              onChange={handleChange}
              placeholder="Selling Price"
              className="px-3 py-2 border rounded-lg text-sm border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              placeholder="Stock Quantity"
              className="px-3 py-2 border rounded-lg text-sm border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              name="lastUpdatedBy"
              value={form.lastUpdatedBy}
              onChange={handleChange}
              className="px-3 py-2 border rounded-lg text-sm border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select Pharmacy Staff</option>
              {pharmacyStaff.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Staff Password"
              className="px-3 py-2 border rounded-lg text-sm border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="sm:col-span-2 md:col-span-1 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors duration-200 disabled:opacity-50"
            >
              {isLoading ? "Adding..." : "Add Medicine"}
            </button>
          </form>
        </div>

        {/* Data Table Container */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-xs tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Supplier</th>
                  <th className="p-4">Cost</th>
                  <th className="p-4">Selling</th>
                  <th className="p-4">Updated By</th>
                  <th className="p-4">Updated At</th>
                  <th className="p-4 text-center">Stock</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No inventory records found.
                    </td>
                  </tr>
                ) : (
                  data.map((item) => {
                    const isLowStock = item.stock <= 5;
                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors hover:bg-slate-50/80 ${isLowStock ? "bg-red-50/60" : ""
                          }`}
                      >
                        <td className="p-4 font-medium text-slate-900">
                          {item.name}
                        </td>
                        <td className="p-4">{item.supplier}</td>
                        <td className="p-4">PKR {item.costPrice}</td>
                        <td className="p-4">PKR {item.sellingPrice}</td>
                        <td className="p-4">{item.lastUpdatedBy}</td>
                        <td className="p-4 text-slate-500 text-xs">
                          {item.lastUpdatedAt
                            ? new Date(item.lastUpdatedAt).toLocaleString()
                            : "-"}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${isLowStock
                                ? "bg-red-100 text-red-800"
                                : "bg-emerald-100 text-emerald-800"
                              }`}
                          >
                            {item.stock}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center items-center gap-2">
                            <button
                              onClick={() => handleAddStock(item)}
                              title="Add Stock"
                              className="p-1.5 hover:bg-emerald-100 text-emerald-600 rounded transition-colors"
                            >
                              ➕
                            </button>
                            <button
                              onClick={() => handleUpdatePrice(item)}
                              title="Update Prices"
                              className="p-1.5 hover:bg-amber-100 text-amber-600 rounded transition-colors"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              title="Delete Item"
                              className="p-1.5 hover:bg-red-100 text-red-600 rounded transition-colors"
                            >
                              ❌
                            </button>
                          </div>
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