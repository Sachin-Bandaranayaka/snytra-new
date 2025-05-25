import Link from "next/link";
import Image from "next/image";
import ImageSlideWrapper from "@/components/ImageSlideWrapper";
import FAQAccordion from "@/components/FAQAccordion";
import ReviewSection from "@/components/ReviewSection";

export default function Home() {
  return (
    <>
      {/* Hero Section with Dashboard */}
      <section className="bg-beige py-12 md:py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
              Business Management Made Simple
            </h1>
            <p className="text-charcoal text-lg mb-8">
              SNYTRA provides a complete solution for business owners to manage their operations efficiently.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/register"
                className="bg-primary text-white px-6 py-3 rounded text-lg font-medium hover:bg-primary/90 transition-colors">
                Get Started
              </Link>
              <Link href="/request-demo"
                className="border border-primary text-primary px-6 py-3 rounded text-lg font-medium hover:bg-beige transition-colors">
                Request Demo
              </Link>
            </div>
          </div>

          <div className="mt-8 mb-4">
            <ImageSlideWrapper />
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-20 bg-gradient-to-b from-white to-beige/30">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-primary text-center mb-4">
            Features Overview
          </h2>
          <p className="text-center text-charcoal mb-16 text-lg max-w-2xl mx-auto">Discover our useful features designed to streamline your business operations</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-primary/10 hover:border-primary/30 transition-all hover:shadow-xl group">
              <div className="bg-primary/10 w-16 h-16 flex items-center justify-center rounded-full mb-6 group-hover:bg-primary/20 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-primary">Menu & Inventory Management</h3>
              <p className="text-charcoal">
                Efficiently manage your menu items and inventory levels.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-primary/10 hover:border-primary/30 transition-all hover:shadow-xl group">
              <div className="bg-primary/10 w-16 h-16 flex items-center justify-center rounded-full mb-6 group-hover:bg-primary/20 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-primary">Customer Engagement</h3>
              <p className="text-charcoal">
                Enhance customer loyalty with QR ordering and effective communication.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-primary/10 hover:border-primary/30 transition-all hover:shadow-xl group">
              <div className="bg-primary/10 w-16 h-16 flex items-center justify-center rounded-full mb-6 group-hover:bg-primary/20 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-primary">Real-Time Analytics</h3>
              <p className="text-charcoal">
                Gain valuable insights into sales trends and stock levels.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-primary/10 hover:border-primary/30 transition-all hover:shadow-xl group">
              <div className="bg-primary/10 w-16 h-16 flex items-center justify-center rounded-full mb-6 group-hover:bg-primary/20 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-primary">Order Management</h3>
              <p className="text-charcoal">
                Stay on top of live orders, refunds, and updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Online Ordering System Section */}
      <section className="py-20 bg-beige">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">
                Online Ordering System
              </h2>
              <p className="text-lg mb-8 text-charcoal leading-relaxed">
                Streamline your business operations with our comprehensive online ordering system. Our platform helps you manage orders, menus, and customer data efficiently, all in one place.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-start">
                  <svg className="flex-shrink-0 h-6 w-6 text-olive mt-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3 text-charcoal">Menu Management</span>
                </div>
                <div className="flex items-start">
                  <svg className="flex-shrink-0 h-6 w-6 text-olive mt-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3 text-charcoal">Order Processing</span>
                </div>
                <div className="flex items-start">
                  <svg className="flex-shrink-0 h-6 w-6 text-olive mt-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3 text-charcoal">Customer Management</span>
                </div>
                <div className="flex items-start">
                  <svg className="flex-shrink-0 h-6 w-6 text-olive mt-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3 text-charcoal">Real-time Analytics</span>
                </div>
              </div>
              <div className="flex flex-row gap-4">
                <Link
                  href="/products/online-ordering-system"
                  className="bg-primary text-white px-6 py-3 rounded-md font-medium text-center hover:bg-primary/90 transition-colors w-full md:w-auto"
                >
                  Learn More
                </Link>
                <Link
                  href="/register?product=online-ordering-system"
                  className="border border-primary text-primary px-6 py-3 rounded-md font-medium text-center hover:bg-beige/70 transition-colors w-full md:w-auto"
                >
                  Get Started
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="rounded-lg overflow-hidden shadow-xl border border-lightGray">
                <Image
                  src="https://utfs.io/f/N6Qv8dPmZYGOaNvU0he8bSzrTmEU7AlveqCFHo1nB4iJOX5c"
                  alt="Online Ordering System Dashboard"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-primary text-center mb-12">
            How Our Ordering System Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-beige/30 p-8 rounded-lg border border-lightGray">
              <div className="flex items-center justify-center w-16 h-16 bg-primary text-white rounded-full mb-6 text-2xl font-bold mx-auto">1</div>
              <h3 className="text-xl font-bold mb-4 text-center">Create Your Menu</h3>
              <p className="text-center text-charcoal">
                Easily upload your menu items with descriptions, images, pricing, and categorization.
              </p>
            </div>
            <div className="bg-beige/30 p-8 rounded-lg border border-lightGray">
              <div className="flex items-center justify-center w-16 h-16 bg-primary text-white rounded-full mb-6 text-2xl font-bold mx-auto">2</div>
              <h3 className="text-xl font-bold mb-4 text-center">Receive Orders</h3>
              <p className="text-center text-charcoal">
                Get instant notifications when customers place orders through your website or mobile app.
              </p>
            </div>
            <div className="bg-beige/30 p-8 rounded-lg border border-lightGray">
              <div className="flex items-center justify-center w-16 h-16 bg-primary text-white rounded-full mb-6 text-2xl font-bold mx-auto">3</div>
              <h3 className="text-xl font-bold mb-4 text-center">Fulfill & Analyze</h3>
              <p className="text-center text-charcoal">
                Process orders efficiently and gain insights from detailed analytics on sales and customer behavior.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-16 bg-beige">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-primary text-center mb-3">
            What We Offer
          </h2>
          <p className="text-center text-charcoal mb-12">Discover our top offerings</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Table Scan & Ordering */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2 text-primary">Table Scan & Ordering</h3>
              <p className="text-sm text-charcoal">Efficient order placement</p>
            </div>

            {/* Order Tracking */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2 text-primary">Order Tracking</h3>
              <p className="text-sm text-charcoal">Real-time order Tracking</p>
            </div>

            {/* Inventory Management */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2 text-primary">Inventory Management</h3>
              <p className="text-sm text-charcoal">Track & manage stock levels</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mt-8">
            {/* Admin Dashboard */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2 text-primary">Admin Dashboard</h3>
              <p className="text-sm text-charcoal">Comprehensive admin tools</p>
            </div>

            {/* Kitchen/Staff Dashboard */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2 text-primary">Kitchen/Staff Dashboard</h3>
              <p className="text-sm text-charcoal">View orders and get them ready for the user</p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews - Using dynamic component */}
      <ReviewSection />

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-primary text-center mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-center text-charcoal mb-12">Find answers to common questions about our platform</p>

          <div className="max-w-3xl mx-auto">
            <FAQAccordion />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-primary mb-6">Ready to Streamline Your Business?</h2>
          <p className="text-lg mb-8 max-w-3xl mx-auto text-charcoal">
            Join thousands of business owners who are using our platform to grow their business and enhance customer experience.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register"
              className="bg-primary text-white px-8 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
