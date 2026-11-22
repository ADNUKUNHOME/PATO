
import Link from "next/link";
import {
    Cormorant_Garamond,
    Manrope,
} from "next/font/google";

const editorial = Cormorant_Garamond({
    subsets: ["latin"],
    weight: ["400", "500", "600"],
    variable: "--font-editorial",
});

const sans = Manrope({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-sans",
});

const collections = [
    {
        number: "01",
        name: "MEN",
        subtitle: "A considered everyday wardrobe.",
        label: "EXPLORE MENSWEAR",
        href: "/collections/men",
        image:
            "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1400&q=85",
        imagePosition: "center 35%",
        className: "md:col-span-7",
    },
    {
        number: "02",
        name: "WOMEN",
        subtitle: "Everyday pieces, distinct expression.",
        label: "EXPLORE WOMENSWEAR",
        href: "/collections/women",
        image:
            "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85",
        imagePosition: "center 30%",
        className: "md:col-span-5",
    },
];

function Arrow() {
    return (
        <span
            aria-hidden="true"
            className="inline-flex transition-transform duration-500
      ease-out group-hover:translate-x-1 group-hover:-translate-y-1"
        >
            ↗
        </span>
    );
}

export default function CollectionDiscovery() {
    return (
        <section
            className={`${editorial.variable} ${sans.variable}
      relative overflow-hidden bg-[#041005] px-5 py-24
      text-[#DBD3AD] sm:px-8 md:py-32 lg:px-14`}
        >
            {/* Subtle background texture */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.12]"
                style={{
                    backgroundImage:
                        "radial-gradient(#DBD3AD 0.55px, transparent 0.55px)",
                    backgroundSize: "8px 8px",
                    maskImage:
                        "linear-gradient(to bottom, transparent, black 30%, transparent)",
                }}
            />

            <div className="relative mx-auto max-w-[1600px]">

                {/* SECTION HEADER */}
                <div className="mb-10 flex items-end justify-between
          border-b border-[#DBD3AD]/20 pb-5 md:mb-14">

                    <div>
                        <p className="mb-3 font-[family-name:var(--font-sans)]
              text-[9px] font-semibold tracking-[0.28em]
              text-[#A5A47A] sm:text-[10px]">
                            THE PATO EXPERIENCE — 001
                        </p>

                        <h2 className="font-[family-name:var(--font-editorial)]
              text-5xl font-normal leading-[0.9] tracking-[-0.04em]
              sm:text-6xl md:text-8xl">
                            Find your <span className="italic text-[#A5A47A]">
                                expression.
                            </span>
                        </h2>
                    </div>

                    <span className="hidden pb-1 font-[family-name:var(--font-sans)]
            text-[9px] tracking-[0.2em] text-[#DBD3AD]/50 md:block">
                        DISCOVER / 2026
                    </span>
                </div>

                {/* MEN & WOMEN */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5">

                    {collections.map((collection) => (
                        <Link
                            key={collection.number}
                            href={collection.href}
                            aria-label={`Explore ${collection.name.toLowerCase()} collection`}
                            className={`group relative isolate block min-h-[460px]
                overflow-hidden bg-[#192219] md:min-h-[620px]
                ${collection.className}`}
                        >

                            {/* IMAGE */}
                            <div
                                aria-hidden="true"
                                className="absolute inset-0 bg-cover
                  transition-transform duration-1000
                  ease-[cubic-bezier(0.2,0.65,0.3,1)]
                  group-hover:scale-[1.045]
                  motion-reduce:transition-none"
                                style={{
                                    backgroundImage: `url("${collection.image}")`,
                                    backgroundPosition: collection.imagePosition,
                                }}
                            />

                            {/* OVERLAY */}
                            <div
                                aria-hidden="true"
                                className="absolute inset-0 bg-gradient-to-t
                  from-[#041005]/95 via-[#041005]/10
                  to-[#041005]/20"
                            />

                            {/* TOP LABEL */}
                            <div className="absolute left-5 right-5 top-5
                flex items-center justify-between md:left-7
                md:right-7 md:top-7">
                                <span className="font-[family-name:var(--font-sans)]
                  text-[9px] tracking-[0.2em] text-white/80">
                                    COLLECTION {collection.number}
                                </span>

                                <span className="flex size-9 items-center justify-center
                  rounded-full border border-white/50 text-white
                  transition-all duration-500 group-hover:rotate-45
                  group-hover:bg-[#DBD3AD] group-hover:text-[#041005]">
                                    ↗
                                </span>
                            </div>

                            {/* BOTTOM CONTENT */}
                            <div className="absolute inset-x-0 bottom-0
                flex flex-col px-6 pb-7 md:px-8 md:pb-9">

                                <p className="mb-2 font-[family-name:var(--font-sans)]
                  text-[9px] tracking-[0.18em] text-[#DBD3AD]/75">
                                    {collection.subtitle}
                                </p>

                                <h3 className="font-[family-name:var(--font-editorial)]
                  text-[clamp(5rem,12vw,9rem)] font-normal
                  leading-[0.78] tracking-[-0.06em] text-[#F4F0E4]">
                                    {collection.name}
                                </h3>

                                <div className="mt-7 flex items-center
                  justify-between border-t border-white/30 pt-4">

                                    <span className="font-[family-name:var(--font-sans)]
                    text-[9px] font-semibold tracking-[0.2em]
                    text-[#F4F0E4]">
                                        {collection.label}
                                    </span>

                                    <span className="text-xl text-[#DBD3AD]">
                                        <Arrow />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}

                </div>

                {/* NEW ARRIVALS */}
                <Link
                    href="/collections/new-arrivals"
                    aria-label="Explore new arrivals"
                    className="group relative isolate mt-4 flex min-h-[300px]
            overflow-hidden bg-[#22291D] md:mt-5 md:min-h-[350px]"
                >

                    {/* IMAGE */}
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-cover bg-center
              transition-transform duration-1000
              ease-[cubic-bezier(0.2,0.65,0.3,1)]
              group-hover:scale-[1.035]
              motion-reduce:transition-none"
                        style={{
                            backgroundImage:
                                "url('https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=85')",
                            backgroundPosition: "center 45%",
                        }}
                    />

                    <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-r
              from-[#041005]/95 via-[#041005]/65
              to-[#041005]/10"
                    />

                    {/* CONTENT */}
                    <div className="relative flex w-full flex-col
            justify-center px-6 py-12 md:px-12 md:py-16">

                        <div className="mb-6 flex items-center gap-3">
                            <span className="size-1.5 rounded-full bg-[#C5C18A]" />

                            <span className="font-[family-name:var(--font-sans)]
                text-[9px] tracking-[0.25em] text-[#DBD3AD]">
                                JUST LANDED
                            </span>
                        </div>

                        <h3 className="max-w-3xl font-[family-name:var(--font-editorial)]
              text-6xl font-normal leading-[0.83]
              tracking-[-0.05em] text-[#F4F0E4]
              sm:text-7xl md:text-8xl lg:text-9xl">
                            New <span className="italic text-[#C5C18A]">
                                arrivals.
                            </span>
                        </h3>

                        <div className="mt-8 flex items-center gap-5">
                            <span className="border-b border-[#DBD3AD]
                pb-1 font-[family-name:var(--font-sans)]
                text-[9px] font-semibold tracking-[0.2em]">
                                DISCOVER WHAT'S NEW
                            </span>

                            <span className="text-xl transition-transform
                duration-500 group-hover:translate-x-2">
                                →
                            </span>
                        </div>

                    </div>

                    <span className="absolute bottom-5 right-6
            hidden font-[family-name:var(--font-sans)]
            text-[9px] tracking-[0.2em] text-white/70
            md:block">
                        PATO / NEW SEASON
                    </span>

                </Link>

                {/* SECTION FOOTER */}
                <div className="mt-8 flex items-center justify-between
          border-t border-[#DBD3AD]/20 pt-4">

                    <span className="font-[family-name:var(--font-sans)]
            text-[8px] tracking-[0.2em] text-[#DBD3AD]/45">
                        MADE FOR EVERYDAY EXPRESSION.
                    </span>

                    <span className="font-[family-name:var(--font-sans)]
            text-[8px] tracking-[0.2em] text-[#DBD3AD]/45">
                        PATO.COM — 001
                    </span>

                </div>

            </div>
        </section>
    );
}
