"use client";

import { useState, useRef, useEffect, Suspense } from 'react';
import { Upload, Check, AlertCircle, Camera, RefreshCw } from 'lucide-react';
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
    const [useCameraMode, setUseCameraMode] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const qrScannerRef = useRef<QrScanner | null>(null);

    // Clean up camera scanner on unmount
    useEffect(() => {
        return () => {
            if (qrScannerRef.current) {
                qrScannerRef.current.stop();
                qrScannerRef.current.destroy();
            }
        };
    }, []);

    // Setup camera scanner when mode changes
    useEffect(() => {
        if (useCameraMode && videoRef.current) {
            setScanning(true);
            setError(null);
            setSuccess(false);
            setResults(null);
            setImagePreview(null);

            // Create new QR scanner
            try {
                // Check if there's an existing scanner and destroy it
                if (qrScannerRef.current) {
                    qrScannerRef.current.stop();
                    qrScannerRef.current.destroy();
                }

                // Create a new scanner instance
                qrScannerRef.current = new QrScanner(
                    videoRef.current,
                    (result) => handleScanResult(result.data),
                    {
                        highlightScanRegion: true,
                        highlightCodeOutline: true,
                        returnDetailedScanResult: true,
                    }
                );

                // Start scanning
                qrScannerRef.current.start().then(() => {
                    console.log("QR scanner started");
                    setScanning(false);
                }).catch(err => {
                    console.error("Failed to start scanner:", err);
                    setError(`Camera access failed: ${err.message || 'Please check camera permissions'}`);
                    setScanning(false);
                    setUseCameraMode(false);
                });
            } catch (err) {
                console.error("Error initializing camera scanner:", err);
                setError('Failed to initialize camera. Try uploading an image instead.');
                setScanning(false);
                setUseCameraMode(false);
            }
        } else if (!useCameraMode && qrScannerRef.current) {
            // Stop scanner when switching to upload mode
            qrScannerRef.current.stop();
            qrScannerRef.current.destroy();
            qrScannerRef.current = null;
        }
    }, [useCameraMode]);

    const handleScanResult = (data: string) => {
        if (!data) return;

        console.log("QR code detected:", data);
        setResults(data);
        setSuccess(true);

        // Stop scanning after successful detection
        if (qrScannerRef.current) {
            qrScannerRef.current.stop();
        }

        // Process the QR code data
        processQrData(data);
    };

    const processQrData = (data: string) => {
        try {
            // If the QR code contains a URL, extract the table parameter
            if (data.startsWith('http')) {
                try {
                    const url = new URL(data);
                    const qrTableId = url.searchParams.get('table');

                    if (qrTableId) {
                        console.log("Found table ID in URL:", qrTableId);
                        // Wait 2 seconds to show success state before redirecting
                        setTimeout(() => {
                            router.push(`/menu?table=${qrTableId}`);
                        }, 2000);
                    } else {
                        setError('Invalid QR code: No table information found');
                    }
                } catch (err) {
                    console.error("Error parsing URL:", err);
                    setError('Invalid QR code URL format');
                }
            }
            // If it's not a URL, check if it's a direct table ID or JSON
            else {
                // Try parsing as JSON
                try {
                    const jsonData = JSON.parse(data);
                    if (jsonData.table) {
                        console.log("Found table ID in JSON:", jsonData.table);
                        setTimeout(() => {
                            router.push(`/menu?table=${jsonData.table}`);
                        }, 2000);
                        return;
                    }
                } catch (e) {
                    // Not JSON, continue with other checks
                }

                // Check if it's a numeric table ID
                if (/^[0-9]+$/.test(data)) {
                    console.log("Found numeric table ID:", data);
                    // It's likely just a table ID
                    setTimeout(() => {
                        router.push(`/menu?table=${data}`);
                    }, 2000);
                } else {
                    setError('Invalid QR code: Unable to extract table information');
                }
            }
        } catch (err) {
            console.error('Error processing QR data:', err);
            setError('Failed to process QR code data');
        }
    };

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
            console.log("Scanning image for QR code...");
            const result = await QrScanner.scanImage(file, {
                returnDetailedScanResult: true,
                qrEngine: QrScanner.createQrEngine()
            });

            console.log("Scan result:", result);

            if (result && result.data) {
                setResults(result.data);
                setSuccess(true);
                processQrData(result.data);
            } else {
                setError('No QR code detected in the image');
            }
        } catch (err: any) {
            console.error('Error scanning QR code:', err);

            // More detailed error messages
            if (err.name === "NotFoundError") {
                setError('No QR code detected in the image. Please try a clearer image.');
            } else {
                setError(`Failed to scan QR code: ${err.message || 'Unknown error'}`);
            }
        } finally {
            setScanning(false);
        }
    };

    const triggerFileInput = () => {
        if (!scanning) {
            fileInputRef.current?.click();
        }
    };

    const toggleScannerMode = () => {
        if (qrScannerRef.current) {
            qrScannerRef.current.stop();
            qrScannerRef.current.destroy();
            qrScannerRef.current = null;
        }
        setUseCameraMode(!useCameraMode);
        setError(null);
        setSuccess(false);
        setResults(null);
        setImagePreview(null);
    };

    const resetScanner = () => {
        if (qrScannerRef.current && useCameraMode) {
            qrScannerRef.current.start();
        }
        setError(null);
        setSuccess(false);
        setResults(null);
        setImagePreview(null);
    };

    if (restaurantLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-beige">
                <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const primaryColor = restaurant?.primary_color || '#D15A06';
    const secondaryColor = restaurant?.secondary_color || '#F17C26';

    return (
        <div className="min-h-screen bg-[#f9f5ed]">
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
                            {useCameraMode
                                ? "Point your camera at a QR code to scan"
                                : "Upload a QR code image to view your table information"}
                        </p>
                    </div>

                    {/* Mode toggle buttons */}
                    <div className="flex justify-center mb-6">
                        <div className="inline-flex rounded-md shadow-sm" role="group">
                            <button
                                type="button"
                                onClick={() => setUseCameraMode(false)}
                                className={`px-5 py-2 text-sm font-medium rounded-l-lg ${!useCameraMode
                                    ? 'text-white'
                                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200'}`}
                                style={!useCameraMode ? { backgroundColor: primaryColor } : {}}
                                disabled={scanning}
                            >
                                <Upload className="w-5 h-5 mb-1 mx-auto" />
                                <span>Upload Image</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setUseCameraMode(true)}
                                className={`px-5 py-2 text-sm font-medium rounded-r-lg ${useCameraMode
                                    ? 'text-white'
                                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200'}`}
                                style={useCameraMode ? { backgroundColor: primaryColor } : {}}
                                disabled={scanning}
                            >
                                <Camera className="w-5 h-5 mb-1 mx-auto" />
                                <span>Use Camera</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-8">
                        {/* Camera mode */}
                        {useCameraMode ? (
                            <div className="relative">
                                <video
                                    ref={videoRef}
                                    className="w-full h-64 object-cover bg-black rounded-lg mx-auto"
                                />
                                {scanning && (
                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                                        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: primaryColor }}></div>
                                    </div>
                                )}
                            </div>
                        ) : (
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
                        )}

                        {scanning && !useCameraMode && (
                            <div className="text-center py-4">
                                <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-2" style={{ borderColor: primaryColor }}></div>
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
                            <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-md flex items-center justify-between">
                                <div className="flex items-center">
                                    <AlertCircle className="mr-2 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold">Error</p>
                                        <p className="text-sm">{error}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={resetScanner}
                                    className="ml-2 p-2 bg-white rounded-full hover:bg-gray-100"
                                >
                                    <RefreshCw size={16} />
                                </button>
                            </div>
                        )}

                        <div className="mt-6">
                            {useCameraMode ? (
                                <button
                                    className="w-full py-3 rounded-md text-white font-medium"
                                    style={{ backgroundColor: primaryColor }}
                                    onClick={resetScanner}
                                    disabled={scanning}
                                >
                                    {scanning ? 'Initializing Camera...' : success ? 'Scan Another Code' : 'Restart Scan'}
                                </button>
                            ) : (
                                <button
                                    className="w-full py-3 rounded-md text-white font-medium"
                                    style={{ backgroundColor: primaryColor }}
                                    onClick={triggerFileInput}
                                    disabled={scanning}
                                >
                                    {scanning ? 'Processing...' : 'Upload QR Code Image'}
                                </button>
                            )}
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
                <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <QRCodeScannerContent />
        </Suspense>
    );
} 