import Link from "next/link";
import { HeartPulse } from "lucide-react";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-center px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 transition hover:opacity-80"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-white shadow-md">
            <HeartPulse size={22} />
          </div>

          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Management Sys
            </h1>
            <p className="text-xs text-gray-500">
              Pharmacy
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
