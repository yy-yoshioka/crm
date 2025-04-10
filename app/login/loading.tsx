export default function LoginLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg border p-6 shadow-md">
        <div className="text-center animate-pulse">
          <div className="h-8 w-48 mx-auto bg-gray-200 rounded"></div>
          <div className="h-6 w-64 mx-auto mt-2 bg-gray-200 rounded"></div>
        </div>

        <div className="mt-8 space-y-6 animate-pulse">
          <div className="space-y-4 rounded-md">
            <div>
              <div className="h-5 w-32 bg-gray-200 rounded"></div>
              <div className="mt-1 h-10 w-full bg-gray-200 rounded-md"></div>
            </div>

            <div>
              <div className="h-5 w-24 bg-gray-200 rounded"></div>
              <div className="mt-1 h-10 w-full bg-gray-200 rounded-md"></div>
            </div>
          </div>

          <div className="h-10 w-full bg-gray-300 rounded-md"></div>
        </div>

        <div className="mt-4 text-center">
          <div className="h-5 w-48 mx-auto bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}
