import { createBrowserRouter } from "react-router-dom"

import ProtectedRoute from './ProtectedRoute.tsx'
import PublicRoute from './PublicRoute.tsx'

import Home from '../Home/index.tsx'
import Error from '../Error/index.tsx'
import Login from '../Auth/Login/index.tsx'
import Signup from '../Auth/Signup/index.tsx'
import Radar from '../Radar/index.tsx'
import Dashboard from '../Dashboard/index.tsx'
import Grid from '../Grid/index.tsx'
import Assistant from '../Assistant/index.tsx'
import Profile from '../Profile/index.tsx'
import PrivateLayout from "../../layout/PrivateLayout.tsx"
import PublicLayout from "../../layout/PublicLayout.tsx"
import Terms_Of_Use from "../TermsOfUse/index.tsx"
import PrivacyPolicy from "../PrivacyPolicy/index.tsx"

export const router = createBrowserRouter([
    {
        element: <PublicLayout />,
        errorElement: <Error />,
        children: [
            {
                path: "/",
                element: <Home />
            },

            {
                path: "/login",
                element: (
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                )
            },

            {
                path: "/signup",
                element: (
                    <PublicRoute>
                        <Signup />
                    </PublicRoute>
                )
            },

            {
                path: "/privacy-policy",
                element: (
                    <PublicRoute>
                        <PrivacyPolicy />
                    </PublicRoute>
                )
            },

            {
                path: "/terms-of-use",
                element: (
                    <PublicRoute>
                        <Terms_Of_Use />
                    </PublicRoute>
                )
            }
        ]
    },

    {
        errorElement: <Error />,
        element: (
            <ProtectedRoute>
                <PrivateLayout />
            </ProtectedRoute>
        ),

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
])