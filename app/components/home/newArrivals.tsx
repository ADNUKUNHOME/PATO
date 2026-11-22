
"use client";

import Link from "next/link";
import { useState } from "react";
import {
    Cormorant_Garamond,
    Manrope,
} from "next/font/google";

const editorial = Cormorant_Garamond({
    subsets: ["latin"],
    weight: ["400", "500", "600"],
    variable: "--font-arrivals-editorial",
});

const sans = Manrope({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-arrivals-sans",
});

export type DiscoveryProduct = {
    id: string;
    name: string;
    category: string;
    price: number;
    originalPrice?: number;
    image: string;
    href: string;
    sizes: string[];
    stock: number;
    label?: string;
};

const demoNewArrivals: DiscoveryProduct[] = [
    {
        id: "arrival-01",
        name: "The Everyday Shirt",
        category: "MEN / SHIRTS",
        price: 1499,
        originalPrice: 1899,
        image:
            "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=85",
        href: "/products/everyday-shirt",
        sizes: ["S", "M", "L", "XL"],
        stock: 12,
        label: "JUST IN",
    },
    {
        id: "arrival-02",
        name: "Modern Form",
        category: "WOMEN / TOPS",
        price: 1799,
        image:
            "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=85",
        href: "/products/modern-form",
        sizes: ["XS", "S", "M", "L"],
        stock: 8,
        label: "NEW ARRIVAL",
    },
    {
        id: "arrival-03",
        name: "The Essential Tee",
        category: "MEN / T-SHIRTS",
        price: 999,
        originalPrice: 1299,
        image:
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=85",
        href: "/products/essential-tee",
        sizes: ["S", "M", "L", "XL"],
        stock: 0,
        label: "JUST IN",
    },
    {
        id: "arrival-04",
        name: "Everyday Expression",
        category: "WOMEN / FASHION",
        price: 2199,
        originalPrice: 2599,
        image:
            "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85",
        href: "/products/everyday-expression",
        sizes: ["XS", "S", "M", "L"],
        stock: 6,
        label: "NEW ARRIVAL",
    },
];

const demoTrending: DiscoveryProduct[] = [
    {
        id: "trend-01",
        name: "Classic Everyday Shirt",
        category: "MEN / SHIRTS",
        price: 1599,
        originalPrice: 1999,
        image:
            "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=85",
        href: "/products/classic-everyday-shirt",
        sizes: ["S", "M", "L", "XL"],
        stock: 10,
        label: "TRENDING",
    },
    {
        id: "trend-02",
        name: "The Neutral Edit",
        category: "WOMEN / COLLECTION",
        price: 1899,
        image:
            "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1000&q=85",
        href: "/products/neutral-edit",
        sizes: ["XS", "S", "M", "L"],
        stock: 5,
        label: "POPULAR",
    },
    {
        id: "trend-03",
        name: "Relaxed Streetwear",
        category: "MEN / CASUAL",
        price: 1299,
        originalPrice: 1599,
        image:
            "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1000&q=85",
        href: "/products/relaxed-streetwear",
        sizes: ["S", "M", "L", "XL"],
        stock: 7,
        label: "TRENDING",
    },
    {
        id: "trend-04",
        name: "Contemporary Style",
        category: "WOMEN / FASHION",
        price: 2299,
        originalPrice: 2799,
        image:
            "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=85",
        href: "/products/contemporary-style",
        sizes: ["XS", "S", "M", "L"],
        stock: 0,
        label: "POPULAR",
    },
];

function money(amount: number) {
    return `₹${amount.toLocaleString("en-IN")}`;
}

