"use client";

import React from "react";
import { MdMenu, MdClose } from "react-icons/md";

const SideBar = () => {
  const [open, setOpen] = React.useState(false);

  const NavLinks = () => (
    <nav className="mt-6 px-4 space-y-2">
      <a href="home" className="block p-2 rounded transition hover:bg-gray-100">
        Home
      </a>
      <a href="dashboard" className="block p-2 rounded transition hover:bg-gray-100">
        Dashboard
      </a>
      <a href="#" className="block p-2 rounded transition hover:bg-gray-100">
        Task
      </a>
    </nav>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        aria-label="Open sidebar"
        className="md:hidden fixed top-3 left-3 z-40 inline-flex items-center justify-center rounded-md border bg-white/80 p-2 shadow-sm backdrop-blur transition hover:bg-white"
        onClick={() => setOpen(true)}
      >
        <MdMenu size={20} />
      </button>

      {/* Desktop static sidebar */}
      <aside className="hidden md:block w-64 bg-white border-r h-full sticky top-0">
        <div className="p-4 text-lg font-bold">VetBot</div>
        <NavLinks />
      </aside>

      {/* Mobile off-canvas */}
      <div
        className={`md:hidden fixed inset-0 z-50 transition ${open ? "visible" : "invisible"}`}
        aria-hidden={!open}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/30 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)}
        />
        {/* Panel */}
        <aside
          className={`absolute left-0 top-0 h-full w-64 bg-white border-r shadow-lg transform transition-transform ${open ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center justify-between p-4">
            <div className="text-lg font-bold">VetBot</div>
            <button
              aria-label="Close sidebar"
              className="inline-flex items-center justify-center rounded-md p-1 hover:bg-gray-100"
              onClick={() => setOpen(false)}
            >
              <MdClose size={20} />
            </button>
          </div>
          <NavLinks />
        </aside>
      </div>
    </>
  );
};

export default SideBar;
