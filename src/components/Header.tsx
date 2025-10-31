import Link from "next/link"

export default function Header() {
    return(
        <div>
            <div>Logo</div>
            <ul>
                <Link href="/">Home</Link>
                <Link href="/profile">Posts</Link>
            </ul>
        </div>
    )
}