import React from 'react';
import Link from 'next/link';
import ContactForm from './ContactForm';

export default function ContactUs() {
    return (
        <main className="min-h-screen flex flex-col">
            {/* Header */}
            <section className="bg-beige py-16">
                <div className="container mx-auto px-6">
                    <h1 className="text-4xl md:text-5xl font-bold text-primary text-center mb-6">
                        Contact Us
                    </h1>
                    <p className="text-xl text-center max-w-3xl mx-auto">
                        Let us know how we can help.
                    </p>
                </div>
            </section>

            {/* Contact Methods */}
            <section className="py-16">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        {/* Call Us */}
                        <div className="bg-white p-8 rounded-lg shadow-md">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white mr-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold">Call Us</h3>
                            </div>
                            <p className="text-darkGray">
                                <a href="tel:+12345678990" className="hover:text-primary">+1 (234) 567-890</a>
                            </p>
                        </div>

                        {/* Chat Us */}
                        <div className="bg-white p-8 rounded-lg shadow-md">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white mr-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold">Chat Us</h3>
                            </div>
                            <p className="text-darkGray">
                                <a href="mailto:support@restaurantapp.com" className="hover:text-primary">support@restaurantapp.com</a>
                            </p>
                        </div>

                        {/* Visit Us */}
                        <div className="bg-white p-8 rounded-lg shadow-md">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white mr-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold">Visit Us</h3>
                            </div>
                            <p className="text-darkGray">
                                123 Main Street, City, Country
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Form */}
            <section className="py-16 bg-beige">
                <div className="container mx-auto px-6">
                    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
                        <ContactForm />
                    </div>
                </div>
            </section>
        </main>
    );
} 