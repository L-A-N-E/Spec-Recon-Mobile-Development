import { Outlet } from "react-router-dom"

import Navbar from "../components/public/Navbar/index"
import Footer from "../components/public/Footer/index"

function PublicLayout() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <Navbar />

            <main className="flex-1">
                <Outlet />
            </main>

            <Footer />
        </div>
    )
}

export default PublicLayout