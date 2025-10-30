import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white p-4 shadow-md flex justify-between items-center fixed top-0 left-0 w-full z-50">
      <h1 className="text-2xl font-bold tracking-wide">
        Our Voice, Our Rights
      </h1>

      <nav className="space-x-6">
        <Link
          to="/"
          className="hover:text-yellow-300 transition-colors duration-200"
        >
          Dashboard
        </Link>
        <Link
          to="/compare"
          className="hover:text-yellow-300 transition-colors duration-200"
        >
          Compare Districts
        </Link>
      </nav>
    </header>
  );
}
