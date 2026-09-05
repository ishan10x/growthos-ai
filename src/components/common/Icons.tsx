import type React from "react"

export const Icons: Record<string, React.ReactNode> = {
  logo: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="7" fill="#2563EB" />
      <path
        d="M7 14h14M7 9.5l7 4.5-7 4.5"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  dashboard: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect
        x="1"
        y="1"
        width="6"
        height="6"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <rect
        x="9"
        y="1"
        width="6"
        height="6"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <rect
        x="1"
        y="9"
        width="6"
        height="6"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <rect
        x="9"
        y="9"
        width="6"
        height="6"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  ),
  opportunities: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 1l1.8 3.6L14 5.4l-3 2.9.7 4.1L8 10.4l-3.7 2 .7-4.1-3-2.9 4.2-.8L8 1z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  ),
  campaigns: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M2 5h12M2 8h8M2 11h10"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  ),
  customers: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M1 13c0-2.76 2.24-5 5-5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="11.5" cy="6" r="2" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M9 13c0-2.21 1.12-4 2.5-4s2.5 1.79 2.5 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  ),
  analytics: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M2 12l3.5-4 3 2.5L12 5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="1"
        y="1"
        width="14"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  ),
  ai: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M8 1.5v1M8 13.5v1M1.5 8h1M13.5 8h1M3.4 3.4l.7.7M11.9 11.9l.7.7M3.4 12.6l.7-.7M11.9 4.1l.7-.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  bell: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M9 1.5a5.5 5.5 0 00-5.5 5.5v3L2 12h14l-1.5-2V7A5.5 5.5 0 009 1.5z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M7 12a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  chevronRight: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M5 3l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  arrowUp: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M6 10V2M2 6l4-4 4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  sparkle: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M7 1l1.2 3.8H12L8.9 7l1.2 3.8L7 8.6l-3.1 2.2L5.1 7 2 4.8h3.8L7 1z"
        fill="currentColor"
      />
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M2.5 7l3 3 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  info: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M7 6v4M7 4.5v.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  plus: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M7 2v10M2 7h10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
  filter: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M1 3h12M3.5 7h7M6 11h2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  export: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M7 1v8M4 6l3 3 3-3M2 10v2a1 1 0 001 1h8a1 1 0 001-1v-2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
}

export default Icons
