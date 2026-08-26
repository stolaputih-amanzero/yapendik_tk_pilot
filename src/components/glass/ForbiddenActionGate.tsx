/**
 * Yapendik School OS — The Glass Layer
 * ForbiddenActionGate Component (FB-06 Mutation Hard Block & Anti-Panopticon Barrier)
 * 
 * Enforces in the UI layer that Foundation Directors and Superadmins cannot view
 * or trigger granular unit-level classroom mutations (presensi edit, rapor modification, etc.)
 */

import React from 'react';
import { useSecurityContext } from '../../auth/context';

export interface ForbiddenActionGateProps {
  children: React.ReactNode;
  /**
   * Action type being guarded. If specified and the current actor is a Foundation role,
   * forbidden unit-level mutations (e.g. CLASSROOM_MUTATION, UNIT_LPPA_OVERRIDE) are suppressed.
   */
  actionType?: 'CLASSROOM_MUTATION' | 'UNIT_LPPA_OVERRIDE' | 'CROSS_SCHOOL_RANKING' | 'GENERIC_MUTATION';
  fallback?: React.ReactNode;
}

export const ForbiddenActionGate: React.FC<ForbiddenActionGateProps> = ({
  children,
  actionType,
  fallback = null
}) => {
  const context = useSecurityContext();
  const role = context?.securityContext?.role || context?.currentPersona?.role || 'YAPENDIK_SUPERADMIN';

  const isFoundationRole = 
    role === 'YAPENDIK_SUPERADMIN' || 
    role === 'FOUNDATION_DIRECTOR' || 
    role === 'FOUNDATION_TRUSTEE' ||
    role === 'AUDITOR';

  // FB-06: Suppress forbidden mutation elements when viewed by Foundation roles
  if (isFoundationRole && actionType && (
    actionType === 'CLASSROOM_MUTATION' || 
    actionType === 'UNIT_LPPA_OVERRIDE' || 
    actionType === 'CROSS_SCHOOL_RANKING'
  )) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
