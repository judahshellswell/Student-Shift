import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-gray-50">
      <div className="text-6xl mb-4">😕</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
      <p className="text-text-secondary mb-8">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
      <div className="flex gap-3">
        <Link href="/" className="text-sm font-medium text-primary border border-primary px-4 py-2 rounded-lg hover:bg-primary-bg transition-colors">
          Go home
        </Link>
        <Link href="/jobs" className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
          Browse jobs
        </Link>
      </div>
    </div>
  );
}
