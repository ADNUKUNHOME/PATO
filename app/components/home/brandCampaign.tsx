
import Link from "next/link";
import {
    Cormorant_Garamond,
    Manrope,
} from "next/font/google";

const editorial = Cormorant_Garamond({
    subsets: ["latin"],
    weight: ["400", "500", "600"],
    variable: "--font-campaign-editorial",
});

const sans = Manrope({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-campaign-sans",
});

export default function BrandCampaign() {
    return (
        <section
            className={`${editorial.variable} ${sans.variable}
        bg-[#041005] px-3 py-16
        sm:px-5 md:px-8 md:py-24 lg:px-14`}
        >
            <div className="mx-auto max-w-[1600px]">

                {/* CAMPAIGN IDENTIFIER */}
                <div className="mb-5 flex items-center justify-between
          border-b border-[#DBD3AD]/25 pb-4">

                    <span className="font-[family-name:var(--font-campaign-sans)]
            text-[9px] font-bold tracking-[0.25em]
            text-[#A5A47A]">
                        PATO / VISUAL CAMPAIGN
                    </span>

                    <span className="font-[family-name:var(--font-campaign-sans)]
            text-[9px] tracking-[0.2em]
            text-[#DBD3AD]/50">
                        006 — BEYOND
                    </span>
                </div>

                {/* MAIN CAMPAIGN */}
                <div className="group relative isolate min-h-[650px]
          overflow-hidden bg-[#172218]
          sm:min-h-[720px] md:min-h-[760px]
          lg:min-h-[820px]">

                    {/* CAMPAIGN IMAGE */}
                    <img
                        src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=2200&q=90"
                        alt="Fashion campaign showcasing contemporary everyday style"
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 -z-20 h-full w-full
              object-cover object-[58%_center]
              transition-transform duration-[1400ms]
              ease-out group-hover:scale-[1.035]
              motion-reduce:transition-none
              md:object-center"
                    />

                    {/* DARK GREEN TINT */}
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 -z-10
              bg-[#041005]/45"
                    />

                    {/* EDITORIAL GRADIENT */}
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 -z-10
              bg-gradient-to-t
              from-[#041005] via-[#041005]/35
              to-[#041005]/10"
                    />

                    {/* SIDE DECORATIVE MARKER */}
                    <div className="absolute right-5 top-1/2
            hidden -translate-y-1/2 flex-col
            items-center gap-4 md:flex">

                        <span className="h-20 w-px bg-[#DBD3AD]/50" />

                        <span className="font-[family-name:var(--font-campaign-sans)]
              text-[8px] tracking-[0.25em]
              text-[#DBD3AD]/80
              [writing-mode:vertical-rl]">
                            THE PATO PERSPECTIVE
                        </span>

                        <span className="h-20 w-px bg-[#DBD3AD]/50" />
                    </div>

                    {/* TOP CAMPAIGN DETAILS */}
                    <div className="absolute left-6 right-6 top-6
            flex items-center justify-between
            sm:left-9 sm:right-9 sm:top-9
            md:left-12 md:right-12">

                        <span className="font-[family-name:var(--font-campaign-sans)]
              text-[8px] font-semibold tracking-[0.25em]
              text-[#DBD3AD] sm:text-[9px]">
                            A DIFFERENT WAY OF SEEING.
                        </span>

                        <span className="font-[family-name:var(--font-campaign-sans)]
              text-[8px] tracking-[0.2em]
              text-[#DBD3AD]/80 sm:text-[9px]">
                            P / 001
                        </span>
                    </div>

                    {/* CAMPAIGN CONTENT */}
                    <div className="absolute inset-x-0 bottom-0
            px-6 pb-9 sm:px-9 sm:pb-12
            md:px-14 md:pb-16 lg:px-20 lg:pb-20">

                        <div className="mb-6 flex items-center gap-3">
                            <span className="h-px w-8 bg-[#A5A47A]" />

                            <span className="font-[family-name:var(--font-campaign-sans)]
                text-[9px] font-bold tracking-[0.25em]
                text-[#DBD3AD]">
                                THE PATO CAMPAIGN
                            </span>
                        </div>

                        <h2 className="max-w-[1000px]
              font-[family-name:var(--font-campaign-editorial)]
              text-[clamp(4.5rem,12vw,11.5rem)]
              font-normal leading-[0.77]
              tracking-[-0.065em] text-[#F4F0E4]">

                            Beyond

                            <span className="block italic text-[#DBD3AD]">
                                the everyday.
                            </span>
                        </h2>

                        <div className="mt-8 flex flex-col gap-8
              border-t border-[#DBD3AD]/35 pt-6
              sm:flex-row sm:items-end
              sm:justify-between md:mt-10">

                            <p className="max-w-[360px]
                font-[family-name:var(--font-campaign-sans)]
                text-[11px] leading-[1.9]
                text-[#DBD3AD]/85 sm:text-xs">
                                Everyday fashion doesn't have to feel ordinary.
                                Discover considered styles, express your perspective
                                and make every day your own.
                            </p>

                            <Link
                                href="/collections/all"
                                className="group/link flex h-14 w-full
                  items-center justify-between gap-8
                  border border-[#DBD3AD]/70
                  px-5 font-[family-name:var(--font-campaign-sans)]
                  text-[9px] font-bold tracking-[0.2em]
                  text-[#DBD3AD]
                  transition-all duration-300
                  hover:bg-[#DBD3AD]
                  hover:text-[#041005]
                  sm:w-auto sm:min-w-[240px]"
                            >
                                DISCOVER THE COLLECTION

                                <span className="text-lg transition-transform
                  duration-300 group-hover/link:translate-x-1">
                                    ↗
                                </span>
                            </Link>
                        </div>
                    </div>

                    {/* CAMPAIGN INDEX */}
                    <span className="absolute right-6 top-1/2
            -translate-y-1/2 font-[family-name:var(--font-campaign-editorial)]
            text-6xl italic text-[#DBD3AD]/25
            md:right-12 md:text-8xl">
                        06
                    </span>
                </div>

                {/* BOTTOM CAMPAIGN FOOTER */}
                <div className="mt-5 flex items-center
          justify-between border-t
          border-[#DBD3AD]/25 pt-4">

                    <span className="font-[family-name:var(--font-campaign-sans)]
            text-[8px] tracking-[0.2em]
            text-[#DBD3AD]/50">
                        EVERYDAY FASHION. A DIFFERENT PERSPECTIVE.
                    </span>

                    <span className="font-[family-name:var(--font-campaign-sans)]
            text-[8px] tracking-[0.2em]
            text-[#A5A47A]">
                        PATO®
                    </span>
                </div>

            </div>
        </section>
    );
}
