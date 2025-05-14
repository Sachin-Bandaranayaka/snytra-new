import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SendCvButton from "./SendCvButton";

export const metadata: Metadata = {
    title: "Careers | Snytra",
    description: "Join our team at Snytra and help transform the restaurant industry with innovative technology solutions.",
};

async function getJobs() {
    try {
        const jobs = await prisma.job.findMany({
            where: {
                isActive: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return jobs;
    } catch (error) {
        console.error('Error fetching jobs:', error);
        return [];
    }
}

export default async function Careers() {
    const jobs = await getJobs();

    return (
        <main className="flex flex-col min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="container mx-auto max-w-6xl">
                {/* Hero Section */}
                <div className="bg-beige rounded-2xl p-8 md:p-12 mb-16">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl font-bold text-charcoal mb-4">Join the Snytra Team</h1>
                        <p className="text-lg text-charcoal mb-6">
                            We're transforming the restaurant industry with innovative technology. Join us and help shape the future of dining experiences.
                        </p>
                        <a
                            href="#openings"
                            className="inline-block bg-primary text-white font-semibold px-6 py-3 rounded-md hover:bg-primary-dark transition duration-200"
                        >
                            View open positions
                        </a>
                    </div>
                </div>

                {/* Our Values Section */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-charcoal mb-8">Our Values</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="w-12 h-12 bg-primary/10 flex items-center justify-center rounded-full mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-charcoal mb-2">Customer Obsession</h3>
                            <p className="text-gray-600">
                                We start with the customer and work backwards. Our decisions are guided by what will provide the most value to the restaurants we serve.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="w-12 h-12 bg-primary/10 flex items-center justify-center rounded-full mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-charcoal mb-2">Innovation</h3>
                            <p className="text-gray-600">
                                We constantly push the boundaries of what's possible, challenging the status quo to create solutions that truly transform restaurant operations.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="w-12 h-12 bg-primary/10 flex items-center justify-center rounded-full mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-charcoal mb-2">Quality</h3>
                            <p className="text-gray-600">
                                We're committed to excellence in everything we do. From our code to our customer service, we believe in doing things right.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-charcoal mb-8">Benefits & Perks</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold text-charcoal mb-4">Health & Wellbeing</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start">
                                    <svg className="h-6 w-6 text-primary flex-shrink-0 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Comprehensive private healthcare</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="h-6 w-6 text-primary flex-shrink-0 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Mental health support program</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="h-6 w-6 text-primary flex-shrink-0 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Gym membership contribution</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="h-6 w-6 text-primary flex-shrink-0 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Cycle to work scheme</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold text-charcoal mb-4">Growth & Development</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start">
                                    <svg className="h-6 w-6 text-primary flex-shrink-0 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>£2,000 annual learning & development budget</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="h-6 w-6 text-primary flex-shrink-0 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Regular professional development workshops</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="h-6 w-6 text-primary flex-shrink-0 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Mentorship program</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="h-6 w-6 text-primary flex-shrink-0 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Career progression framework</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold text-charcoal mb-4">Work-Life Balance</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start">
                                    <svg className="h-6 w-6 text-primary flex-shrink-0 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Flexible hybrid working model</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="h-6 w-6 text-primary flex-shrink-0 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>28 days holiday + bank holidays</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="h-6 w-6 text-primary flex-shrink-0 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Birthday day off</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="h-6 w-6 text-primary flex-shrink-0 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Parental leave</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold text-charcoal mb-4">Extras</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start">
                                    <svg className="h-6 w-6 text-primary flex-shrink-0 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Competitive pension scheme</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="h-6 w-6 text-primary flex-shrink-0 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Team socials and events</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="h-6 w-6 text-primary flex-shrink-0 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Free snacks and drinks in the office</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="h-6 w-6 text-primary flex-shrink-0 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Employee share options</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Job Openings Section */}
                <section id="openings" className="mb-16">
                    <h2 className="text-3xl font-bold text-charcoal mb-8">Current Openings</h2>

                    {jobs.length === 0 ? (
                        <div className="bg-white p-8 rounded-lg shadow-md text-center">
                            <h3 className="text-xl font-medium text-charcoal mb-2">No open positions right now</h3>
                            <p className="text-gray-600 mb-4">
                                We don't have any open positions at the moment, but we're always looking for talented people.
                            </p>
                            <SendCvButton />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {jobs.map((job) => (
                                <div key={job.id} className="bg-white p-6 rounded-lg shadow-md">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                                        <h3 className="text-xl font-semibold text-charcoal">{job.title}</h3>
                                        <div className="flex mt-2 md:mt-0">
                                            <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm mr-2">
                                                {job.location}
                                            </span>
                                            <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                                                {job.type}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 mb-6 line-clamp-2">{job.description}</p>
                                    <Link
                                        href={`/careers/${job.id}`}
                                        className="inline-block bg-white text-primary font-medium px-5 py-2 rounded-md border border-primary hover:bg-primary hover:text-white transition duration-200"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* General Applications */}
                <section className="mb-16">
                    <div className="bg-gray-100 rounded-lg p-8 text-center">
                        <h2 className="text-2xl font-bold text-charcoal mb-4">Don't see a role that fits?</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
                            We're always interested in hearing from talented people. Send us your CV and we'll keep it on file for future opportunities.
                        </p>
                        <SendCvButton />
                    </div>
                </section>
            </div>
        </main>
    );
} 