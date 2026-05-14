import { useState, useMemo } from "react"

import { Link } from "react-router-dom"

import {
    ShieldPlus,
    ArrowRight,
    Eye,
    EyeOff,
    Check,
    X
} from "lucide-react"

import Button from "../../../components/Button"

function Signup() {

    const [formData, setFormData] = useState({
        employeeId: "",
        fullName: "",
        age: "",
        role: "",
        department: "",
        cpf: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    // states
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // requisitos senha
    const passwordRules = useMemo(() => ({
        minLength: formData.password.length >= 8,
        uppercase: /[A-Z]/.test(formData.password),
        lowercase: /[a-z]/.test(formData.password),
        number: /\d/.test(formData.password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
    }), [formData.password])

    const passwordIsStrong = Object.values(passwordRules).every(Boolean)

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })

        if (errors[e.target.name]) {
            setErrors((prev) => ({
                ...prev,
                [e.target.name]: "",
            }))
        }
    }

    function validateForm() {

        const newErrors: Record<string, string> = {}

        // Employee ID
        if (!formData.employeeId.trim()) {
            newErrors.employeeId = "Informe o ID corporativo"
        }

        // Nome
        if (!formData.fullName.trim()) {
            newErrors.fullName = "Informe o nome completo"
        } else if (formData.fullName.trim().length < 5) {
            newErrors.fullName = "Nome inválido"
        }

        // Idade
        if (!formData.age) {
            newErrors.age = "Informe a idade"
        } else if (Number(formData.age) < 18) {
            newErrors.age = "Idade mínima: 18 anos"
        }

        // Cargo
        if (!formData.role) {
            newErrors.role = "Selecione um cargo"
        }

        // Departamento
        if (!formData.department) {
            newErrors.department = "Selecione um departamento"
        }

        // CPF
        if (!formData.cpf.trim()) {
            newErrors.cpf = "Informe o CPF"
        } else if (formData.cpf.replace(/\D/g, "").length !== 11) {
            newErrors.cpf = "CPF inválido"
        }

        // Email
        if (!formData.email.trim()) {
            newErrors.email = "Informe o e-mail"
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        ) {
            newErrors.email = "E-mail inválido"
        }

        // Telefone
        if (!formData.phone.trim()) {
            newErrors.phone = "Informe o telefone"
        } else if (formData.phone.replace(/\D/g, "").length < 10) {
            newErrors.phone = "Telefone inválido"
        }

        // Senha
        if (!formData.password) {
            newErrors.password = "Informe uma senha"
        } else if (!passwordIsStrong) {
            newErrors.password =
                "A senha não atende aos requisitos de segurança"
        }
        // Confirmar senha
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Confirme sua senha"
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "As senhas não coincidem"
        }

        setErrors(newErrors)

        return Object.keys(newErrors).length === 0
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!validateForm()) return

        console.log("Cadastro válido:", formData)

        // futura integração com API/Banco
    }

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden relative flex items-center justify-center px-6 py-24">

            {/* Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_40%)]" />

            {/* Grid */}
            <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:80px_80px]" />

            <div className="relative w-full max-w-2xl">

                {/* Header */}
                <div className="flex flex-col items-center text-center mb-10">

                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
                        <ShieldPlus className="w-8 h-8 text-blue-400" />
                    </div>

                    <div className="text-xs uppercase tracking-[0.3em] text-blue-400 mb-3">
                        Solicitação de acesso
                    </div>

                    <h1 className="text-4xl font-bold tracking-tight">
                        Cadastro corporativo
                    </h1>

                    <p className="mt-4 text-white/50 leading-relaxed max-w-xl">
                        O registro será validado com a base interna da Ford
                        para autenticação e autorização de acesso à plataforma.
                    </p>
                </div>

                {/* Card */}
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 shadow-2xl">

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >

                        <div className="grid md:grid-cols-2 gap-5">

                            {/* ID */}
                            <div>
                                <label className="block text-sm text-white/70 mb-2">
                                    ID Corporativo
                                </label>

                                <input
                                    type="text"
                                    name="employeeId"
                                    value={formData.employeeId}
                                    onChange={handleChange}
                                    placeholder="FRD-000124"
                                    className="w-full h-12 px-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/25 outline-none focus:border-blue-500 transition-colors"
                                />

                                {errors.employeeId && (
                                    <p className="mt-2 text-sm text-red-400">
                                        {errors.employeeId}
                                    </p>
                                )}
                            </div>

                            {/* Nome */}
                            <div>
                                <label className="block text-sm text-white/70 mb-2">
                                    Nome completo
                                </label>

                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Nome do colaborador"
                                    className="w-full h-12 px-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/25 outline-none focus:border-blue-500 transition-colors"
                                />

                                {errors.fullName && (
                                    <p className="mt-2 text-sm text-red-400">
                                        {errors.fullName}
                                    </p>
                                )}
                            </div>

                            {/* Idade */}
                            <div>
                                <label className="block text-sm text-white/70 mb-2">
                                    Idade
                                </label>

                                <input
                                    type="number"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    placeholder="00"
                                    className="w-full h-12 px-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/25 outline-none focus:border-blue-500 transition-colors"
                                />

                                {errors.age && (
                                    <p className="mt-2 text-sm text-red-400">
                                        {errors.age}
                                    </p>
                                )}
                            </div>

                            {/* Cargo */}
                            <div>
                                <label className="block text-sm text-white/70 mb-2">
                                    Cargo
                                </label>

                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full h-12 px-4 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-blue-500 transition-colors"
                                >
                                    <option value="">Selecione</option>
                                    <option>Diretor</option>
                                    <option>Gerente</option>
                                    <option>Coordenador</option>
                                    <option>Analista</option>
                                    <option>Engenheiro</option>
                                    <option>Consultor</option>
                                </select>

                                {errors.role && (
                                    <p className="mt-2 text-sm text-red-400">
                                        {errors.role}
                                    </p>
                                )}
                            </div>

                            {/* Departamento */}
                            <div>
                                <label className="block text-sm text-white/70 mb-2">
                                    Departamento
                                </label>

                                <select
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    className="w-full h-12 px-4 rounded-xl bg-black/40 border border-white/10 text-white outline-none focus:border-blue-500 transition-colors"
                                >
                                    <option value="">Selecione</option>
                                    <option>Engenharia</option>
                                    <option>Pesquisa & Desenvolvimento</option>
                                    <option>Estratégia</option>
                                    <option>Powertrain</option>
                                    <option>Design</option>
                                    <option>Qualidade</option>
                                    <option>Vendas</option>
                                    <option>Tecnologia</option>
                                </select>

                                {errors.department && (
                                    <p className="mt-2 text-sm text-red-400">
                                        {errors.department}
                                    </p>
                                )}
                            </div>

                            {/* CPF */}
                            <div>
                                <label className="block text-sm text-white/70 mb-2">
                                    CPF
                                </label>

                                <input
                                    type="text"
                                    name="cpf"
                                    value={formData.cpf}
                                    onChange={handleChange}
                                    placeholder="000.000.000-00"
                                    className="w-full h-12 px-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/25 outline-none focus:border-blue-500 transition-colors"
                                />

                                {errors.cpf && (
                                    <p className="mt-2 text-sm text-red-400">
                                        {errors.cpf}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm text-white/70 mb-2">
                                    E-mail corporativo
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="nome@ford.com"
                                    className="w-full h-12 px-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/25 outline-none focus:border-blue-500 transition-colors"
                                />

                                {errors.email && (
                                    <p className="mt-2 text-sm text-red-400">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Telefone */}
                            <div>
                                <label className="block text-sm text-white/70 mb-2">
                                    Telefone
                                </label>

                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="(11) 99999-9999"
                                    className="w-full h-12 px-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/25 outline-none focus:border-blue-500 transition-colors"
                                />

                                {errors.phone && (
                                    <p className="mt-2 text-sm text-red-400">
                                        {errors.phone}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Senha */}
                        <div>
                            <label className="block text-sm text-white/70 mb-2">
                                Senha
                            </label>

                            <div className="relative">

                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••••"
                                    autoComplete="new-password"
                                    onCopy={(e) => e.preventDefault()}
                                    onPaste={(e) => e.preventDefault()}
                                    onCut={(e) => e.preventDefault()}
                                    className="w-full h-12 px-4 pr-12 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/25 outline-none focus:border-blue-500 transition-colors"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>

                            {errors.password && (
                                <p className="mt-2 text-sm text-red-400">
                                    {errors.password}
                                </p>
                            )}

                            {/* Requisitos */}
                            <div className="mt-4 space-y-2">

                                <div className="text-xs uppercase tracking-[0.2em] text-white/30">
                                    Requisitos de segurança
                                </div>

                                {[
                                    {
                                        valid: passwordRules.minLength,
                                        label: "Mínimo de 8 caracteres",
                                    },

                                    {
                                        valid: passwordRules.uppercase,
                                        label: "Pelo menos 1 letra maiúscula",
                                    },

                                    {
                                        valid: passwordRules.lowercase,
                                        label: "Pelo menos 1 letra minúscula",
                                    },

                                    {
                                        valid: passwordRules.number,
                                        label: "Pelo menos 1 número",
                                    },

                                    {
                                        valid: passwordRules.special,
                                        label: "Pelo menos 1 caractere especial",
                                    },
                                ].map((rule) => (
                                    <div
                                        key={rule.label}
                                        className={`flex items-center gap-2 text-sm transition-colors ${rule.valid
                                            ? "text-green-400"
                                            : "text-white/35"
                                            }`}
                                    >
                                        {rule.valid ? (
                                            <Check className="w-4 h-4" />
                                        ) : (
                                            <X className="w-4 h-4" />
                                        )}

                                        <span>{rule.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Confirmar senha */}
                        <div>
                            <label className="block text-sm text-white/70 mb-2">
                                Confirmar senha
                            </label>

                            <div className="relative">

                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••••"
                                    autoComplete="new-password"
                                    onCopy={(e) => e.preventDefault()}
                                    onPaste={(e) => e.preventDefault()}
                                    onCut={(e) => e.preventDefault()}
                                    className="w-full h-12 px-4 pr-12 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/25 outline-none focus:border-blue-500 transition-colors"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(!showConfirmPassword)
                                    }
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>

                            {errors.confirmPassword && (
                                <p className="mt-2 text-sm text-red-400">
                                    {errors.confirmPassword}
                                </p>
                            )}

                            {formData.confirmPassword &&
                                formData.password === formData.confirmPassword && (
                                    <div className="mt-3 flex items-center gap-2 text-sm text-green-400">
                                        <Check className="w-4 h-4" />
                                        Senhas coincidem
                                    </div>
                                )}
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full h-12"
                        >
                            Solicitar acesso
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </form>

                    {/* Bottom */}
                    <div className="mt-8 pt-6 border-t border-white/10 text-center">

                        <p className="text-sm text-white/40">
                            Já possui credenciais?
                        </p>

                        <Link
                            to="/login"
                            className="mt-3 inline-flex text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
                        >
                            Entrar na plataforma
                        </Link>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-8 text-center text-xs text-white/20 uppercase tracking-[0.25em]">
                    Challenge FIAP 2026 · Engenharia de Software
                </div>
            </div>
        </div>
    )
}

export default Signup