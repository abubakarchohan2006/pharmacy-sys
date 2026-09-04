"use client";

import { createContext, useContext, useState } from "react";

const DialogContext = createContext();

export function DialogProvider({ children }) {
  const [dialog, setDialog] = useState(null);

  // type can be "text", "number", "password", or "select"
  // options can be passed if type is "select" (e.g., staff list of strings or objects)
  function prompt(message, type = "text", options = []) {
    return new Promise((resolve) => {
      setDialog({
        type,
        message,
        options,
        resolve,
      });
    });
  }

  function close(value) {
    dialog?.resolve(value);
    setDialog(null);
  }

  return (
    <DialogContext.Provider value={{ prompt }}>
      {children}

      {dialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 shadow-xl">
            <h2 className="font-bold text-lg mb-4 text-slate-800">
              {dialog.message}
            </h2>

            {dialog.type === "select" ? (
              <select
                autoFocus
                id="dialog-input"
                className="border p-2 w-full rounded bg-white text-slate-800"
              >
                <option value="">Select an option</option>
                {dialog.options.map((opt, index) => {
                  // Support both array of strings and array of objects (e.g. { id, name })
                  const isObject = typeof opt === "object" && opt !== null;
                  const value = isObject ? opt.name ?? opt.id : opt;
                  const label = isObject ? opt.name ?? opt.id : opt;
                  const key = isObject ? opt.id ?? index : opt;

                  return (
                    <option key={key} value={value}>
                      {label}
                    </option>
                  );
                })}
              </select>
            ) : (
              <input
                autoFocus
                type={dialog.type}
                id="dialog-input"
                className="border p-2 w-full rounded text-slate-800"
              />
            )}

            <div className="flex gap-3 mt-6 justify-end">
              <button
                className="bg-gray-200 hover:bg-gray-300 text-slate-700 px-4 py-2 rounded transition-colors"
                onClick={() => {
                  close(null);
                }}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                onClick={() => {
                  const value = document.getElementById("dialog-input").value;
                  close(value);
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  return useContext(DialogContext);
}