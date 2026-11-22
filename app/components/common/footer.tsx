
import Link from "next/link";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import CopyrightYear from "./copyright-year";

const editorial = Cormorant_Garamond({
    subsets: ["latin"],
    weight: ["400", "500", "600"],
    variable: "--font-footer-editorial",
});

const sans = Manrope({
    subsets: ["latin"],
    variable: "--font-footer-sans",
});

const navigation = [
    {
        title: "EXPLORE",
        links: [
            { label: "About PATO", href: "/about" },
            { label: "Contact", href: "/contact" },
            { label: "FAQ", href: "/faq" },
            { label: "Instagram", href: "https://www.instagram.com/", external: true },
        ],
    },
    {
        title: "YOUR ORDER",
        links: [
            { label: "Track your order", href: "/track-order" },
            { label: "Shipping information", href: "/shipping-policy" },
            { label: "Returns & exchanges", href: "/return-policy" },
            { label: "Payment information", href: "/payment-information" },
        ],
    },
    {
        title: "THE DETAILS",
        links: [
            { label: "Privacy policy", href: "/privacy-policy" },
            { label: "Terms & conditions", href: "/terms-and-conditions" },
        ],
    },
];

export default function Footer() {
    return (
        <footer
            className={`${editorial.variable} ${sans.variable} relative overflow-hidden bg-[#041005] text-[#DBD3AD]`}
        >
            <div className="relative mx-auto max-w-[1600px] px-5 pt-20 sm:px-8 sm:pt-28 lg:px-14 lg:pt-36">

                {/* Closing statement */}
                <div className="grid gap-8 border-b border-[#DBD3AD]/20 pb-16 lg:grid-cols-[1fr_auto] lg:items-end lg:pb-24">
                    <div>
                        <div className="mb-7 flex items-center gap-3">
                            <span className="h-px w-9 bg-[#A5A47A]" />
                            <span className="font-[var(--font-footer-sans)] text-[10px] font-semibold tracking-[0.24em] text-[#A5A47A]">
                                THE PATO EXPERIENCE
                            </span>
                        </div>

                        <h2 className="max-w-4xl font-[var(--font-footer-editorial)] text-[clamp(3.5rem,8vw,8rem)] leading-[0.82] tracking-[-0.06em]">
                            Wear your
                            <br />
                            <span className="italic text-[#A5A47A]">
                                own perspective.
                            </span>
                        </h2>
                    </div>

                    <p className="max-w-xs font-[var(--font-footer-sans)] text-xs leading-7 text-[#DBD3AD]/60 lg:pb-2">
                        Everyday fashion. A different perspective.
                        <br />
                        Discover your style with PATO.
                    </p>
                </div>

                {/* Navigation and brand details */}
                <div className="grid gap-14 py-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:gap-10 lg:py-20">

                    {/* Brand identity */}
                    <div className="flex flex-col justify-between gap-8">
                        <div>
                            <Link
                                href="/"
                                aria-label="PATO home"
                                className="inline-block font-[var(--font-footer-editorial)] text-7xl font-semibold leading-none tracking-[-0.09em] transition-colors duration-300 hover:text-[#A5A47A] sm:text-8xl"
                            >
                                PATO<span className="text-[#A5A47A]">.</span>
                            </Link>
                            <p className="mt-2 pl-1 font-[var(--font-footer-sans)] text-[10px] tracking-[0.38em] text-[#DBD3AD]/60">
                                COM
                            </p>
                        </div>

                        <p className="max-w-[230px] font-[var(--font-footer-sans)] text-xs leading-6 text-[#DBD3AD]/55">
                            A little less ordinary.
                            A little more you.
                            <br />
                            <span className="text-[#A5A47A]">
                                This is PATO.
                            </span>
                        </p>
                    </div>

                    {/* Link groups */}
                    {navigation.map((group) => (
                        <div key={group.title}>
                            <h3 className="mb-7 font-[var(--font-footer-sans)] text-[10px] font-bold tracking-[0.2em] text-[#A5A47A]">
                                {group.title}
                            </h3>

                            <ul className="space-y-5">
                                {group.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            target={link.external ? "_blank" : undefined}
                                            rel={link.external ? "noopener noreferrer" : undefined}
                                            className="group inline-flex items-center gap-2 font-[var(--font-footer-sans)] text-sm text-[#DBD3AD]/75 transition-colors duration-300 hover:text-[#DBD3AD]"
                                        >
                                            <span>{link.label}</span>
                                            {link.external && (
                                                <span className="text-[10px] text-[#A5A47A] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                                                    ↗
                                                </span>
                                            )}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Oversized brand signature */}
                <div className="relative border-t border-[#DBD3AD]/20 pt-7">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-[var(--font-footer-editorial)] text-[clamp(8rem,24vw,23rem)] font-semibold leading-[0.7] tracking-[-0.09em] text-[#DBD3AD]/[0.035]"
                    >
                        PATO
                    </div>

                    <div className="relative flex flex-col gap-5 pb-8 sm:flex-row sm:items-center sm:justify-between">
                        <span className="font-[var(--font-footer-sans)] text-[9px] tracking-[0.18em] text-[#DBD3AD]/50">
                            <CopyrightYear />
                        </span>

                        <span className="font-[var(--font-footer-sans)] text-[9px] tracking-[0.18em] text-[#DBD3AD]/50">
                            EVERYDAY FASHION. A DIFFERENT PERSPECTIVE.
                        </span>

                        <Link
                            href="/"
                            className="font-[var(--font-footer-sans)] text-[9px] font-bold tracking-[0.18em] text-[#A5A47A] transition-colors hover:text-[#DBD3AD]"
                        >
                            BACK TO TOP ↑
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
