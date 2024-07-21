import HomeHeader from "@/components/HomeLayout/HomeHeader";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <HomeHeader />
      <div className="-mt-[8rem] flex-auto">
        <main className="w-full h-[50rem] bg-[url('/mine3.jpg')] bg-center bg-cover landing-page-main">
          <div className="w-full h-full bg-overlay-gradient opacity-10">

          </div>
          
        </main>
      </div>
    </>


  );
}
