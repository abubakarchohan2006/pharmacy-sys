"use client";

import { useState } from "react";

export default function AppDialog({
  title,
  message,
  type = "text",
  onSubmit,
  onCancel,
}) {
  const [value, setValue] = useState("");

  function submit() {
    onSubmit(value);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">

      <div className="bg-white p-6 rounded-lg w-96">

        <h2 className="text-xl font-bold">
          {title}
        </h2>

        <p className="my-3">
          {message}
        </p>


        {type !== "confirm" && (
          <input
            className="border p-2 w-full"
            type={type}
            value={value}
            onChange={(e)=>setValue(e.target.value)}
          />
        )}


        <div className="flex gap-3 mt-4">

          <button
            onClick={submit}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            OK
          </button>


          <button
            onClick={onCancel}
            className="bg-gray-300 px-4 py-2 rounded"
          >
            Cancel
          </button>

        </div>

      </div>

    </div>
  );
}