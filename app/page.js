"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShieldCheck, User, ArrowRight, Loader2 } from "lucide-react";

const Page = () => {
  const [mess, setmess] = useState("Plz Login, It Reset EveryMonth!");
  const [form, setform] = useState({
    userid: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let data = async () => {
      let inn = await fetch("/api/clientvalidation");
      let result = await inn.json();

      if (result["status"]) {
        router.push("/pharmacy");
      }
    };

    data();
  }, [router]);

  const handleChange = (e) => {
    setform({ ...form, [e.target.name]: e.target.value });
  };

  const handleEnter = async () => {
    setLoading(true);
    try {
      let data = await fetch("/api/clientvalidation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      let result = await data.json();

      if (result) {
        router.push("/pharmacy");
      }

      if (!result) {
        setmess("User Not Registered in the db, Plz Contact Support");
      }
    } catch (error) {
      setmess("An error occurred. Please try again.");
    } finally {
      setLoading(false);
      setform({
        userid: "",
      });
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden p-8">

        {/* Header Icon & Title */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mb-4 shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Admin / Owner Login
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Enter your User ID to verify your credentials
          </p>
        </div>

        {/* Input Field */}
        <div className="space-y-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <User className="w-5 h-5" />
            </span>
            <input
              type="text"
              placeholder="Enter User ID..."
              value={form.userid}
              name="userid"
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleEnter}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 disabled:opacity-50 text-sm cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Status Message Alert */}
        {mess && (
          <div className={`mt-6 p-3.5 rounded-xl  text-xs text-center font-medium transition-all ${mess.includes("Not Registered") || mess.includes("error")
              ? "bg-rose-500/10 border-rose-500/20 text-rose-400 border"
              : "text-white"
            }`}>
            {mess}
          </div>
        )}

      </div>
    </div>
  );
};

export default Page;