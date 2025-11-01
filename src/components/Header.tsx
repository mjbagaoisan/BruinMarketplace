import Link from "next/link"

export default function Header() {
    return(
        <>
            <nav className="header">
                <img src="b-pop.svg"></img>
                <a href="/signin">Sign in</a>
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