import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

// Same job openings data from careers page
const jobOpenings = [
    {
        id: "fe-dev-1",
        title: "Frontend Developer",
        location: "London, UK (Hybrid)",
        type: "Full-time",
        description: "We're looking for a frontend developer with experience in React, Next.js, and Tailwind CSS to help build beautiful, responsive user interfaces for our restaurant management system.",
        responsibilities: [
            "Build and maintain responsive user interfaces using React and Next.js",
            "Collaborate with designers to implement UI/UX designs accurately",
            "Write clean, maintainable, and well-documented code",
            "Optimize application performance and loading times",
            "Participate in code reviews and contribute to team technical decisions",
            "Stay up-to-date with emerging trends and technologies in frontend development"
        ],
        requirements: [
            "3+ years of experience with React and modern JavaScript",
            "Experience with Next.js and server-side rendering",
            "Proficiency with CSS frameworks like Tailwind or styled-components",
            "Understanding of responsive design principles",
            "Experience with state management (Redux, Context API, Zustand, etc.)",
            "Familiarity with REST APIs and data fetching patterns",
            "Experience with Git and collaborative development workflows",
            "Excellent problem-solving skills and attention to detail"
        ],
        niceToHave: [
            "Experience with TypeScript",
            "Knowledge of testing frameworks (Jest, React Testing Library)",
            "Experience with animation libraries (Framer Motion, GSAP)",
            "Understanding of accessibility standards and best practices",
            "Previous experience in the hospitality or restaurant industry",
            "Contributions to open source projects"
        ],
        salary: "£50,000 - £70,000 depending on experience"
    },
    {
        id: "be-dev-1",
        title: "Backend Developer",
        location: "London, UK (Hybrid)",
        type: "Full-time",
        description: "Join our backend team to build scalable APIs and services using Node.js, PostgreSQL, and serverless technologies that power our restaurant management platform.",
        responsibilities: [
            "Design, build, and maintain efficient, reusable, and reliable server-side code",
            "Implement robust API endpoints to support our web and mobile applications",
            "Integrate with third-party services (payment providers, email services, etc.)",
            "Design and implement database schemas and optimize queries",
            "Participate in the full software development lifecycle, including planning, development, and deployment",
            "Collaborate with frontend developers to ensure seamless integration",
            "Implement and maintain security, data protection, and authentication"
        ],
        requirements: [
            "3+ years of experience with Node.js and Express",
            "Strong understanding of RESTful API design principles",
            "Experience with relational databases (PostgreSQL preferred)",
            "Understanding of serverless architecture and microservices",
            "Familiarity with cloud platforms (AWS, GCP, or Azure)",
            "Experience with version control systems (Git)",
            "Understanding of security best practices"
        ],
        niceToHave: [
            "Experience with TypeScript",
            "Familiarity with GraphQL",
            "Experience with containerization (Docker)",
            "Knowledge of CI/CD pipelines",
            "Experience with message queues or event streaming platforms",
            "Understanding of test-driven development",
            "Previous experience in the hospitality or restaurant industry"
        ],
        salary: "£55,000 - £75,000 depending on experience"
    },
    {
        id: "product-manager-1",
        title: "Product Manager",
        location: "London, UK (Hybrid)",
        type: "Full-time",
        description: "We're seeking an experienced product manager to help define our product roadmap, gather requirements, and drive the development of new features for our restaurant management system.",
        responsibilities: [
            "Define and maintain the product roadmap based on market research, customer feedback, and business goals",
            "Gather and prioritize requirements by working closely with customers, stakeholders, and development teams",
            "Create detailed product specifications and user stories",
            "Collaborate with design and engineering teams throughout the development process",
            "Monitor product performance metrics and drive continuous improvement",
            "Present product demos to internal teams and customers",
            "Stay informed about industry trends and competitor offerings"
        ],
        requirements: [
            "3+ years of experience in product management, preferably in SaaS or B2B products",
            "Strong analytical skills and data-driven decision making",
            "Excellent communication and stakeholder management abilities",
            "Experience with agile development methodologies",
            "Ability to translate business requirements into product specifications",
            "Strong problem-solving skills and attention to detail",
            "Technical background or understanding of software development processes"
        ],
        niceToHave: [
            "Experience in the hospitality or restaurant industry",
            "Knowledge of UX design principles",
            "Experience with product analytics tools",
            "MBA or relevant product management certification",
            "Experience with product management tools (Jira, Asana, etc.)",
            "Background in customer success or account management"
        ],
        salary: "£60,000 - £80,000 depending on experience"
    },
    {
        id: "ux-designer-1",
        title: "UX/UI Designer",
        location: "Remote (UK-based)",
        type: "Full-time",
        description: "Help design intuitive, beautiful interfaces for restaurant staff and customers. Experience with designing for mobile and tablet interfaces is essential.",
        responsibilities: [
            "Create user-centered designs by understanding business requirements, user needs, and technical constraints",
            "Design flows, wireframes, prototypes, and high-fidelity mockups for web and mobile applications",
            "Collaborate with product managers and developers to implement designs",
            "Conduct user research and testing to validate design decisions",
            "Create and maintain design systems to ensure consistency across products",
            "Stay up-to-date with UX trends, tools, and methodologies"
        ],
        requirements: [
            "3+ years of experience in UX/UI design for digital products",
            "Proficiency with design tools (Figma, Sketch, Adobe XD)",
            "Experience designing for different platforms (web, mobile, tablet)",
            "Understanding of accessibility standards and responsive design principles",
            "Portfolio demonstrating strong visual design and interaction design skills",
            "Ability to communicate design decisions and incorporate feedback",
            "Experience with design systems"
        ],
        niceToHave: [
            "Experience in the hospitality or restaurant industry",
            "Knowledge of HTML/CSS",
            "Experience with animation and micro-interactions",
            "Understanding of agile development methodologies",
            "Experience with user research and usability testing",
            "Familiarity with front-end development concepts"
        ],
        salary: "£45,000 - £65,000 depending on experience"
    },
    {
        id: "sales-exec-1",
        title: "Sales Executive",
        location: "London, UK",
        type: "Full-time",
        description: "Join our growing sales team to help bring Snytra to restaurants across the UK. Previous experience in SaaS sales or hospitality technology is preferred.",
        responsibilities: [
            "Identify and engage potential customers through various channels",
            "Conduct product demonstrations and presentations to prospective clients",
            "Understand customer needs and tailor solutions to meet their requirements",
            "Negotiate contracts and close deals to achieve sales targets",
            "Maintain accurate records in our CRM system",
            "Collaborate with marketing, product, and customer success teams",
            "Stay informed about industry trends and competitor offerings"
        ],
        requirements: [
            "2+ years of experience in B2B sales, preferably in SaaS or technology",
            "Strong communication and presentation skills",
            "Experience with sales methodologies and CRM systems",
            "Ability to understand and articulate technical concepts to non-technical audiences",
            "Goal-oriented mindset with a track record of meeting or exceeding targets",
            "Excellent relationship building and negotiation skills"
        ],
        niceToHave: [
            "Experience in the hospitality or restaurant industry",
            "Knowledge of restaurant operations and challenges",
            "Previous experience selling software to SMBs",
            "Understanding of subscription-based business models",
            "Network of contacts in the UK restaurant industry"
        ],
        salary: "£35,000 - £50,000 base + commission (OTE £70,000+)"
    },
    {
        id: "customer-success-1",
        title: "Customer Success Manager",
        location: "London, UK (Hybrid)",
        type: "Full-time",
        description: "Work directly with our restaurant partners to ensure they get the most out of Snytra's platform, providing training, support, and strategic guidance.",
        responsibilities: [
            "Onboard new customers and ensure a smooth implementation process",
            "Develop and deliver training programs for customers",
            "Serve as the primary point of contact for assigned accounts",
            "Monitor customer health metrics and proactively address potential issues",
            "Identify upsell and cross-sell opportunities",
            "Gather customer feedback and share insights with product and development teams",
            "Build and maintain strong relationships with customers"
        ],
        requirements: [
            "2+ years of experience in customer success, account management, or similar roles",
            "Strong communication and interpersonal skills",
            "Problem-solving attitude with a customer-first mindset",
            "Experience with CRM or customer success platforms",
            "Ability to explain technical concepts to non-technical users",
            "Excellent time management and organizational skills"
        ],
        niceToHave: [
            "Experience in the hospitality or restaurant industry",
            "Understanding of SaaS business models",
            "Knowledge of project management methodologies",
            "Experience with creating training materials and documentation",
            "Background in sales or technical support"
        ],
        salary: "£40,000 - £55,000 depending on experience"
    }
];

