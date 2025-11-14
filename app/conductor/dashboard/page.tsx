
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ConductorDashboard() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to nueva-inspeccion as the main conductor interface
    router.replace('/conductor/nueva-inspeccion');
  }, [router]);

  return null;
}
