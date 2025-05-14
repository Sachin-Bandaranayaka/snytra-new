export default function Loading() {
  // Stack uses React Suspense, which will render this page while user data is being fetched.
  // See: https://nextjs.org/docs/app/api-reference/file-conventions/loading
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative h-16 w-16">
          <div className="absolute h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary-orange border-t-transparent"></div>
        </div>
        <p className="text-xl font-medium text-gray-700">Loading...</p>
      </div>
    </div>
  );
}
