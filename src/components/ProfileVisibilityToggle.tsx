"use client"

import { useState } from "react"

interface ProfileVisibilityToggleProps {
  initialValue: boolean
}

export function ProfileVisibilityToggle({ initialValue }: ProfileVisibilityToggleProps) {
  const [isPublic, setIsPublic] = useState(initialValue)
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    try {
      const res = await fetch("/api/candidate/profile/visibility", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profilePublic: !isPublic }),
      })
      if (res.ok) {
        setIsPublic(!isPublic)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-900">Public Profile</p>
        <p className="text-xs text-gray-500">
          {isPublic ? "Your talent profile is visible to everyone" : "Your talent profile is hidden"}
        </p>
      </div>
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out disabled:opacity-50 ${
          isPublic ? "bg-saffron" : "bg-gray-700"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            isPublic ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  )
}
