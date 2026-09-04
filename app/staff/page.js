"use client"

import { useEffect, useState } from "react"
import { Trash2, UserPlus, ShieldAlert, Users, Lock, User, Briefcase } from "lucide-react"
import Navbar from "../components/Navbar"
import { useRouter } from "next/navigation"

const page = () => {
  const [form, setform] = useState({
    name: "",
    position: "",
    password: "",
    userid: ""
  })

  const [deluserid, setdeluserid] = useState("")
  const [owner, setowner] = useState("")
  const [employeedata, setemployeedata] = useState([])

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

  const getEmployees = async () => {
    const data = await fetch("/api/employees")
    const result = await data.json()

    setemployeedata(result)
  }

  const handleChange = (e) => {
    setform({ ...form, [e.target.name]: e.target.value })
  }

  const handleEnter = async () => {
    let data = await fetch("/api/employees", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    setform({
      name: "",
      position: "",
      password: "",
      userid: ""
    })

    await getEmployees()
  }

  useEffect(() => {
    getEmployees()
  }, [])

  const employeedelete = async (e) => {
    e["userid"] = deluserid

    let data = await fetch("/api/employees", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(e),
    });

    await getEmployees()
  }

  const handleOwnerDel = async () => {
    let data = await fetch("/api/clientvalidation", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(owner),
    });

    setowner("")
  }

  const handleDel = (e) => {
    setdeluserid(e.target.value)
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 p-6 md:p-12 text-slate-800">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Employee Management</h1>
            <p className="text-sm text-slate-500 mt-1">Add staff members, assign positions, and manage administrative settings.</p>
          </div>

          {/* Admin / Owner Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-4 text-rose-600 font-semibold">
              <ShieldAlert className="w-5 h-5" />
              <h2>Danger Zone: Owner Deletion</h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="owner"
                  placeholder="Enter the User ID Of the Owner/Admin"
                  value={owner}
                  onChange={(e) => { setowner(e.target.value) }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm transition-all"
                />
              </div>
              <button
                type="button"
                onClick={() => handleOwnerDel()}
                className="bg-rose-600 hover:bg-rose-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-sm shadow-rose-600/20 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Delete Owner
              </button>
            </div>
          </div>

          {/* Add Employee Form */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 font-semibold">
              <UserPlus className="w-5 h-5" />
              <h2>Add New Employee</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  onChange={(e) => handleChange(e)}
                  value={form.name}
                  name="name"
                  placeholder="Full Name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
                />
              </div>

              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  onChange={(e) => handleChange(e)}
                  value={form.position}
                  name="position"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm bg-white transition-all appearance-none text-slate-700"
                >
                  <option value="">Select Position</option>
                  <option value="sales">Sales</option>
                  <option value="pharmacy">Pharmacy</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  onChange={(e) => handleChange(e)}
                  value={form.password}
                  name="password"
                  placeholder="Password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
                />
              </div>
            </div>

            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                onChange={(e) => handleChange(e)}
                value={form.userid}
                name="userid"
                placeholder="Enter the Owner userid, only Owner can add"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => { handleEnter() }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2 shadow-sm shadow-indigo-600/20 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                Save Employee
              </button>
            </div>
          </div>

          {/* Employee Directory List */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 font-semibold">
                <Users className="w-5 h-5 text-indigo-600" />
                <h2>Employee Directory ({employeedata.length})</h2>
              </div>

              {/* Global or bulk delete user ID verification if needed */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  name="deluserid"
                  placeholder="Admin ID for deletion"
                  value={deluserid}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  onChange={(e) => handleDel(e)}
                />
              </div>
            </div>

            {employeedata.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm border border-dashed border-slate-200 rounded-xl">
                No employees found. Add one above.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {employeedata.map((e) => (
                  <div key={e.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-slate-50/50">
                    <div className="space-y-1">
                      <div className="font-semibold text-slate-900">{e.name}</div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 capitalize">
                        {e.position || "Unassigned"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { employeedelete(e) }}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete employee"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}

export default page
