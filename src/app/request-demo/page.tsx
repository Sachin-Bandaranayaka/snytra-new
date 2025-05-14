import React from 'react';
import DemoRequestForm from './DemoRequestForm';

export default function RequestDemo() {
    return (
        <main className="min-h-screen flex flex-col">
            {/* Header */}
            <section className="bg-beige py-16">
                <div className="container mx-auto px-6">
                    <h1 className="text-4xl md:text-5xl font-bold text-primary text-center mb-6">
                        Request a Demo
                    </h1>
                    <p className="text-xl text-center max-w-3xl mx-auto">
                        Experience our platform firsthand with a personalized demonstration.
                    </p>
                </div>
            </section>

            {/* Demo Form */}
            <section className="py-16">
                <div className="container mx-auto px-6">
                    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
                        <DemoRequestForm />
                    </div>
                </div>
            </section>
        </main>
    );
} 