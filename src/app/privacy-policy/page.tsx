import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | Snytra",
    description: "Privacy Policy for Snytra - Learn how we collect, use, and protect your data.",
};

export default function PrivacyPolicy() {
    return (
        <main className="flex flex-col min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="container mx-auto max-w-4xl">
                <h1 className="text-3xl font-bold text-charcoal mb-8">Privacy Policy for snytra.com</h1>
                <p className="text-sm text-gray-500 mb-10">Last updated: 24 April 2025</p>

                <section className="mb-12">
                    <h2 className="text-2xl font-semibold text-charcoal mb-4">1. At a glance</h2>
                    <p className="mb-4">
                        We're Snytra Ltd ("Snytra", "we", "our", "us"). We collect only the data we truly need, guard it like it's our nan's heirloom biscuit tin, and never flog it to spammers. This notice tells you exactly what we gather, why, how long we keep it, and the rights you have under the UK GDPR and the Privacy and Electronic Communications Regulations (PECR).
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-semibold text-charcoal mb-4">2. Who's in charge here?</h2>
                    <p className="mb-2">Snytra Ltd is the data controller. Our details:</p>
                    <ul className="list-disc pl-6 mb-4 space-y-1">
                        <li>Registered office: 75 Kingsway, London WC2B 6SR, UK</li>
                        <li>Companies House number: 12345678</li>
                        <li>ICO registration: ZB 123456</li>
                        <li>Data Protection Officer (DPO): privacy@snytra.com</li>
                    </ul>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-semibold text-charcoal mb-4">3. The data we collect and why</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal">Category</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal">Examples</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal">Why we need it</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal">Lawful basis (Article 6 UK GDPR)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <tr>
                                    <td className="px-4 py-3 text-sm text-charcoal">Identity & contact</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">Name, email, phone</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">Create and manage your account; authenticate you at login</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">Contract ✔</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 text-sm text-charcoal">Profile</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">Avatar, time-zone, accessibility preferences (optional)</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">Personalise your dashboard</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">Consent ✔</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 text-sm text-charcoal">Usage</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">Pages viewed, clicks, IP address (truncated)</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">Improve features and diagnose bugs</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">Legitimate interest ✔</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 text-sm text-charcoal">Payment</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">Cardholder name, last 4 digits, billing address (processed by Stripe)</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">Take payments and issue refunds</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">Contract & legal obligation ✔</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 text-sm text-charcoal">Marketing choices</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">Opt-in checkbox state</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">Send newsletters only if you said yes</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">Consent ✔</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 text-sm text-charcoal">Support</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">Emails, chat transcripts</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">Answer your questions and keep an audit trail</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">Legitimate interest ✔</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-semibold text-charcoal mb-4">4. Cookies & similar tech</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal">Type</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal">Purpose</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal">Default</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <tr>
                                    <td className="px-4 py-3 text-sm text-charcoal">Essential</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">Keep you logged in; process payments</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">Always on</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 text-sm text-charcoal">Analytics</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">See which pages are popular. We use Google Analytics 4, which drops IPs before logging them — no full IP ever hits Google's disks</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">Off until you say yes</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 text-sm text-charcoal">Preferences</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">Remember dark-mode, language, etc.</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">Off until you say yes</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-4 mb-2">
                        A banner appears on your first visit. You can revisit your choices any time by clicking Cookie settings in the footer. For the wonks: we follow ICO guidance on PECR consent.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-semibold text-charcoal mb-4">5. Marketing (no spam promise)</h2>
                    <p className="mb-4">
                        Newsletters arrive only if you've actively opted in. Every email has an Unsubscribe link that works the first time you click it.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-semibold text-charcoal mb-4">6. Who we share data with (and why)</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal">Recipient</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal">Role</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal">Safeguard</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <tr>
                                    <td className="px-4 py-3 text-sm text-charcoal">Stripe Payments UK</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">Card processing</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">PCI-DSS compliant; Privacy Centre</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 text-sm text-charcoal">DigitalOcean</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">Cloud hosting in London & Frankfurt</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">UK DPF extension / SCCs</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 text-sm text-charcoal">Google Analytics 4</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">Site analytics</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">IP anonymisation & regional controls</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 text-sm text-charcoal">Mailjet</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">Transactional & marketing email</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">EU data-centre, SCCs</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 text-sm text-charcoal">Professional advisers</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">Accountants, solicitors, insurers</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">NDAs + strict access control</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 text-sm text-charcoal">Authorities</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">HMRC, courts, ICO if we're legally obliged</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">UK law</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-4 mb-2">
                        We never sell, rent, or trade your personal details—ever.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-semibold text-charcoal mb-4">7. Sending data abroad</h2>
                    <p className="mb-4">
                        Some suppliers are in the US. We rely on one of:
                    </p>
                    <ul className="list-disc pl-6 mb-4 space-y-1">
                        <li>UK-US Data Bridge for certified US companies</li>
                        <li>Standard Contractual Clauses (2021) for everyone else</li>
                    </ul>
                    <p className="mb-4">
                        If these tools are ever struck down (think "Schrems II" all over again) we'll switch to another lawful mechanism or pause transfers.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-semibold text-charcoal mb-4">8. Security, in plain English</h2>
                    <ul className="list-disc pl-6 mb-4 space-y-1">
                        <li>HTTPS everywhere – green padlock or we'd cry.</li>
                        <li>Data encrypted at rest (AES-256) and in transit (TLS 1.3).</li>
                        <li>2-factor authentication for staff dashboards.</li>
                        <li>Quarterly penetration tests and daily off-site backups.</li>
                        <li>Strict least-privilege access; logs kept for 90 days minimum.</li>
                    </ul>
                    <p className="mb-4">
                        We still urge you to pick a unique, strong password. If you suspect any misuse, ping us immediately at security@snytra.com.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-semibold text-charcoal mb-4">9. Data retention</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal">Record</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal">Kept for</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal">Reason</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <tr>
                                    <td className="px-4 py-3 text-sm text-charcoal">User account</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">Active + 12 months</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">Grace period for reactivation</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 text-sm text-charcoal">Invoices & tax data</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">7 years</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">HMRC rules</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 text-sm text-charcoal">Analytics logs</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">26 months then aggregated</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">Trend reporting</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 text-sm text-charcoal">Support tickets</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">24 months</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">Spot repeat issues</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 text-sm text-charcoal">Cookie consents</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">6 years</td>
                                    <td className="px-4 py-3 text-sm text-charcoal">ICO guidance</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-4 mb-2">
                        When time's up, we either anonymise or securely delete.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-semibold text-charcoal mb-4">10. Automated decision-making & profiling</h2>
                    <p className="mb-4">
                        We do not make decisions that have legal or similarly significant effects on you based solely on automated processing (Article 22 UK GDPR).
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-semibold text-charcoal mb-4">11. Your rights (quick recap)</h2>
                    <p className="mb-4">You can:</p>
                    <ul className="list-disc pl-6 mb-4 space-y-1">
                        <li>Be informed about how we use your data.</li>
                        <li>Access a copy.</li>
                        <li>Correct anything wrong.</li>
                        <li>Erase it ("right to be forgotten").</li>
                        <li>Restrict or object to processing.</li>
                        <li>Port it to another provider.</li>
                        <li>Withdraw consent at any time.</li>
                        <li>Complain to the ICO (ico.org.uk).</li>
                    </ul>
                    <p className="mb-4">
                        To exercise any right, email privacy@snytra.com. We'll respond within 30 days (or tell you why we can't).
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-semibold text-charcoal mb-4">12. Data breaches – our 72-hour plan</h2>
                    <p className="mb-4">If a breach slips through, we'll:</p>
                    <ul className="list-disc pl-6 mb-4 space-y-1">
                        <li>Contain it and assess impact within hours.</li>
                        <li>Notify the ICO within 72 hours if risky.</li>
                        <li>Tell affected users ASAP, explaining steps to stay safe.</li>
                        <li>Keep a full incident log for auditing.</li>
                    </ul>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-semibold text-charcoal mb-4">13. Children</h2>
                    <p className="mb-4">
                        Snytra isn't aimed at under-13s. If you learn that a child has shared info with us, let us know and we'll delete it.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-semibold text-charcoal mb-4">14. Changes to this notice</h2>
                    <p className="mb-4">
                        Tiny tweaks appear here with a fresh "Last updated" date. Major rewrites get an inbox or in-app alert 30 days in advance.
                    </p>
                </section>

                <section className="mb-12">
                    <h2 className="text-2xl font-semibold text-charcoal mb-4">15. Talk to a human</h2>
                    <ul className="list-none mb-4 space-y-1">
                        <li><strong>Email:</strong> privacy@snytra.com</li>
                        <li><strong>Post:</strong> Data Protection Officer, 75 Kingsway, London WC2B 6SR</li>
                        <li><strong>Phone:</strong> +44 20 7946 1234</li>
                    </ul>
                    <p className="mb-4">
                        If you're still unhappy, you can complain to the Information Commissioner's Office: ico.org.uk or 0303 123 1113.
                    </p>
                </section>
            </div>
        </main>
    );
} 