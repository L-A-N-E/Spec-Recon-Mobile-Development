// Auth mockado - sem backend real. Guarda o usuario "logado" no
// localStorage (sobrevive a refresh, some no logout) e expõe
// login/signup/logout pro resto do app via Context, em vez do mock local
// que Topbar/ProfileSettings tinham cada um por conta própria.

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export type AuthUser = {
    fullName: string
    email: string
    phone: string
    role: string
    company: string
    employeeId: string
}

export type SignupData = {
    employeeId: string
    fullName: string
    role: string
    department: string
    email: string
    phone: string
}

type AuthResult = { ok: true } | { ok: false; error: string }

type AuthContextValue = {
    user: AuthUser | null
    isAuthenticated: boolean
    login: (employeeId: string, password: string) => AuthResult
    signup: (data: SignupData) => AuthResult
    logout: () => void
    updateProfile: (patch: Partial<AuthUser>) => void
}

const STORAGE_KEY = "specrecon:auth-user"

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredUser(): AuthUser | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        return raw ? (JSON.parse(raw) as AuthUser) : null
    } catch {
        return null
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(() => readStoredUser())

    useEffect(() => {
        if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
        else localStorage.removeItem(STORAGE_KEY)
    }, [user])

    // Mock: sem base de credenciais real pra validar contra - so exige um
    // ID corporativo e senha minimamente preenchidos, igual um form de
    // "qualquer credencial passa" de protótipo.
    function login(employeeId: string, password: string): AuthResult {
        if (employeeId.trim().length < 3) {
            return { ok: false, error: "Informe um ID corporativo válido." }
        }
        if (password.length < 4) {
            return { ok: false, error: "Senha inválida." }
        }

        setUser({
            fullName: "Nicolas Haubricht",
            email: "nicolas.haubricht@ford.com",
            phone: "+55 (11) 99999-9999",
            role: "Estagiário",
            company: "Ford BR",
            employeeId: employeeId.trim(),
        })
        return { ok: true }
    }

    function signup(data: SignupData): AuthResult {
        setUser({
            fullName: data.fullName.trim(),
            email: data.email.trim(),
            phone: data.phone.trim(),
            role: data.role || "Colaborador",
            company: "Ford BR",
            employeeId: data.employeeId.trim(),
        })
        return { ok: true }
    }

    function logout() {
        setUser(null)
    }

    function updateProfile(patch: Partial<AuthUser>) {
        setUser((prev) => (prev ? { ...prev, ...patch } : prev))
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: user != null, login, signup, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error("useAuth precisa ser usado dentro de <AuthProvider>")
    return ctx
}
