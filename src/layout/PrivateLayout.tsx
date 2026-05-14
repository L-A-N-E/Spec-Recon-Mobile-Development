import { Outlet } from "react-router-dom"

import Sidebar from "../components/private/Sidebar/index.tsx"
import Topbar from "../components/private/Topbar/index.tsx"
import Footer from "../components/public/Footer/index.tsx"

function PrivateLayout() {
    return (
        <div className="min-h-screen bg-background text-foreground flex">
            <Sidebar />

            <div className="flex-1 flex flex-col">
                <Topbar />

                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </div>
            
            <Footer/>
        </div>
    )
}

export default PrivateLayout