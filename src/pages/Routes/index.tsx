import { createBrowserRouter } from "react-router-dom"

import ProtectedRoute from './ProtectedRoute.tsx'
import PublicRoute from './PublicRoute.tsx'

import App from '../../App.tsx'
import Home from '../Home/index.tsx'
import Error from '../Error/index.tsx'
import Login from '../Auth/Login/index.tsx'
import Signup from '../Auth/Signup/index.tsx'
import Osint from '../Osint/index.tsx'
import Dashboard from '../Dashboard/index.tsx'
import Grid from '../Grid/index.tsx'
import Assistant from '../Assistant/index.tsx'

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
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
                path: "/osint",
                element: (
                    <ProtectedRoute>
                        <Osint />
                    </ProtectedRoute>
                )
            },
            {
                path: "/dashboard",
                element: (
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                )
            },
            {
                path: "/grid",
                element: (
                    <ProtectedRoute>
                        <Grid />
                    </ProtectedRoute>
                )
            },
            {
                path: "/assistant",
                element: (
                    <ProtectedRoute>
                        <Assistant />
                    </ProtectedRoute>
                )
            }
        ]
    }
])