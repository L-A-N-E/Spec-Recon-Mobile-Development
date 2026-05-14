import { Outlet, useLocation } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import PageTransition from "../../components/public/PageTransition/index"
import Sidebar from "../../components/private/Sidebar/index.tsx"
import Topbar from "../../components/private/Topbar/index.tsx"
import Footer from "../../components/public/Footer/index.tsx"

function PrivateLayout() {

    const location = useLocation()

    return (
        <div className="min-h-screen bg-black text-white flex">

            <Sidebar />

            <div className="flex-1 flex flex-col">

                <Topbar />

                <main className="flex-1">

                    <AnimatePresence mode="wait">

                        <PageTransition key={location.pathname}>
                            <Outlet />
                        </PageTransition>

                    </AnimatePresence>

                </main>

                <Footer />
            </div>
        </div>
    )
}

export default PrivateLayout