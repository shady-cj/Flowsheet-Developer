"use client";
export default function ErrorBoundary({error}: {error: Error}) {
    return <h1>An error occurred: {error.message}</h1>
}