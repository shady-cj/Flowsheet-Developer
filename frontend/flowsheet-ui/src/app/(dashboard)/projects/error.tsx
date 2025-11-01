"use client";
export default function ErrorBoundary({error}: {error: Error}) {
    return <div className="w-screen h-screen flex justify-center items-center">
        <h1 className="text-2xl">An error occurred: {error.message}</h1>
    </div> 
}