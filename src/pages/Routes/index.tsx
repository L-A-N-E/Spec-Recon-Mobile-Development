import { createBrowserRouter } from "react-router-dom"
// Tipos de Rota / Protected / Public
import ProtectedRoute from './ProtectedRoute.tsx'
import PublicRoute from './PublicRoute.tsx'
// Layouts
import RootLayout from "../../layout/RootLayout/index.tsx"
import PrivateLayout from "../../layout/PrivateLayout/index.tsx"
import PublicLayout from "../../layout/PublicLayout/index.tsx"
// Páginas
import Home from '../Home/index.tsx'
import Error from '../Error/index.tsx'
import Login from '../Auth/Login/index.tsx'
import Signup from '../Auth/Signup/index.tsx'
import Radar from '../Radar/index.tsx'
import Dashboard from '../Dashboard/index.tsx'
import Grid from '../Grid/index.tsx'
import Assistant from '../Assistant/index.tsx'
import Profile from '../Profile/index.tsx'
import Terms_Of_Use from "../TermsOfUse/index.tsx"
import PrivacyPolicy from "../PrivacyPolicy/index.tsx"
import ForgotPassword from "../Auth/ForgotPassword/index.tsx"

export const router = createBrowserRouter([
    {
        element: <RootLayout />,
        errorElement: <Error />,

        children: [

            // =========================
            // PUBLIC LAYOUT
            // =========================
            {
                element: <PublicLayout />,

                children: [

                    // =========================
                    // FREE ROUTES
                    // =========================
                    {
                        path: "/",
                        element: <Home />
                    },

                    {
                        path: "/privacy-policy",
                        element: <PrivacyPolicy />
                    },

                    {
                        path: "/terms-of-use",
                        element: <Terms_Of_Use />
                    },

                    // =========================
                    // ONLY NON AUTHENTICATED
                    // =========================
                    {
                        element: <PublicRoute />,

                        children: [
                            {
                                path: "/login",
                                element: <Login />
                            },

                            {
                                path: "/sign-up",
                                element: <Signup />
                            },

                            {
                                path: "/forgot-password",
                                element: <ForgotPassword />
                            }
                        ]
                    }
                ]
            },

            // =========================
            // PRIVATE ROUTES
            // =========================
            {
                element: <ProtectedRoute />,

                children: [
                    {
                        element: <PrivateLayout />,

                        children: [
                            {
                                path: "/dashboard",
                                element: <Dashboard />
                            },

                            {
                                path: "/radar",
                                element: <Radar />
                            },

                            {
                                path: "/grid",
                                element: <Grid />
                            },

                            {
                                path: "/assistant",
                                element: <Assistant />
                            },

                            {
                                path: "/profile",
                                element: <Profile />
                            }
                        ]
                    }
                ]
            }
        ]
    }
])