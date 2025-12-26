'use client'

/**
 * PermissionsRequestGate - Client Boundary Wrapper
 * 
 * This component acts as an explicit client boundary for the Permissions Request dialog.
 * It isolates all client-side hooks and state management from the Server Component (layout).
 * 
 * Usage in layout.tsx:
 * import { PermissionsRequestGate } from '@/components/client-boundaries/permissions-request-gate'
 * 
 * <PermissionsRequestGate />
 */

import { PermissionsRequest } from '@/components/permissions-request'

export function PermissionsRequestGate() {
  return <PermissionsRequest />
}
