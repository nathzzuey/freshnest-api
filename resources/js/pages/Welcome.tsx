import React from "react";
import { router, Link } from "@inertiajs/react";

const Welcome = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50">
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-5xl">
          <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-[32px] overflow-hidden border border-white/70">
            <div className="grid md:grid-cols-2">
              {/* Left Content */}
              <div className="flex flex-col justify-center px-8 py-14 md:px-14 lg:px-16">
                <p className="inline-block w-fit mb-5 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold tracking-wide">
                  FreshNest
                </p>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-800 leading-tight">
                  Book Clean,
                  <span className="block text-emerald-600">Live Fresh</span>
                </h1>

                <p className="mt-6 text-base md:text-lg text-slate-600 leading-8 max-w-xl">
                  Experience simple and reliable cleaning service booking with
                  FreshNest. Manage appointments faster and keep every space
                  fresh, clean, and stress-free.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/admin/login"
                    className="px-7 py-3.5 rounded-xl bg-emerald-600 text-white font-semibold shadow-md hover:bg-emerald-700 transition duration-200"
                  >
                    Admin Login
                  </Link>
                </div>
              </div>

              {/* Right Content / Logo */}
              <div className="relative flex items-center justify-center bg-gradient-to-br from-sky-100 via-white to-emerald-100 px-8 py-14 md:px-10">
                <div className="absolute w-72 h-72 md:w-96 md:h-96 bg-emerald-200/40 rounded-full blur-3xl"></div>

                <div className="relative bg-white/80 border border-white shadow-xl rounded-[28px] p-8 md:p-10 flex items-center justify-center">
                  <img
                    src="/images/logo.png"
                    alt="FreshNest Logo"
                    className="w-56 md:w-72 lg:w-80 object-contain drop-shadow-md"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Optional small footer text */}
          <p className="text-center text-slate-500 text-sm mt-6">
            Professional cleaning solutions for a cleaner, fresher lifestyle.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;

