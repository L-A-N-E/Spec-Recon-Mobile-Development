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

            {/* min-w-0 e essencial aqui: sem isso, um filho com conteudo
                largo (tabela, texto sem quebra) forca esta coluna - e por
                tabela, o layout inteiro - a ficar mais larga que a
                viewport, porque flex item por padrao nao encolhe alem do
                min-content dos filhos (min-width:auto e' o default, nao
                0) mesmo com flex-1 */}
            <div className="flex-1 flex flex-col min-w-0">

                <Topbar />

                <main className="flex-1 min-w-0">

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