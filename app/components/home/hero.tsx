export default function Hero() {
    return (
        <main className="relative flex min-h-svh w-full flex-col
      items-center justify-center overflow-hidden
      bg-[#041005] text-[#DBD3AD]">

            <div className="flex flex-col items-center">
                <h1 className="font-serif text-[clamp(5rem,25vw,18.75rem)]
          font-bold leading-[0.8] tracking-[-0.08em]">
                    PATO
                </h1>

                <p className="mt-5 text-2xl font-sans tracking-[0.3em]">
                    .com
                </p>
            </div>

        </main>
    );
}