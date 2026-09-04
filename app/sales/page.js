"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";

export default function SalesPage() {
  const [medicines, setMedicines] = useState([]);
  const [selectedMed, setSelectedMed] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [staffList, setStaffList] = useState([]);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const [cart, setCart] = useState([]);
  const [currentDate, setCurrentDate] = useState("");
  const [billNo, setBillNo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [receiptData, setReceiptData] = useState(null);

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

  // Filter staff to only include those whose position is "sales" (case-insensitive)
  const salesStaff = staffList.filter(
    (s) => s.position && s.position.toLowerCase() === "sales"
  );

  // Fetch medicines list
  const fetchMedicines = useCallback(async () => {
    try {
      const res = await fetch("/api/medicine");
      const data = await res.json();
      setMedicines(data);
    } catch (err) {
      console.error("Failed to load medicines", err);
    }
  }, []);

  useEffect(() => {
    fetch("/api/employees")
      .then((res) => res.json())
      .then((data) => setStaffList(data))
      .catch((err) => console.error("Failed to load staff", err));

    fetchMedicines();
    setCurrentDate(new Date().toLocaleString());
  }, [fetchMedicines]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleAfterPrint = () => {
      setCart([]);
      setBillNo(null);
      setReceiptData(null);
      fetchMedicines();
    };

    window.addEventListener("afterprint", handleAfterPrint);
    return () => {
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [fetchMedicines]);

  const filteredMedicines = medicines.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectMedicine = (med) => {
    setSelectedMed(med);
    setSearchQuery(med.name);
    setIsDropdownOpen(false);
  };

  const addToCart = () => {
    if (!selectedMed) return alert("Please select a medicine");
    if (quantity <= 0) return alert("Enter a valid quantity");

    const existingItem = cart.find(
      (item) => item.medicineId === selectedMed.id
    );

    const alreadyAddedQty = existingItem ? existingItem.quantity : 0;
    const remainingStock = selectedMed.stock - alreadyAddedQty;

    if (quantity > remainingStock) {
      return alert(`Only ${remainingStock} unit(s) remaining in stock.`);
    }

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.medicineId === selectedMed.id
            ? {
              ...item,
              quantity: item.quantity + quantity,
              discount: item.discount + discount,
            }
            : item
        )
      );
    } else {
      setCart((prev) => [
        ...prev,
        {
          medicineId: selectedMed.id,
          name: selectedMed.name,
          quantity,
          sellingPrice: selectedMed.sellingPrice,
          costPrice: selectedMed.costPrice,
          discount,
        },
      ]);
    }

    setSelectedMed(null);
    setSearchQuery("");
    setQuantity(1);
    setDiscount(0);
  };

  const removeItem = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const totalAmount = cart.reduce(
    (acc, item) => acc + (item.sellingPrice * item.quantity - item.discount),
    0
  );

  const submitSale = async () => {
    if (cart.length === 0) return alert("Cart is empty");
    if (!name || !password)
      return alert("Please enter staff credentials");

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cart,
          name,
          password,
        }),
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      // Prepare receipt data
      const currentReceipt = {
        billNo: data.billNo,
        items: [...cart],
        total: totalAmount,
        staff: name,
        date: new Date().toLocaleString(),
      };

      setReceiptData(currentReceipt);
      setBillNo(data.billNo);

      // Give React time to render the print DOM structure, then call Electron bridge
      setTimeout(() => {
        if (window.electronAPI) {
          window.electronAPI.printReceipt(currentReceipt);
        } else {
          window.print(); // Fallback for standard browsers
        }
      }, 500);

      // Increased timeout to allow Electron rendering engine to mount the receipt container
      setTimeout(() => {
        window.print();
      }, 500);
    } catch (err) {
      console.error(err);
      alert("Error processing sale");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Strict Electron Print Stylesheet */}
      <style jsx global>{`
        @media print {
          html, body {
            background: transparent !important;
            height: auto !important;
            overflow: visible !important;
          }
          body * {
            visibility: hidden !important;
          }
          #print-area, #print-area * {
            visibility: visible !important;
          }
          #print-area {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>

      {/* Main app UI hidden during print */}
      <div className="print:hidden">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          <header className="border-b border-slate-200 pb-4">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Point of Sale
            </h1>
            <p className="text-sm text-slate-500">
              Process customer transactions and generate receipts.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT COLUMN: Controls & Selection */}
            <div className="space-y-6 lg:col-span-1">
              {/* Staff Authentication */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                  1. Staff Authorization
                </h2>
                <div className="space-y-3">
                  <select
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select Staff Name</option>
                    {salesStaff.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="password"
                    placeholder="Staff Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Medicine Add Section */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                  2. Select Items
                </h2>

                <div className="space-y-3">
                  <div className="relative" ref={dropdownRef}>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Search Medicine
                    </label>
                    <input
                      type="text"
                      placeholder="Type medicine name..."
                      value={searchQuery}
                      onFocus={() => setIsDropdownOpen(true)}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setSelectedMed(null);
                        setIsDropdownOpen(true);
                      }}
                      className="w-full px-3 py-2 border rounded-lg text-sm border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />

                    {isDropdownOpen && (
                      <div className="absolute z-20 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg">
                        {filteredMedicines.length > 0 ? (
                          filteredMedicines.map((m) => (
                            <div
                              key={m.id}
                              onClick={() => handleSelectMedicine(m)}
                              className="px-3 py-2 text-sm hover:bg-slate-100 cursor-pointer flex justify-between items-center border-b border-slate-50 last:border-0"
                            >
                              <span className="font-medium text-slate-800">
                                {m.name}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded ${m.stock > 0
                                  ? "bg-slate-100 text-slate-600"
                                  : "bg-red-100 text-red-600 font-semibold"
                                  }`}
                              >
                                Stock: {m.stock}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-xs text-slate-400 text-center">
                            No medicine found
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg text-sm border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        Discount (Rs)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg text-sm border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {selectedMed && (
                    <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1 text-slate-600">
                      <div>
                        Price:{" "}
                        <span className="font-semibold text-slate-800">
                          Rs {selectedMed.sellingPrice}
                        </span>
                      </div>
                      <div>
                        Available Stock:{" "}
                        <span className="font-semibold text-slate-800">
                          {selectedMed.stock}
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={addToCart}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-lg text-sm transition-colors duration-200"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Cart & Summary */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                  <h2 className="font-semibold text-slate-800">
                    Current Cart Items
                  </h2>
                  <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-medium">
                    {cart.length} {cart.length === 1 ? "Item" : "Items"}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 font-semibold text-xs uppercase border-b border-slate-200">
                      <tr>
                        <th className="p-3">Item</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Price</th>
                        <th className="p-3 text-right">Discount</th>
                        <th className="p-3 text-right">Subtotal</th>
                        <th className="p-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {cart.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="p-8 text-center text-slate-400"
                          >
                            No items added to cart yet.
                          </td>
                        </tr>
                      ) : (
                        cart.map((item, i) => (
                          <tr key={i} className="hover:bg-slate-50/80">
                            <td className="p-3 font-medium text-slate-900">
                              {item.name}
                            </td>
                            <td className="p-3 text-center">{item.quantity}</td>
                            <td className="p-3 text-right">
                              Rs {item.sellingPrice}
                            </td>
                            <td className="p-3 text-right text-red-500">
                              {item.discount > 0 ? `-Rs ${item.discount}` : "-"}
                            </td>
                            <td className="p-3 text-right font-medium text-slate-900">
                              Rs{" "}
                              {item.sellingPrice * item.quantity - item.discount}
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => removeItem(i)}
                                className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                title="Remove item"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Total & Checkout Area */}
                <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-4">
                  <div className="flex justify-between items-center text-lg font-bold text-slate-900">
                    <span>Total Amount:</span>
                    <span className="text-2xl text-emerald-600">
                      Rs {totalAmount}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={submitSale}
                      disabled={isSubmitting || cart.length === 0}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors duration-200 disabled:opacity-50"
                    >
                      {isSubmitting ? "Processing..." : "Complete Sale"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* THERMAL PRINT AREA */}
      <div
        id="print-area"
        className="hidden text-black font-mono text-xs max-w-[270px] mx-auto leading-tight bg-white"
      >
        {receiptData && (
          <div className="p-2">
            <div className="text-center space-y-1 mb-2">
              <h2 className="text-sm font-bold uppercase">My Pharmacy</h2>
              <p className="text-[10px]">Official Receipt</p>
              <div className="border-b border-dashed border-black my-1"></div>
            </div>

            <div className="space-y-0.5 mb-2 text-[10px]">
              <p>Bill #: {receiptData.billNo}</p>
              <p>Date: {receiptData.date}</p>
              <p>Served By: {receiptData.staff}</p>
            </div>

            <div className="border-b border-dashed border-black my-1"></div>

            <div className="space-y-1">
              {receiptData.items.map((item, i) => (
                <div key={i} className="flex justify-between text-[10px]">
                  <span className="max-w-[150px] truncate">
                    {item.name} x{item.quantity}
                  </span>
                  <span>
                    Rs {item.sellingPrice * item.quantity - item.discount}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-b border-dashed border-black my-1"></div>

            <div className="flex justify-between font-bold text-xs">
              <span>TOTAL:</span>
              <span>Rs {receiptData.total}</span>
            </div>

            <div className="border-b border-dashed border-black my-1"></div>

            <p className="text-center text-[10px] mt-2">
              Thank you for your purchase!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}