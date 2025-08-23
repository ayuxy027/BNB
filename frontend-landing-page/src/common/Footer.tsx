import Link from "next/link"
import Image from "next/image"
import logo from '../modules/Waitlist/assets/logo.png'

const Footer = () => {
    const sections = {
        product: {
            title: "Product",
            items: [
                { label: "AI Image Generation", href: "/", external: false },
                { label: "Gallery Showcase", href: "/", external: false },
                { label: "Web3 Licensing", href: "/", external: false },
            ],
        },
        company: {
            title: "Company",
            items: [
                { label: "About FluxGallery", href: "/", external: false },
                { label: "Blog", href: "/", external: false },
                { label: "Careers", href: "/", external: false },
            ],
        },
        resources: {
            title: "Resources",
            items: [
                { label: "Contact", href: "/", external: false },
                { label: "Support", href: "/", external: false },
                { label: "Privacy Policy", href: "/", external: false },
            ],
        },
        partners: {
            title: "Developers",
            items: [
                { label: "API Documentation", href: "/", external: false },
                { label: "Integration Guide", href: "/", external: false },
                { label: "System Status", href: "/", external: true },
                { label: "Partner Program", href: "/", external: false },
            ],
        },
    }

    return (
        <div className="px-4 xl:px-0 bg-gradient-to-b from-gray-50 to-white">
            <footer className="relative mx-auto max-w-6xl pt-16 pb-8">
                {/* Decorative gradient line at top */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00F5FF]/30 to-transparent"></div>
                
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 lg:gap-12">
                    {/* Logo and Brand Section */}
                    <div className="lg:col-span-2 flex flex-col">
                        <Link
                            href="/"
                            className="flex items-center font-bold text-2xl text-gray-800 mb-4 group"
                        >
                            
                            <span className=" bg-gradient-to-r from-gray-800 to-[#748298] bg-clip-text text-transparent">
                                FluxGallery
                            </span>
                        </Link>
                        
                        <p className="text-gray-600 text-sm leading-relaxed mb-6 max-w-md">
                            Create stunning AI-generated visuals, showcase them beautifully, and monetize through transparent Web3 licensing.
                        </p>

                        {/* Social Icons */}
                        <div className="flex items-center space-x-3">
                            <Link
                                href="/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative p-2.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-white hover:border-[#00F5FF] transition-all duration-300 hover:shadow-lg hover:shadow-[#00F5FF]/20"
                            >
                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00F5FF] to-[#0080FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <svg className="size-4 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </Link>
                            
                            <Link
                                href="/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative p-2.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-white hover:border-[#00F5FF] transition-all duration-300 hover:shadow-lg hover:shadow-[#00F5FF]/20"
                            >
                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00F5FF] to-[#0080FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <svg className="size-4 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                            </Link>
                            
                            <Link
                                href="/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative p-2.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-white hover:border-[#00F5FF] transition-all duration-300 hover:shadow-lg hover:shadow-[#00F5FF]/20"
                            >
                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00F5FF] to-[#0080FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <svg className="size-4 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.725-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                            </Link>
                            
                            <Link
                                href="/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative p-2.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-white hover:border-[#00F5FF] transition-all duration-300 hover:shadow-lg hover:shadow-[#00F5FF]/20"
                            >
                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00F5FF] to-[#0080FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <svg className="size-4 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                </svg>
                            </Link>
                        </div>
                    </div>

                    {/* Footer Sections */}
                    {Object.entries(sections).map(([key, section]) => (
                        <div key={key} className="lg:col-span-1">
                            <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">
                                {section.title}
                            </h3>
                            <ul className="space-y-3">
                                {section.items.map((item) => (
                                    <li key={item.label}>
                                        <Link
                                            href={item.href}
                                            className="text-gray-600 hover:text-[#00F5FF] transition-colors duration-200 text-sm flex items-center group"
                                        >
                                            <span className="relative">
                                                {item.label}
                                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#00F5FF] to-[#0080FF] group-hover:w-full transition-all duration-300"></span>
                                            </span>
                                            {item.external && (
                                                <svg className="size-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            )}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Section */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <span>© 2024 FluxGallery. All rights reserved.</span>
                            <Link href="/" className="hover:text-[#00F5FF] transition-colors duration-200">
                                Terms
                            </Link>
                            <Link href="/" className="hover:text-[#00F5FF] transition-colors duration-200">
                                Privacy
                            </Link>
                        </div>
                        <div className="text-sm text-gray-600">
                            Made with <span className="text-red-500 animate-pulse">❤️</span> by{' '}
                            <a 
                                href="https://x.com/ayuxy027" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-[#00F5FF] hover:text-[#0080FF] font-medium transition-colors duration-200"
                            >
                                404Found
                            </a>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-8 right-8 w-24 h-24 bg-gradient-to-br from-[#00F5FF]/10 to-[#0080FF]/10 rounded-full blur-xl"></div>
                <div className="absolute bottom-8 left-8 w-32 h-32 bg-gradient-to-br from-[#00F5FF]/5 to-[#0080FF]/5 rounded-full blur-xl"></div>
            </footer>
        </div>
    )
}

export default Footer