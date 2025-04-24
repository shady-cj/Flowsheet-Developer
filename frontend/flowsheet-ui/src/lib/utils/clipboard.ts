export const handleCopyClick = async (text: string, type: string, isLink: boolean = false) => {
    if (isLink) {
        text = `localhost:3000/${text}`
    }
    console.log("copied text", text)
    try {
        await window.navigator.clipboard.writeText(text);
        alert(`Copied the ${type} link!`);
    } catch (err) {
        console.error(
            "Unable to copy to clipboard.",
            err
        );
        alert("Copy to clipboard failed.");
    }
};