import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <Link
            href="/"
            className="text-2xl font-bold text-blue-600"
          >
            VolunteerGrid
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 font-medium text-slate-700 hover:bg-slate-100"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700"
            >
              Register
            </Link>
          </div>

        </div>
      </nav>

      {/* Hero */}
      <section className="bg-white">
        <div className="mx-auto flex min-h-[600px] max-w-7xl items-center px-6 py-20">

          <div className="max-w-3xl">

            <div className="mb-6 inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600">
              Connecting people with purpose
            </div>

            <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-6xl">
              Volunteer your time.
              <br />
              <span className="text-blue-600">
                Create real impact.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              VolunteerGrid connects passionate volunteers with NGOs and
              meaningful volunteering opportunities. Find causes you care
              about and make a difference in your community.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">

              <Link
                href="/register"
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Get Started
              </Link>

              <Link
                href="/login"
                className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-100"
              >
                Sign In
              </Link>

            </div>

          </div>

        </div>
      </section>

      {/* Features */}
      <section className="py-20">

        <div className="mx-auto max-w-7xl px-6">

          <div className="mx-auto max-w-2xl text-center">

            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              One platform
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Everyone has a role in creating change
            </h2>

            <p className="mt-4 text-slate-600">
              VolunteerGrid brings volunteers, NGOs and administrators
              together in one platform.
            </p>

          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">

            {/* Volunteer */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                🤝
              </div>

              <h3 className="mt-6 text-xl font-bold">
                Volunteers
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                Discover volunteering opportunities that match your
                interests and skills. Contribute your time and make an
                impact.
              </p>

            </div>

            {/* NGO */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-2xl">
                🌱
              </div>

              <h3 className="mt-6 text-xl font-bold">
                NGOs
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                Connect with passionate volunteers and manage your
                organization's service requirements.
              </p>

            </div>

            {/* Admin */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-2xl">
                🛡️
              </div>

              <h3 className="mt-6 text-xl font-bold">
                Administrators
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                Verify organizations, manage users and maintain a trusted
                volunteering ecosystem.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* Call to action */}
      <section className="bg-blue-600 py-20">

        <div className="mx-auto max-w-4xl px-6 text-center text-white">

          <h2 className="text-3xl font-bold md:text-4xl">
            Ready to make a difference?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-blue-100">
            Join VolunteerGrid and connect with opportunities that matter.
          </p>

          <Link
            href="/register"
            className="mt-8 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-blue-600 hover:bg-blue-50"
          >
            Join VolunteerGrid
          </Link>

        </div>

      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">

        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-slate-500">

          © {new Date().getFullYear()} VolunteerGrid. All rights reserved.

        </div>

      </footer>

    </main>
  );
}