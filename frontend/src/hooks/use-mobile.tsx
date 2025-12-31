import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

/**
 * Hook: useIsMobile
 * Returns true if the viewport width is less than MOBILE_BREAKPOINT.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

    // Initialize
    handleResize()

    // Add event listener
    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return isMobile
}

/**
 * Hook: useIsTabletOrMobile
 * Returns true if the viewport width is less than TABLET_BREAKPOINT.
 */
export function useIsTabletOrMobile(): boolean {
  const [isTabletOrMobile, setIsTabletOrMobile] = React.useState(false)

  React.useEffect(() => {
    const handleResize = () => setIsTabletOrMobile(window.innerWidth < TABLET_BREAKPOINT)

    // Initialize
    handleResize()

    // Add event listener
    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return isTabletOrMobile
}
