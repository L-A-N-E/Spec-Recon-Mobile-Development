function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-black text-white">

            <div className="max-w-5xl mx-auto px-6 lg:px-10 pt-32 pb-24">

                <div className="mb-14">
                    <div className="text-xs uppercase tracking-[0.3em] text-blue-400 mb-4">
                        Documento legal
                    </div>

                    <h1 className="text-5xl font-bold tracking-tight">
                        Política de Privacidade
                    </h1>

                    <p className="mt-6 text-lg text-white/50 leading-relaxed max-w-3xl">
                        Esta Política de Privacidade descreve como os dados são tratados
                        dentro da plataforma Spec Recon, desenvolvida exclusivamente
                        para fins acadêmicos no contexto do Challenge FIAP 2026.
                    </p>
                </div>

                <div className="space-y-12 text-white/70 leading-relaxed">

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">
                            1. Sobre o Projeto
                        </h2>

                        <p>
                            O Spec Recon é um projeto acadêmico desenvolvido por estudantes
                            do curso de Engenharia de Software da
                            FIAP (Faculdade de Informática e Administração Paulista)
                            como parte do evento Challenge 2026, em parceria com a
                            Ford Motor Company.
                        </p>

                        <p className="mt-4">
                            A plataforma possui caráter exclusivamente educacional e
                            demonstrativo, não representando um produto comercial oficial.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">
                            2. Coleta de Dados
                        </h2>

                        <p>
                            O projeto poderá coletar informações básicas de autenticação,
                            como nome, e-mail institucional e dados de acesso utilizados
                            para fins acadêmicos e operacionais da plataforma.
                        </p>

                        <p className="mt-4">
                            Nenhuma informação sensível será comercializada, compartilhada
                            ou utilizada fora do escopo educacional do projeto.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">
                            3. Fontes de Informação
                        </h2>

                        <p>
                            O sistema utiliza exclusivamente técnicas legais de OSINT
                            (Open Source Intelligence) e coleta automatizada de dados
                            públicos disponíveis na internet.
                        </p>

                        <p className="mt-4">
                            Não são realizadas invasões, obtenção indevida de credenciais
                            ou acesso não autorizado a sistemas privados.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">
                            4. Uso Acadêmico
                        </h2>

                        <p>
                            Toda a plataforma foi construída com finalidade educacional,
                            tecnológica e demonstrativa para apresentação no Challenge FIAP 2026.
                        </p>

                        <p className="mt-4">
                            O conteúdo apresentado possui objetivo de demonstrar capacidades
                            técnicas relacionadas a engenharia de software, análise de dados,
                            automação e inteligência artificial.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">
                            5. Alterações
                        </h2>

                        <p>
                            Esta Política de Privacidade poderá ser atualizada conforme a
                            evolução acadêmica do projeto e seus requisitos institucionais.
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

export default PrivacyPolicy