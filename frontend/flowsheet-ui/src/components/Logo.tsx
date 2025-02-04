import Link from "next/link"
import Image, { StaticImageData } from "next/image"

const Logo = ({logoIcon}: {logoIcon: StaticImageData}) => {
  return (
    <Link href={"/"} className="flex items-center gap-2">
        <Image src={logoIcon} alt="logo" width={24} height={24.75} />
        <span className="logo-text">MineFlo</span>
    </Link>
  )
}

export default Logo
