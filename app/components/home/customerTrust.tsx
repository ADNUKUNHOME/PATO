
import Link from "next/link";
import { Cormorant_Garamond, Manrope } from "next/font/google";

const editorial = Cormorant_Garamond({
    subsets: ["latin"],
    weight: ["400", "500", "600"],
    variable: "--font-trust-editorial",
});

const sans = Manrope({
    subsets: ["latin"],
    variable: "--font-trust-sans",
});

const assurances = [
    {
        number: "01",
        eyebrow: "DELIVERY",
        title: "Your order,",
        highlight: "on its way.",
        description:
            "Find out where we deliver, the estimated delivery time and any applicable shipping charges.",
        href: "/shipping-policy",
        linkLabel: "Delivery information",
        mark: "↗",
    },
    {
        number: "02",
        eyebrow: "RETURNS & EXCHANGES",
        title: "The right fit",
        highlight: "matters.",
        description:
            "Check our return and exchange conditions, including eligibility, timelines and how to request one.",
        href: "/return-policy",
        linkLabel: "Read the policy",
        mark: "↗",
    },
    {
        number: "03",
        eyebrow: "PAYMENT",
        title: "Checkout",
        highlight: "with confidence.",
        description:
            "See the payment methods we accept and the security measures used during checkout.",
        href: "/payment-information",
        linkLabel: "Payment information",
        mark: "↗",
    },
    {
        number: "04",
        eyebrow: "CUSTOMER SUPPORT",
        title: "We're here",
        highlight: "to help.",
        description:
            "Have a question about an order, product or delivery? Get in touch with our support team.",
        href: "/contact",
        linkLabel: "Contact PATO",
        mark: "↗",
    },
];

export default function CustomerTrust() {
    return (
        <section
            className={`${editorial.variable} ${sans.variable} relative overflow-hidden bg-[#DBD3AD] text-[#041005]`}
        >
            {/* Editorial background details */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-28 top-20 h-80 w-80 rounded-full border border-[#68734B]/20"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 top-32 h-56 w-56 rounded-full border border-[#68734B]/20"
            />

            <div className="relative mx-auto max-w-[1600px] px-5 py-20 sm:px-8 sm:py-28 lg:px-14 lg:py-36">
                {/* Header */}
                <div className="grid gap-10 lg:grid-cols-[1fr_0.65fr] lg:items-end">
                    <div>
                        <div className="mb-7 flex items-center gap-3">
                            <span className="h-px w-9 bg-[#68734B]" />
                            <span className="font-[var(--font-trust-sans)] text-[10px] font-semibold tracking-[0.24em] text-[#68734B]">
                                THE PATO PROMISE / 07
                            </span>
                        </div>

                        <h2 className="max-w-4xl font-[var(--font-trust-editorial)] text-[clamp(3.8rem,9vw,9rem)] leading-[0.82] tracking-[-0.065em]">
                            Good style.
                            <br />
                            <span className="italic text-[#68734B]">
                                No second
                            </span>
                            <br />
                            thoughts.
                        </h2>
                    </div>

                    <div className="max-w-sm pb-2 lg:justify-self-end">
                        <p className="font-[var(--font-trust-sans)] text-sm leading-7 text-[#041005]/70 sm:text-base">
                            Shopping should feel as good as wearing what you love.
                            Here are the details that make your PATO experience
                            clearer, easier and more reassuring.
                        </p>
                        <div className="mt-7 flex items-center gap-3">
                            <span className="h-2 w-2 rounded-full bg-[#68734B]" />
                            <span className="font-[var(--font-trust-sans)] text-[9px] font-semibold tracking-[0.2em]">
                                TRANSPARENCY IS ALWAYS IN STYLE
                            </span>
                        </div>
                    </div>
                </div>

                {/* Assurance grid */}
                <div className="mt-16 grid border-t border-[#041005]/25 sm:mt-24 sm:grid-cols-2">
                    {assurances.map((item, index) => (
                        <article
                            key={item.number}
                            className={`group relative flex min-h-[250px] flex-col justify-between border-b border-[#041005]/25 py-8 sm:min-h-[290px] sm:p-9 lg:p-12 ${index % 2 === 0
                                ? "sm:border-r sm:border-[#041005]/25"
                                : ""
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <span className="font-[var(--font-trust-sans)] text-[10px] font-semibold tracking-[0.18em] text-[#68734B]">
                                    {item.number} / {item.eyebrow}
                                </span>

                                <span
                                    aria-hidden="true"
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#041005]/25 text-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:bg-[#041005] group-hover:text-[#DBD3AD]"
                                >
                                    {item.mark}
                                </span>
                            </div>

                            <div className="mt-10">
                                <h3 className="font-[var(--font-trust-editorial)] text-[clamp(2.6rem,5vw,4.6rem)] leading-[0.9] tracking-[-0.045em]">
                                    {item.title}
                                    <br />
                                    <span className="italic text-[#68734B]">
                                        {item.highlight}
                                    </span>
                                </h3>

                                <p className="mt-5 max-w-sm font-[var(--font-trust-sans)] text-xs leading-6 text-[#041005]/65 sm:text-sm">
                                    {item.description}
                                </p>

                                <Link
                                    href={item.href}
                                    className="mt-6 inline-flex items-center gap-3 border-b border-[#041005]/50 pb-1 font-[var(--font-trust-sans)] text-[10px] font-bold tracking-[0.13em] transition-colors hover:border-[#68734B] hover:text-[#68734B]"
                                >
                                    {item.linkLabel}
                                    <span aria-hidden="true">↗</span>
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>

                {/* Closing brand statement */}
                <div className="mt-14 flex flex-col gap-5 border-t border-[#041005]/25 pt-7 sm:mt-20 sm:flex-row sm:items-end sm:justify-between">
                    <p className="max-w-xl font-[var(--font-trust-editorial)] text-3xl leading-tight tracking-[-0.035em] sm:text-4xl">
                        The little details.
                        <span className="italic text-[#68734B]">
                            {" "}The better experience.
                        </span>
                    </p>

                    <span className="font-[var(--font-trust-sans)] text-[9px] font-semibold tracking-[0.2em] text-[#041005]/50">
                        PATO.COM — MADE FOR EVERYDAY
                    </span>
                </div>
            </div>
        </section>
    );
}
