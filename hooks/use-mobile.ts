import * as React from "react"

const MOBILE_BREAKPOINT = 768

function subscribeToMobileChanges(callback: () => void) {
  const query = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`
  const mediaQueryList = window.matchMedia(query)

  mediaQueryList.addEventListener("change", callback)
  return () => mediaQueryList.removeEventListener("change", callback)
}

function getMobileSnapshot() {
  return window.innerWidth < MOBILE_BREAKPOINT
}

function getServerMobileSnapshot() {
  return false
}

export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribeToMobileChanges,
    getMobileSnapshot,
    getServerMobileSnapshot
  )
}
