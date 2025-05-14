"use client";

import { useState, useRef, Suspense } from 'react';
import { Upload, Check, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRestaurant } from '@/components/providers/RestaurantProvider';
import Link from 'next/link';

// Import QR code reader library
import QrScanner from 'qr-scanner';

function QRCodeScannerContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const tableId = searchParams.get('table');
    const { restaurant, loading: restaurantLoading } = useRestaurant();

    const [scanning, setScanning] = useState(false);
    const [results, setResults] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setScanning(true);
        setError(null);
        setResults(null);
        setSuccess(false);

        try {
            // Create a preview of the uploaded image
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);

            // Scan the QR code
            const result = await QrScanner.scanImage(file);
            setResults(result?.data || null);

            if (result?.data) {
                setSuccess(true);

                // Parse the QR code data and handle redirection
                try {
                    // If the QR code contains a URL, extract the table parameter
                    const url = new URL(result.data);
                    const qrTableId = url.searchParams.get('table');

                    if (qrTableId) {
                        // Wait 2 seconds to show success state before redirecting
                        setTimeout(() => {
                            router.push(`/menu?table=${qrTableId}`);
                        }, 2000);
                    } else {
                        setError('Invalid QR code: No table information found');
                    }
                } catch (err) {
                    // If it's not a URL, check if it's a direct table ID
                    if (/^[0-9]+$/.test(result.data)) {
                        // It's likely just a table ID
                        setTimeout(() => {
                            router.push(`/menu?table=${result.data}`);
                        }, 2000);
                    } else {
                        setError('Invalid QR code format');
                    }
                }
            } else {
                setError('No QR code detected in the image');
            }
        } catch (err) {
            console.error('Error scanning QR code:', err);
            setError('Failed to scan QR code. Please try a different image.');
        } finally {
            setScanning(false);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    if (restaurantLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-beige">
                <div className="w-16 h-16 border-4 border-restaurant-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const primaryColor = restaurant?.primary_color || 'var(--restaurant-primary-color)';
    const secondaryColor = restaurant?.secondary_color || 'var(--restaurant-secondary-color)';

    return (
        <div className="min-h-screen bg-beige">
            {/* Header */}
            <header
                className="sticky top-0 z-10 py-4 px-4 text-white"
                style={{ backgroundColor: primaryColor }}
            >
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center">
                        {restaurant?.logo_url ? (
                            <img
                                src={restaurant.logo_url}
                                alt={restaurant.name}
                                className="h-12 w-12 rounded-full object-cover mr-2"
                            />
                        ) : (
                            <div className="h-10 w-10 mr-2 bg-white rounded-full flex items-center justify-center">
                                <span className="font-bold" style={{ color: primaryColor }}>
                                    {restaurant?.name?.charAt(0) || 'R'}
                                </span>
                            </div>
                        )}
                    </div>

                    <nav className="flex items-center space-x-6">
                        <Link href={`/menu${tableId ? `?table=${tableId}` : ''}`} className="font-medium text-white hover:text-white/80">
                            Home
                        </Link>
                        <Link href={`/menu/browse${tableId ? `?table=${tableId}` : ''}`} className="font-medium text-white hover:text-white/80">
                            Menu
                        </Link>
                        <Link
                            href={`/menu/reservations${tableId ? `?table=${tableId}` : ''}`}
                            className="font-medium text-white hover:text-white/80"
                        >
                            Reservations
                        </Link>
                        <Link
                            href={`/menu/scanner${tableId ? `?table=${tableId}` : ''}`}
                            className="font-medium text-white hover:text-white/80"
                        >
                            Scan QR
                        </Link>
                    </nav>

                    <div>
                        <Link
                            href="/sign-up"
                            className="px-4 py-2 text-white rounded-md font-medium hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: secondaryColor }}
                        >
                            Sign Up
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <section className="container mx-auto py-10 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2" style={{ color: primaryColor }}>
                            QR Code Scanner
                        </h1>
                        <p className="text-gray-600">
                            Upload a QR code image to view your table information or reservation
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-8">
                        <div
                            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer mb-6 transition-colors"
                            style={{ borderColor: `${primaryColor}50` }}
                            onClick={triggerFileInput}
                        >
                            {imagePreview ? (
                                <div className="relative mx-auto w-full max-w-xs">
                                    <img
                                        src={imagePreview}
                                        alt="QR Code"
                                        className="max-h-64 mx-auto object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="py-4">
                                    <Upload
                                        size={48}
                                        className="mx-auto mb-4"
                                        style={{ color: primaryColor }}
                                    />
                                    <p className="text-gray-600 mb-2">Click or drag to upload QR code image</p>
                                    <p className="text-sm text-gray-500">Supported formats: JPG, PNG, GIF</p>
                                </div>
                            )}

                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                            />
                        </div>

                        {scanning && (
                            <div className="text-center py-4">
                                <div className="w-10 h-10 border-4 border-restaurant-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                <p>Scanning QR code...</p>
                            </div>
                        )}

                        {success && (
                            <div
                                className="mt-4 p-4 rounded-md text-green-800 flex items-center"
                                style={{ backgroundColor: `${primaryColor}20` }}
                            >
                                <Check className="mr-2" />
                                <div>
                                    <p className="font-semibold">QR Code detected!</p>
                                    <p className="text-sm">Redirecting you to the table...</p>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-md flex items-center">
                                <AlertCircle className="mr-2" />
                                <div>
                                    <p className="font-semibold">Error</p>
                                    <p className="text-sm">{error}</p>
                                </div>
                            </div>
                        )}

                        <div className="mt-6">
                            <button
                                className="w-full py-3 rounded-md text-white font-medium"
                                style={{ backgroundColor: primaryColor }}
                                onClick={triggerFileInput}
                                disabled={scanning}
                            >
                                {scanning ? 'Processing...' : 'Upload QR Code Image'}
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-gray-600 mb-2">Don't have a QR code?</p>
                        <Link
                            href={`/menu${tableId ? `?table=${tableId}` : ''}`}
                            className="font-medium"
                            style={{ color: primaryColor }}
                        >
                            Return to menu
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default function QRCodeScannerPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-restaurant-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <QRCodeScannerContent />
        </Suspense>
    );
} 