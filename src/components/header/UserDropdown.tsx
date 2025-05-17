"use client";
import Image from "next/image";
import React, { useCallback, useState } from "react";
import { Dropdown } from "../temp-ui/dropdown/Dropdown";
import { DropdownItem } from "../temp-ui/dropdown/DropdownItem";
import { capitalizeString, castToString, fullNameAsKeyValue, getInitials, safeTrim } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Settings, LogOut, User } from "lucide-react";
import { useUserStore } from "@/lib/stores/useUserStore";
import Avatar from "../Avatar";
import { useLogoutMutation } from "@/lib/services/api/users/mutation";

export default function UserDropdown() {
  const user = useUserStore((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);

  const { mutate: logout, isPending } = useLogoutMutation();
  // const router = useRouter();

  // const logoutMutation = useMutation({
  //   mutationFn: async () => {
  //     const response = await fetch('/api/auth/logout', {
  //       method: 'GET',
  //       headers: {
  //         'Accept': 'application/json', // Explicitly request JSON response
  //       },
  //       credentials: 'include',
  //     });

  //     if (!response.ok) {
  //       throw new Error('Logout failed');
  //     }

  //     return await response.json();
  //   },
  //   onSuccess: () => {
  //     // Clear client-side user state
  //     clearUser();

  //     // Redirect to signin with a hard refresh to ensure all state is cleared
  //     window.location.href = '/signin';

  //     // Alternative if you prefer not to do full page reload:
  //     // router.push('/signin');
  //     // router.refresh();
  //   },
  //   onError: (error) => {
  //     console.error('Logout error:', error);
  //     // You might want to add toast notification here
  //   }
  // });

  const toggleDropdown = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleSignOut = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    logout();
  }, [logout])

  const fullname = user?.name;
  const fullnameInitials = getInitials(fullname);
  const fullNameKv = fullNameAsKeyValue(String(fullname));

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dark:text-gray-400 dropdown-toggle"
        aria-expanded={isOpen}
        aria-label="User menu"
      >
        <span className="mr-3 overflow-hidden rounded-full h-10 w-10">
          <Avatar
            width={44}
            height={44}
            src={user?.image}
            alt="user"
            name={castToString(user?.name)}
          />
        </span>

        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-3 w-64 origin-top-right divide-y divide-gray-100 rounded-xl bg-white shadow-lg ring-1 ring-black/5 transition-all duration-200 ease-out dark:divide-gray-800 dark:bg-gray-900 dark:ring-white/10"
      >
        {/* User Info Section */}
        <div className="px-4 py-3">
          <div className="flex flex-col space-y-0.5 justify-center items-center">
            <span className="truncate text-sm font-semibold text-gray-900 dark:text-white">
              {fullname}
            </span>
            <span className="truncate text-xs font-medium text-gray-500 dark:text-gray-400">
              {capitalizeString(user?.role?.toString() || "")}
            </span>
            <span className="truncate text-xs text-gray-500 dark:text-gray-400">
              {user?.email}
            </span>
          </div>
        </div>

        {/* Menu Items */}
        <ul className="py-1.5">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/profile"
              className="group flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors duration-150 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <User className="h-5 w-5 text-gray-400 transition-colors duration-150 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300" />
              Account
            </DropdownItem>
          </li>
        </ul>

        {/* Sign Out Button */}
        <div className="py-1.5 px-1">
          <button
            onClick={handleSignOut}
            disabled={isPending}
            className={`group flex w-full items-center gap-3 rounded-md px-4 py-2 text-sm transition-colors duration-150 ${isPending
              ? 'cursor-not-allowed text-gray-400 dark:text-gray-500'
              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
              }`}
          >
            <LogOut
              className={`h-5 w-5 transition-colors duration-150 ${isPending
                ? 'text-gray-400 dark:text-gray-500'
                : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'
                }`}
            />
            {isPending ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      </Dropdown>
    </div>
  );
}