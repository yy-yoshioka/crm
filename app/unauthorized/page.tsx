import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold text-red-600">Access Denied</h1>
          <h2 className="mt-6 text-2xl font-medium">
            You don&apos;t have permission to access this page
          </h2>
          <p className="mt-2 text-gray-600">
            Your account doesn&apos;t have the required permissions to view this
            resource.
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <Link
            href="/"
            className="inline-block px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Return to Dashboard
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            If you believe this is an error, please contact your administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
