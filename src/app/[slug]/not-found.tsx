import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
            <h1 className="text-6xl font-bold text-primary-orange mb-4">404</h1>
            <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
            <p className="mb-8 text-gray-600 max-w-md">
                The page you are looking for might have been removed, had its name changed,
                or is temporarily unavailable.
            </p>
            <Link
                href="/"
                className="bg-primary-orange hover:bg-orange-600 text-white font-medium py-2 px-6 rounded-md transition-colors"
            >
                Return to Home
            </Link>
        </div>
    );
} 