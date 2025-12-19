"use client";
import logoIcon from "@/assets/logo-icon.svg"

import Logo from "@/components/Logo";

export default function ErrorBoundary({error}: {error: Error}) {
    return <div className="w-screen h-screen flex flex-col gap-4 justify-center items-center">
        <h1 className="text-2xl">Sorry, An error occurred </h1>
        <Logo logoIcon={logoIcon} />
    </div> 
}