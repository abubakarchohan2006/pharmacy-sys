"use client"
import Link from "next/link";
import {
  Package,
  ShoppingCart,
  BarChart3,
  Users,
  ArrowRight,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Page = () => {
  const cards = [
    {
      title: "Inventory",
      description:
        "Manage medicines, stock levels, suppliers, and inventory records.",
      href: "/inventory",
      color: "bg-sky-100 text-sky-600",
      button: "bg-sky-500 hover:bg-sky-600",
      icon: <Package size={32} />,
    },
    {
      title: "Sales",
      description:
        "Create bills, process sales, and manage customer transactions.",
      href: "/sales",
      color: "bg-emerald-100 text-emerald-600",
      button: "bg-emerald-500 hover:bg-emerald-600",
      icon: <ShoppingCart size={32} />,
    },
    {
      title: "Reports",
      description:
        "View sales reports, inventory summaries, and business insights.",
      href: "/reports",
      color: "bg-violet-100 text-violet-600",
      button: "bg-violet-500 hover:bg-violet-600",
      icon: <BarChart3 size={32} />,
    },
    {
      title: "Staff",
      description:
        "Manage staff members, roles, permissions, and directory details.",
      href: "/staff",
      color: "bg-amber-100 text-amber-600",
      button: "bg-amber-500 hover:bg-amber-600",
      icon: <Users size={32} />,
    },
  ];
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

  return (
    <>
      <div>
        <Navbar />

        <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-100">
          <div className="mx-auto max-w-7xl px-6 py-12">
            {/* Heading */}
            <div className="mb-12 text-center">
              <span className="mb-3 inline-block rounded-full bg-sky-100 px-4 py-1.5 text-sm font-semibold text-sky-700">
                Admin Portal
              </span>
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                Pharmacy Dashboard
              </h1>
              <p className="mt-3 text-lg text-gray-500">
                Select a module below to manage your pharmacy efficiently.
              </p>
            </div>

            {/* Cards Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {cards.map((card) => (
                <div
                  key={card.title}
                  className="group flex flex-col justify-between rounded-3xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                >
                  <div>
                    <div
                      className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${card.color} transition-transform group-hover:scale-110`}
                    >
                      {card.icon}
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800">
                      {card.title}
                    </h2>

                    <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  <Link href={card.href} className="mt-8 block">
                    <button
                      className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-white transition shadow-sm ${card.button}`}
                    >
                      Open {card.title}
                      <ArrowRight
                        size={18}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Page;