import { Outlet, useLocation } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import PageTransition from "../../components/public/PageTransition/index"

import Navbar from "../../components/public/Navbar/index"
import Footer from "../../components/public/Footer/index"
function PublicLayout() {

    const location = useLocation()

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">

            <Navbar />

            <main className="flex-1">

                <AnimatePresence mode="wait">

                    <PageTransition key={location.pathname}>
                        <Outlet />
                    </PageTransition>

                </AnimatePresence>

            </main>

            <Footer />
        </div>
    )
}

export default PublicLayout