
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
    variable: "--font-featured-editorial",
});

const sans = Manrope({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-featured-sans",
});

type Product = {
    id: number;
    name: string;
    category: string;
    price: number;
    originalPrice?: number;
    image: string;
    sizes: string[];
    label?: string;
    href: string;
};

const products: Product[] = [
    {
        id: 1,
        name: "Essential Linen Shirt",
        category: "MEN / SHIRTS",
        price: 1499,
        originalPrice: 1999,
        image:
            "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=85",
        sizes: ["S", "M", "L", "XL"],
        label: "BESTSELLER",
        href: "/products/essential-linen-shirt",
    },
    {
        id: 2,
        name: "Everyday Classic",
        category: "WOMEN / TOPS",
        price: 1899,
        originalPrice: 2399,
        image:
            "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=85",
        sizes: ["XS", "S", "M", "L"],
        label: "NEW ARRIVAL",
        href: "/products/everyday-classic",
    },
    {
        id: 3,
        name: "Relaxed Cotton Tee",
        category: "MEN / T-SHIRTS",
        price: 1299,
        originalPrice: 1699,
        image:
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",
        sizes: ["S", "M", "L", "XL"],
        href: "/products/relaxed-cotton-tee",
    },
    {
        id: 4,
        name: "Modern Everyday Wear",
        category: "WOMEN / COLLECTION",
        price: 2199,
        originalPrice: 2799,
        image:
            "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85",
        sizes: ["XS", "S", "M", "L"],
        label: "JUST DROPPED",
        href: "/products/modern-everyday-wear",
    },
];

function formatPrice(price: number) {
    return `₹${price.toLocaleString("en-IN")}`;
}

