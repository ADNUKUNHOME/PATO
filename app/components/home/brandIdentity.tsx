
import Link from "next/link";
import {
    Cormorant_Garamond,
    Manrope,
} from "next/font/google";

const editorial = Cormorant_Garamond({
    subsets: ["latin"],
    weight: ["400", "500", "600"],
    variable: "--font-brand-editorial",
});

const sans = Manrope({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-brand-sans",
});

const values = [
    {
        number: "01",
        title: "Everyday expression",
        description:
            "Style shouldn't be saved for special occasions. Find pieces that feel right, every day.",
    },
    {
        number: "02",
        title: "Style within reach",
        description:
            "Good everyday fashion should feel accessible. Discover considered styles at approachable prices.",
    },
    {
        number: "03",
        title: "Your own perspective",
        description:
            "No rules to follow. No single way to dress. Make every piece your own.",
    },
];

export default function BrandIdentity() {
    return (
        <section
            className={`${editorial.variable} ${sans.variable}
        relative isolate overflow-hidden bg-[#DBD3AD]
        px-5 py-24 text-[#041005]
        sm:px-8 md:py-32 lg:px-14`}
        >
            {/* BACKGROUND TEXTURE */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 opacity-[0.16]"
                style={{
                    backgroundImage:
                        "radial-gradient(#041005 0.5px, transparent 0.5px)",
                    backgroundSize: "7px 7px",
                }}
            />

            <div className="mx-auto max-w-[1600px]">

                {/* TOP IDENTIFIER */}
                <div className="flex items-center justify-between
          border-b border-[#041005]/25 pb-5">

                    <span className="font-[family-name:var(--font-brand-sans)]
            text-[9px] font-bold tracking-[0.25em]">
                        PATO / OUR PHILOSOPHY
                    </span>

                    <span className="font-[family-name:var(--font-brand-sans)]
            text-[9px] tracking-[0.2em] text-[#041005]/55">
                        004 — THE PERSPECTIVE
                    </span>
                </div>

                {/* MAIN MANIFESTO */}
                <div className="relative py-20 md:py-32">

                    <div className="mb-8 flex items-center gap-3">
                        <span className="h-px w-8 bg-[#68734B]" />

                        <span className="font-[family-name:var(--font-brand-sans)]
              text-[9px] font-semibold tracking-[0.25em]
              text-[#68734B]">
                            MORE THAN WHAT YOU WEAR
                        </span>
                    </div>

                    <h2 className="max-w-[1200px]
            font-[family-name:var(--font-brand-editorial)]
            text-[clamp(4rem,11.5vw,11rem)]
            font-normal leading-[0.79]
            tracking-[-0.065em]">

                        Everyday

                        <span className="block italic text-[#68734B]">
                            fashion.
                        </span>

                        <span className="mt-5 block text-[0.52em]
              font-[family-name:var(--font-brand-sans)]
              font-normal leading-[1.1] tracking-[-0.055em]">
                            A DIFFERENT
                        </span>

                        <span className="block">
                            perspective<span className="text-[#68734B]">.</span>
                        </span>
                    </h2>

                    {/* SIDE MARKER */}
                    <div className="mt-12 flex items-center
            justify-between gap-6 md:mt-16">

                        <p className="max-w-[390px]
              font-[family-name:var(--font-brand-sans)]
              text-[12px] leading-[1.9]
              text-[#041005]/75 sm:text-sm">
                            We believe getting dressed should feel effortless.
                            PATO brings together everyday fashion, considered
                            choices and accessible style — giving you the freedom
                            to express yourself in your own way.
                        </p>

                        <div className="hidden shrink-0 flex-col items-center
              gap-3 md:flex">
                            <span className="h-16 w-px bg-[#041005]/40" />

                            <span className="font-[family-name:var(--font-brand-sans)]
                text-[8px] tracking-[0.25em]
                [writing-mode:vertical-rl]">
                                THE PATO MINDSET
                            </span>
                        </div>
                    </div>
                </div>

                {/* DARK VALUES PANEL */}
                <div className="relative overflow-hidden
          bg-[#041005] px-6 py-12 text-[#DBD3AD]
          sm:px-9 md:px-12 md:py-16">

                    {/* Decorative circle */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-20
              -top-28 h-64 w-64 rounded-full
              border border-[#DBD3AD]/10
              md:-right-10 md:-top-40 md:h-96 md:w-96"
                    />

                    <div className="relative">

                        <div className="mb-12 flex items-center
              justify-between gap-4">

                            <div>
                                <p className="font-[family-name:var(--font-brand-sans)]
                  text-[9px] font-semibold tracking-[0.24em]
                  text-[#A5A47A]">
                                    WHAT WE STAND FOR
                                </p>

                                <h3 className="mt-3 font-[family-name:var(--font-brand-editorial)]
                  text-4xl font-normal tracking-tight
                  sm:text-5xl md:text-6xl">
                                    The things that matter.
                                </h3>
                            </div>

                            <span className="hidden font-[family-name:var(--font-brand-sans)]
                text-[9px] tracking-[0.2em]
                text-[#DBD3AD]/40 sm:block">
                                P / VALUES
                            </span>
                        </div>

                        {/* BRAND VALUES */}
                        <div className="grid grid-cols-1
              divide-y divide-[#DBD3AD]/20
              md:grid-cols-3 md:divide-x md:divide-y-0">

                            {values.map((value) => (
                                <div
                                    key={value.number}
                                    className="group py-8 first:pt-0
                    last:pb-0 md:px-7 md:py-2
                    md:first:pl-0 md:last:pr-0"
                                >
                                    <span className="font-[family-name:var(--font-brand-sans)]
                    text-[9px] tracking-[0.2em]
                    text-[#A5A47A]">
                                        {value.number} / 03
                                    </span>

                                    <h4 className="mt-8 font-[family-name:var(--font-brand-editorial)]
                    text-3xl font-medium tracking-tight
                    text-[#DBD3AD] transition-colors
                    duration-300 group-hover:text-[#A5A47A]
                    md:text-4xl">
                                        {value.title}
                                    </h4>

                                    <p className="mt-4 max-w-[280px]
                    font-[family-name:var(--font-brand-sans)]
                    text-[11px] leading-[1.9]
                    text-[#DBD3AD]/60">
                                        {value.description}
                                    </p>
                                </div>
                            ))}

                        </div>
                    </div>
                </div>

                {/* CLOSING STATEMENT */}
                <div className="flex flex-col gap-8
          border-b border-[#041005]/25 py-12
          md:flex-row md:items-end md:justify-between
          md:py-16">

                    <div>
                        <p className="mb-4 font-[family-name:var(--font-brand-sans)]
              text-[9px] font-semibold tracking-[0.25em]
              text-[#68734B]">
                            THIS IS PATO.
                        </p>

                        <p className="max-w-2xl
              font-[family-name:var(--font-brand-editorial)]
              text-4xl leading-[0.95] tracking-tight
              sm:text-5xl md:text-6xl">
                            Wear what feels like <span className="italic">
                                you.
                            </span>
                        </p>
                    </div>

                    <Link
                        href="/collections/all"
                        className="group flex w-fit items-center
              gap-5 border-b border-[#041005]
              pb-2 font-[family-name:var(--font-brand-sans)]
              text-[9px] font-bold tracking-[0.18em]">

                        DISCOVER PATO

                        <span className="text-base transition-transform
              duration-300 group-hover:translate-x-2">
                            →
                        </span>
                    </Link>
                </div>

                {/* FOOTER */}
                <div className="flex items-center
          justify-between pt-5">

                    <span className="font-[family-name:var(--font-brand-sans)]
            text-[8px] tracking-[0.2em]
            text-[#041005]/50">
                        EVERYDAY FASHION. A DIFFERENT PERSPECTIVE.
                    </span>

                    <span className="font-[family-name:var(--font-brand-sans)]
            text-[8px] tracking-[0.2em]
            text-[#041005]/50">
                        PATO®
                    </span>
                </div>

            </div>
        </section>
    );
}
