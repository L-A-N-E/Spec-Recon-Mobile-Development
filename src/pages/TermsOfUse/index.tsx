function TermsOfUse() {
    return (
        <div className="min-h-screen bg-black text-white">

            <div className="max-w-5xl mx-auto px-6 lg:px-10 pt-32 pb-24">

                <div className="mb-14">
                    <div className="text-xs uppercase tracking-[0.3em] text-blue-400 mb-4">
                        Documento legal
                    </div>

                    <h1 className="text-5xl font-bold tracking-tight">
                        Termos de Uso
                    </h1>

                    <p className="mt-6 text-lg text-white/50 leading-relaxed max-w-3xl">
                        Estes Termos de Uso regulam a utilização da plataforma Spec Recon,
                        desenvolvida exclusivamente para fins acadêmicos e demonstrativos
                        no contexto do Challenge FIAP 2026.
                    </p>
                </div>

                <div className="space-y-12 text-white/70 leading-relaxed">

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">
                            1. Aceitação dos Termos
                        </h2>

                        <p>
                            Ao acessar esta plataforma, o usuário declara estar ciente
                            de que o sistema possui finalidade exclusivamente acadêmica,
                            educacional e demonstrativa.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">
                            2. Natureza Acadêmica
                        </h2>

                        <p>
                            O Spec Recon foi desenvolvido por estudantes do curso de
                            Engenharia de Software da
                            FIAP (Faculdade de Informática e Administração Paulista)
                            como parte do Challenge 2026 realizado em parceria com a
                            Ford Motor Company.
                        </p>

                        <p className="mt-4">
                            O sistema não representa uma solução oficial da Ford
                            e não possui finalidade comercial.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">
                            3. Uso Permitido
                        </h2>

                        <p>
                            A plataforma destina-se exclusivamente à demonstração técnica,
                            estudos acadêmicos e apresentações relacionadas ao projeto.
                        </p>

                        <p className="mt-4">
                            É proibido utilizar o sistema para fins ilegais, atividades
                            ofensivas ou qualquer ação que viole legislações aplicáveis.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">
                            4. Propriedade Intelectual
                        </h2>

                        <p>
                            Todo o código, interface, documentação e identidade visual
                            desenvolvidos para o Spec Recon pertencem aos integrantes
                            acadêmicos responsáveis pelo projeto.
                        </p>

                        <p className="mt-4">
                            Marcas citadas, incluindo Ford, pertencem aos seus respectivos proprietários.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">
                            5. Limitação de Responsabilidade
                        </h2>

                        <p>
                            Por se tratar de um projeto acadêmico experimental,
                            não há garantias de disponibilidade contínua,
                            precisão absoluta das informações ou estabilidade operacional.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">
                            6. Atualizações
                        </h2>

                        <p>
                            Os presentes Termos de Uso poderão ser modificados conforme
                            a evolução do projeto e necessidades acadêmicas.
                        </p>
                    </section>
                </div>

                <div className="mt-20 pt-8 border-t border-white/10 text-sm text-white/30">
                    Última atualização · 14 de Maio de 2026
                </div>
            </div>
        </div>
    )
}

export default TermsOfUse