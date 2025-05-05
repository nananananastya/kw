import Link from "next/link";

export function SigninLink() {
  return (
    <nav className="bg-gradient-to-r from-purple-500 to-pink-500 py-4 shadow-lg rounded-b-2xl">
      <div className="container mx-auto flex items-center justify-between px-4">
        <div className="flex-1">
        </div>
        <div className="flex-none">
          <ul className="flex space-x-6">
            <li>
              <Link
                href="/api/auth/signin"
                className="text-white hover:text-gray-200 transition-colors btn btn-ghost"  
              >
                Sign in
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}