function ProductCard({
    product,
    selectedSize,
    onSelectSize,
    onAdd,
    added,
}: {
    product: Product;
    selectedSize: string;
    onSelectSize: (size: string) => void;
    onAdd: () => void;
    added: boolean;
}) {
    const discount = product.originalPrice
        ? Math.round(
            ((product.originalPrice - product.price) /
                product.originalPrice) *
            100
        )
        : null;

    return (
        <article className="group min-w-0 w-[76vw] max-w-[310px]
      shrink-0 sm:w-[48%] sm:max-w-none md:w-auto">

            {/* PRODUCT IMAGE */}
            <div className="relative aspect-[3/4] overflow-hidden
        bg-[#E9E5D8]">

                <Link
                    href={product.href}
                    aria-label={`View ${product.name}`}
                    className="absolute inset-0 z-0"
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
                </Link>

                {/* IMAGE LABEL */}
                {product.label && (
                    <span className="absolute left-3 top-3 z-[1]
            bg-[#DBD3AD] px-3 py-1.5
            font-[family-name:var(--font-featured-sans)]
            text-[8px] font-bold tracking-[0.16em]
            text-[#041005]">
                        {product.label}
                    </span>
                )}

                {/* DISCOUNT */}
                {discount !== null && (
                    <span className="absolute bottom-3 left-3 z-[1]
            bg-[#041005] px-3 py-1.5
            font-[family-name:var(--font-featured-sans)]
            text-[9px] font-semibold tracking-wider
            text-[#DBD3AD]">
                        -{discount}%
                    </span>
                )}

                {/* PRODUCT NUMBER */}
                <span className="absolute bottom-3 right-3 z-[1]
          font-[family-name:var(--font-featured-sans)]
          text-[9px] tracking-widest text-white
          drop-shadow-md">
                    P / 0{product.id}
                </span>
            </div>

            {/* PRODUCT INFORMATION */}
            <div className="pt-4">

                <p className="mb-2 font-[family-name:var(--font-featured-sans)]
          text-[8px] font-semibold tracking-[0.18em]
          text-[#A5A47A]">
                    {product.category}
                </p>

                <div className="flex items-start justify-between gap-2">
                    <Link href={product.href}>
                        <h3 className="font-[family-name:var(--font-featured-editorial)]
              text-[23px] leading-tight text-[#DBD3AD]
              transition-colors duration-300
              group-hover:text-[#C5C18A]">
                            {product.name}
                        </h3>
                    </Link>
                </div>

                {/* PRICES */}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="font-[family-name:var(--font-featured-sans)]
            text-[13px] font-semibold text-[#F0EBD9]">
                        {formatPrice(product.price)}
                    </span>

                    {product.originalPrice && (
                        <span className="font-[family-name:var(--font-featured-sans)]
              text-[11px] text-[#DBD3AD]/45 line-through">
                            {formatPrice(product.originalPrice)}
                        </span>
                    )}
                </div>

                {/* SIZE SELECTION */}
                <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between">
                        <span className="font-[family-name:var(--font-featured-sans)]
              text-[8px] font-semibold tracking-[0.16em]
              text-[#DBD3AD]/65">
                            SELECT SIZE
                        </span>

                        <span className="font-[family-name:var(--font-featured-sans)]
              text-[8px] tracking-wider text-[#A5A47A]">
                            SIZE GUIDE
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {product.sizes.map((size) => (
                            <button
                                key={size}
                                type="button"
                                onClick={() => onSelectSize(size)}
                                aria-pressed={selectedSize === size}
                                aria-label={`Select size ${size} for ${product.name}`}
                                className={`flex h-9 min-w-9 items-center
                  justify-center border px-2.5
                  font-[family-name:var(--font-featured-sans)]
                  text-[10px] transition-all duration-200
                  ${selectedSize === size
                                        ? "border-[#DBD3AD] bg-[#DBD3AD] text-[#041005]"
                                        : "border-[#DBD3AD]/20 text-[#DBD3AD]/75 hover:border-[#DBD3AD]"
                                    }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>

                {/* QUICK ADD */}
                <button
                    type="button"
                    onClick={onAdd}
                    disabled={!selectedSize}
                    className="mt-4 flex h-11 w-full items-center
            justify-between border border-[#DBD3AD]/40
            px-4 font-[family-name:var(--font-featured-sans)]
            text-[9px] font-bold tracking-[0.17em]
            text-[#DBD3AD] transition-all duration-300
            hover:border-[#DBD3AD] hover:bg-[#DBD3AD]
            hover:text-[#041005]
            disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <span>
                        {added ? "ADDED TO BAG" : "QUICK ADD"}
                    </span>

                    <span className="text-base">
                        {added ? "✓" : "+"}
                    </span>
                </button>

                {added && (
                    <p className="mt-2 text-[9px] tracking-wider
            text-[#A5A47A]" role="status">
                        {product.name} · Size selected
                    </p>
                )}
            </div>
        </article>
    );
}

export default function FeaturedCollection() {
    const [selectedSizes, setSelectedSizes] =
        useState<Record<number, string>>({});

    const [addedProduct, setAddedProduct] =
        useState<number | null>(null);

    const handleAdd = (product: Product) => {
        const size = selectedSizes[product.id];

        if (!size) return;

        // MVP interaction.
        // Connect your actual cart function here later.
        console.log("Add to bag:", {
            productId: product.id,
            productName: product.name,
            price: product.price,
            size,
        });

        setAddedProduct(product.id);
    };

    return (
        <section
            className={`${editorial.variable} ${sans.variable}
        relative overflow-hidden bg-[#041005]
        px-5 py-24 text-[#DBD3AD]
        sm:px-8 md:py-32 lg:px-14`}
        >
            <div className="mx-auto max-w-[1600px]">

                {/* SECTION INTRO */}
                <div className="mb-10 border-b
          border-[#DBD3AD]/20 pb-6 md:mb-14">

                    <div className="flex items-center justify-between">
                        <p className="font-[family-name:var(--font-featured-sans)]
              text-[9px] font-semibold tracking-[0.25em]
              text-[#A5A47A]">
                            PATO / CURATED SELECTION
                        </p>

                        <span className="font-[family-name:var(--font-featured-sans)]
              text-[9px] tracking-widest text-[#DBD3AD]/45">
                            003 — THE EDIT
                        </span>
                    </div>

                    <div className="mt-8 flex flex-col gap-5
            md:flex-row md:items-end md:justify-between">

                        <div>
                            <h2 className="font-[family-name:var(--font-featured-editorial)]
                text-6xl font-normal leading-[0.85]
                tracking-[-0.055em] sm:text-7xl
                md:text-8xl lg:text-9xl">
                                The <span className="italic text-[#A5A47A]">
                                    edit.
                                </span>
                            </h2>

                            <p className="mt-5 max-w-sm
                font-[family-name:var(--font-featured-sans)]
                text-[11px] leading-relaxed tracking-wide
                text-[#DBD3AD]/65">
                                Thoughtfully selected pieces.
                                Made for the rhythm of everyday life.
                            </p>
                        </div>

                        <Link
                            href="/collections/all"
                            className="group flex w-fit items-center gap-5
                border-b border-[#DBD3AD]/40 pb-2
                font-[family-name:var(--font-featured-sans)]
                text-[9px] font-semibold tracking-[0.18em]
                transition-colors hover:border-[#DBD3AD]"
                        >
                            VIEW ALL PRODUCTS
                            <span className="text-base transition-transform
                duration-300 group-hover:translate-x-1">
                                →
                            </span>
                        </Link>
                    </div>
                </div>

                {/* PRODUCT COUNT */}
                <div className="mb-5 flex items-center justify-between">
                    <span className="font-[family-name:var(--font-featured-sans)]
            text-[9px] tracking-[0.2em] text-[#DBD3AD]/55">
                        SELECTED FOR YOU
                    </span>

                    <span className="font-[family-name:var(--font-featured-sans)]
            text-[9px] tracking-widest text-[#A5A47A]">
                        0{products.length} PIECES
                    </span>
                </div>

                {/* PRODUCT GALLERY */}
                <div className="flex gap-4 overflow-x-auto
          pb-5 snap-x snap-mandatory
          md:grid md:grid-cols-2 md:gap-x-5
          md:gap-y-12 md:overflow-visible
          md:pb-0 lg:grid-cols-4 lg:gap-6"
                >
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="snap-start"
                        >
                            <ProductCard
                                product={product}
                                selectedSize={selectedSizes[product.id] || ""}
                                onSelectSize={(size) => {
                                    setSelectedSizes((previous) => ({
                                        ...previous,
                                        [product.id]: size,
                                    }));
                                    setAddedProduct(null);
                                }}
                                onAdd={() => handleAdd(product)}
                                added={addedProduct === product.id}
                            />
                        </div>
                    ))}
                </div>

                {/* FOOTER */}
                <div className="mt-12 flex items-center
          justify-between border-t border-[#DBD3AD]/20
          pt-5 md:mt-16">

                    <p className="font-[family-name:var(--font-featured-sans)]
            text-[8px] tracking-[0.18em]
            text-[#DBD3AD]/45">
                        LESS, BUT BETTER.
                    </p>

                    <Link
                        href="/collections/all"
                        className="font-[family-name:var(--font-featured-sans)]
              text-[9px] font-semibold tracking-[0.16em]
              text-[#A5A47A] hover:text-[#DBD3AD]"
                    >
                        EXPLORE THE COLLECTION ↗
                    </Link>
                </div>
            </div>
        </section>
    );
}