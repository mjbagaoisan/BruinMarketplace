import Image from "next/image";
import AuthButton from "@/components/AuthButton";

export default function Home() {
  return (
    <>
        <div className="homepage-welcome">
          <h1>Welcome to BruinMarketplace</h1>
          <img src="welcome-image.svg"></img>
        </div>
        <AuthButton />
    </>
  );
}
