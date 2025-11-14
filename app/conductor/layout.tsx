
import ConductorNav from '@/components/navigation/conductor-nav';
import RouteGuard from '@/components/auth/route-guard';

export default function ConductorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard requiredRole="conductor">
      <div>
        <ConductorNav />
        <main className="lg:pl-72">
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </RouteGuard>
  );
}