// Remove the duplicate prisma client and use the singleton instance instead
async function getJobById(jobId: string) {
    try {
        const job = await prisma.job.findUnique({
            where: { id: jobId }
        });
        return job;
    } catch (error) {
        console.error('Error fetching job:', error);
        return null;
    }
}

export async function generateMetadata({ params }: { params: { jobId: string } }): Promise<Metadata> {
    const job = await getJobById(params.jobId);

    if (!job) {
        return {
            title: "Job Not Found | Snytra Careers",
            description: "The job you're looking for doesn't exist or has been filled."
        };
    }

    return {
        title: `${job.title} | Snytra Careers`,
        description: job.description
    };
}

export default async function JobDetails({ params }: { params: { jobId: string } }) {
    const job = await getJobById(params.jobId);

    if (!job) {
        notFound();
    }

    return (
        <main className="flex flex-col min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="container mx-auto max-w-4xl">
                <Link
                    href="/careers"
                    className="inline-flex items-center text-primary hover:text-primary-dark mb-8"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    Back to Careers
                </Link>

                <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                        <h1 className="text-3xl font-bold text-charcoal">{job.title}</h1>
                        <div className="flex mt-2 md:mt-0 space-x-2">
                            <span className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">
                                {job.location}
                            </span>
                            <span className="bg-primary/10 px-3 py-1 rounded-full text-sm text-primary">
                                {job.type}
                            </span>
                        </div>
                    </div>

                    <div className="prose max-w-none">
                        <h2 className="text-xl font-semibold text-charcoal mb-3">Overview</h2>
                        <p className="text-gray-700 mb-6 whitespace-pre-wrap">
                            {job.description}
                        </p>

                        <h2 className="text-xl font-semibold text-charcoal mb-3">Responsibilities</h2>
                        <div className="mb-6 whitespace-pre-wrap">
                            {job.responsibilities}
                        </div>

                        <h2 className="text-xl font-semibold text-charcoal mb-3">Requirements</h2>
                        <div className="mb-6 whitespace-pre-wrap">
                            {job.requirements}
                        </div>

                        {job.benefits && (
                            <>
                                <h2 className="text-xl font-semibold text-charcoal mb-3">Benefits</h2>
                                <div className="mb-6 whitespace-pre-wrap">
                                    {job.benefits}
                                </div>
                            </>
                        )}

                        {job.salary && (
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-charcoal mb-3">Compensation</h2>
                                <p className="text-gray-700">{job.salary}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-beige rounded-lg p-8 text-center">
                    <h2 className="text-2xl font-bold text-charcoal mb-4">Ready to Apply?</h2>
                    <p className="text-gray-700 max-w-2xl mx-auto mb-6">
                        We'd love to hear from you! Send your CV and cover letter explaining why you'd be a great fit for this role.
                    </p>
                    <Link
                        href={`mailto:careers@snytra.com?subject=Application for ${job.title} Position (${job.id})`}
                        className="inline-block bg-primary text-white font-semibold px-6 py-3 rounded-md hover:bg-primary-dark transition duration-200"
                    >
                        Apply for this Position
                    </Link>
                </div>
            </div>
        </main>
    );
} 