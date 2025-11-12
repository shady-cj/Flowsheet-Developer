"use client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image, { StaticImageData } from "next/image"

const Logo = ({logoIcon, isEdited}: {logoIcon: StaticImageData, isEdited?: boolean}) => {
  const router = useRouter();
  return (
    <Link href={"/"} className="flex items-center gap-2" onClick={(e) => {
      if (isEdited){
        e.preventDefault();
        // Handle project link click
        if (isEdited) {
          const confirmLeave = confirm("You have unsaved changes. Are you sure you want to leave?"); 
          if (!confirmLeave) return;
        }
        router.push(`/`);
      }
    }}>
        <Image src={logoIcon} alt="logo" width={24} height={24.75} className="h-auto w-auto" />
        <span className="logo-text">ProFlo</span>
    </Link>
  )
}

export default Logo
