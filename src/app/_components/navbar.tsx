"use client";

import { type Session } from "next-auth";
import { signOut } from "next-auth/react";
import Link from "next/link";

export function Navbar({ session }: { session: Session}) {
  return (
    <nav className="bg-gradient-to-r from-purple-500 to-pink-500 py-4 shadow-lg rounded-b-2xl">
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link href="/" className="text-white text-2xl font-bold hover:opacity-80 transition-opacity">
          My Finance App
        </Link>
        <ul className="flex space-x-6">
          <li>
            <Link href="/home" className="text-white hover:text-gray-200 transition-colors">
              Домой
            </Link>
          </li>
          <li>
            <Link href="/transaction" className="text-white hover:text-gray-200 transition-colors">
              Транзакции
            </Link>
          </li>
          <li>
            <Link href="/budget" className="text-white hover:text-gray-200 transition-colors">
              Бюджет
            </Link>
          </li>
          <li>
            <Link href="/analytics" className="text-white hover:text-gray-200 transition-colors">
              Аналитика
            </Link>
          </li>
          {session ? (
            <li>
              <button
                onClick={() => signOut()}
                className="text-white hover:text-gray-200 transition-colors"
              >
                {session.user?.name} (Выйти)
              </button>
            </li>
          ) : (
            <li>
              <Link href="/login" className="text-white hover:text-gray-200 transition-colors">
                Войти
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
