import Link from "next/link"

export default function Header() {
    return(
        <>
            <nav className="navbar">
                <img src="b-pop.svg"></img>
            </nav>
            <nav className="navbar">
                <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/listings">Listings</a></li>
                </ul>
            </nav>
        </>
    )
}