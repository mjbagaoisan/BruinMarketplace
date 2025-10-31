import Image from "next/image";
import AuthButton from "@/components/AuthButton";

export default function Home() {
  return (
    <>
        <h1 className="welcome-title">Welcome to BruinMarketplace</h1>
        <img src="welcome-image.svg"></img>
        <AuthButton />
    </>
  );
}