function ProductItem({
    product,
    index,
}: {
    product: DiscoveryProduct;
    index: number;
}) {
    const discount = product.originalPrice
        ? Math.round(
            ((product.originalPrice - product.price) /
                product.originalPrice) *
            100
        )
        : null;

    return (
        <article className="group min-w-[76vw] max-w-[330px]
      shrink-0 snap-start sm:min-w-[45%]
      md:min-w-0 md:max-w-none">

            {/* IMAGE */}
            <Link
                href={product.href}
                aria-label={`View ${product.name}`}
                className="relative block aspect-[3/4]
          overflow-hidden bg-[#E9E5D8]"
            >
                <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover
            transition-transform duration-700
            ease-out group-hover:scale-[1.045]"
                />

                {/* TOP LABEL */}
                <span className="absolute left-3 top-3
          bg-[#DBD3AD] px-3 py-1.5
          font-[family-name:var(--font-arrivals-sans)]
          text-[8px] font-bold tracking-[0.16em]
          text-[#041005]">
                    {product.label || "PATO SELECT"}
                </span>

                {/* INDEX */}
                <span className="absolute bottom-3 right-3
          font-[family-name:var(--font-arrivals-sans)]
          text-[9px] tracking-widest text-white
          drop-shadow-md">
                    0{index + 1} / 04
                </span>

                {/* DISCOUNT */}
                {discount !== null && (
                    <span className="absolute bottom-3 left-3
            bg-[#041005] px-3 py-1.5
            font-[family-name:var(--font-arrivals-sans)]
            text-[9px] font-semibold text-[#DBD3AD]">
                        -{discount}%
                    </span>
                )}
            </Link>

            {/* DETAILS */}
            <div className="pt-4">

                <p className="font-[family-name:var(--font-arrivals-sans)]
          text-[8px] font-bold tracking-[0.18em]
          text-[#68734B]">
                    {product.category}
                </p>

                <Link href={product.href}>
                    <h3 className="mt-2 font-[family-name:var(--font-arrivals-editorial)]
            text-[25px] leading-tight tracking-tight
            text-[#041005] transition-colors
            group-hover:text-[#68734B]">
                        {product.name}
                    </h3>
                </Link>

                {/* PRICE */}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="font-[family-name:var(--font-arrivals-sans)]
            text-[13px] font-bold text-[#041005]">
                        {money(product.price)}
                    </span>

                    {product.originalPrice && (
                        <span className="font-[family-name:var(--font-arrivals-sans)]
              text-[11px] text-[#041005]/45 line-through">
                            {money(product.originalPrice)}
                        </span>
                    )}
                </div>

                {/* SIZES */}
                <div className="mt-4 flex flex-wrap items-center
          justify-between gap-2">

                    <div className="flex gap-1.5">
                        {product.sizes.map((size) => (
                            <span
                                key={size}
                                className="flex h-7 min-w-7 items-center
                  justify-center border border-[#041005]/15
                  px-1.5 font-[family-name:var(--font-arrivals-sans)]
                  text-[9px] text-[#041005]/75"
                            >
                                {size}
                            </span>
                        ))}
                    </div>

                    <span className={`font-[family-name:var(--font-arrivals-sans)]
            text-[8px] tracking-wide ${product.stock > 0
                            ? "text-[#68734B]"
                            : "text-[#A34D3C]"
                        }`}>
                        {product.stock > 0
                            ? "IN STOCK"
                            : "SOLD OUT"}
                    </span>
                </div>

                {/* PRODUCT ACTION */}
                <Link
                    href={product.href}
                    className="mt-4 flex h-10 items-center
            justify-between border-t border-[#041005]/25
            pt-2 font-[family-name:var(--font-arrivals-sans)]
            text-[9px] font-bold tracking-[0.16em]
            text-[#041005]"
                >
                    VIEW PRODUCT

                    <span className="text-base transition-transform
            duration-300 group-hover:translate-x-1">
                        ↗
                    </span>
                </Link>
            </div>
        </article>
    );
}

type NewArrivalsProps = {
    newArrivals?: DiscoveryProduct[];
    trending?: DiscoveryProduct[];
};

export default function NewArrivals({
    newArrivals = demoNewArrivals,
    trending = demoTrending,
}: NewArrivalsProps) {
    const [activeTab, setActiveTab] =
        useState<"new" | "trending">("new");

    const currentProducts =
        activeTab === "new" ? newArrivals : trending;

    return (
        <section
            className={`${editorial.variable} ${sans.variable}
        relative overflow-hidden bg-[#DBD3AD]
        px-5 py-24 text-[#041005]
        sm:px-8 md:py-32 lg:px-14`}
        >
            <div className="mx-auto max-w-[1600px]">

                {/* SECTION HEADER */}
                <div className="border-b border-[#041005]/25 pb-8">

                    <div className="flex items-center
            justify-between gap-4">

                        <span className="font-[family-name:var(--font-arrivals-sans)]
              text-[9px] font-bold tracking-[0.24em]
              text-[#68734B]">
                            PATO / THE DISCOVERY JOURNAL
                        </span>

                        <span className="font-[family-name:var(--font-arrivals-sans)]
              text-[9px] tracking-[0.2em] text-[#041005]/50">
                            005 — WHAT'S HAPPENING
                        </span>
                    </div>

                    <div className="mt-9 grid grid-cols-1
            gap-8 md:grid-cols-[1fr_auto]
            md:items-end">

                        <div>
                            <p className="mb-4 font-[family-name:var(--font-arrivals-sans)]
                text-[9px] font-bold tracking-[0.25em]
                text-[#68734B]">
                                THE NEXT THING YOU'LL LOVE
                            </p>

                            <h2 className="font-[family-name:var(--font-arrivals-editorial)]
                text-[clamp(4.5rem,10vw,9rem)]
                leading-[0.78] tracking-[-0.065em]">

                                Fresh <span className="italic text-[#68734B]">
                                    finds.
                                </span>

                                <span className="mt-3 block text-[0.48em]
                  font-[family-name:var(--font-arrivals-sans)]
                  font-medium tracking-[-0.045em]">
                                    ALWAYS SOMETHING NEW.
                                </span>
                            </h2>
                        </div>

                        <p className="max-w-[270px]
              font-[family-name:var(--font-arrivals-sans)]
              text-[11px] leading-[1.9]
              text-[#041005]/65 md:pb-1">
                            New discoveries. Noteworthy favourites.
                            Pieces worth taking a closer look at.
                        </p>
                    </div>
                </div>

                {/* TAB NAVIGATION */}
                <div className="mt-9 flex flex-col gap-6
          sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-center gap-2">

                        <button
                            type="button"
                            onClick={() => setActiveTab("new")}
                            aria-pressed={activeTab === "new"}
                            className={`flex items-center gap-2
                border px-5 py-3
                font-[family-name:var(--font-arrivals-sans)]
                text-[9px] font-bold tracking-[0.15em]
                transition-all duration-300 ${activeTab === "new"
                                    ? "border-[#041005] bg-[#041005] text-[#DBD3AD]"
                                    : "border-[#041005]/25 text-[#041005]/65 hover:border-[#041005]"
                                }`}
                        >
                            <span className="size-1.5 rounded-full bg-current" />
                            NEW ARRIVALS
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab("trending")}
                            aria-pressed={activeTab === "trending"}
                            className={`flex items-center gap-2
                border px-5 py-3
                font-[family-name:var(--font-arrivals-sans)]
                text-[9px] font-bold tracking-[0.15em]
                transition-all duration-300 ${activeTab === "trending"
                                    ? "border-[#041005] bg-[#041005] text-[#DBD3AD]"
                                    : "border-[#041005]/25 text-[#041005]/65 hover:border-[#041005]"
                                }`}
                        >
                            <span className="size-1.5 rounded-full bg-current" />
                            TRENDING
                        </button>

                    </div>

                    <span className="font-[family-name:var(--font-arrivals-sans)]
            text-[9px] tracking-[0.18em] text-[#041005]/50">
                        {activeTab === "new"
                            ? "LATEST ADDITIONS"
                            : "POPULAR DISCOVERIES"}
                    </span>
                </div>

                {/* PRODUCT COUNT */}
                <div className="mb-5 mt-9 flex items-center
          justify-between border-b border-[#041005]/20 pb-3">

                    <span className="font-[family-name:var(--font-arrivals-sans)]
            text-[9px] font-bold tracking-[0.2em]">
                        {activeTab === "new"
                            ? "RECENTLY ADDED"
                            : "CURRENTLY TRENDING"}
                    </span>

                    <span className="font-[family-name:var(--font-arrivals-sans)]
            text-[9px] tracking-widest text-[#68734B]">
                        {String(currentProducts.length).padStart(2, "0")} PIECES
                    </span>
                </div>

                {/* PRODUCTS */}
                <div
                    key={activeTab}
                    className="flex snap-x snap-mandatory
            gap-4 overflow-x-auto pb-6
            md:grid md:grid-cols-2 md:gap-x-5
            md:gap-y-12 md:overflow-visible
            md:pb-0 lg:grid-cols-4 lg:gap-6"
                >
                    {currentProducts.length > 0 ? (
                        currentProducts.map((product, index) => (
                            <ProductItem
                                key={product.id}
                                product={product}
                                index={index}
                            />
                        ))
                    ) : (
                        <p className="col-span-full py-16 text-center
              font-[family-name:var(--font-arrivals-sans)]
              text-sm text-[#041005]/60">
                            Nothing to discover here yet. Check back soon.
                        </p>
                    )}
                </div>

                {/* BOTTOM STATEMENT */}
                <div className="mt-14 flex flex-col gap-5
          border-t border-[#041005]/25 pt-6
          sm:flex-row sm:items-center sm:justify-between">

                    <p className="font-[family-name:var(--font-arrivals-editorial)]
            text-3xl italic text-[#68734B] sm:text-4xl">
                        Discover your next favourite.
                    </p>

                    <Link
                        href="/collections/all"
                        className="group flex w-fit items-center gap-5
              border-b border-[#041005] pb-2
              font-[family-name:var(--font-arrivals-sans)]
              text-[9px] font-bold tracking-[0.18em]"
                    >
                        EXPLORE EVERYTHING

                        <span className="text-base transition-transform
              duration-300 group-hover:translate-x-1">
                            →
                        </span>
                    </Link>
                </div>

            </div>
        </section>
    );
}
