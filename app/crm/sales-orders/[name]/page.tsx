import { Suspense } from 'react';
import SalesOrderDetailContent from './SalesOrderDetailContent';

export default function SalesOrderDetailPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-background p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="mt-4">Loading order details...</p>
          </div>
        </div>
      }
    >
      <SalesOrderDetailContent />
    </Suspense>
  );
}