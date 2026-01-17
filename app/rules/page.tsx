// app/regras/page.tsx
export default function RegrasSimples() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold text-slate-900">
            Regulamento da Competição
          </h1>
          <p className="text-xl text-slate-600">
            Regras oficiais do Brazuerao 2026
          </p>
        </header>

        {/* Rules Sections */}
        <div className="space-y-8">
          <SecaoRegra titulo="1. Formato Geral">
            <p>
              O Brasileirão tem 20 equipes competem em formato de pontos
              corridos ida e volta (38 partidas por equipe). A pontuação será
              atualizada a cada jogo. Ao fim do Brasileirão também encerra o
              Brazuerao.
            </p>
          </SecaoRegra>

          <SecaoRegra titulo="2. Sistema de Pontuação">
            <ul className="list-inside list-disc space-y-2">
              <li>Campeão correto: 3 pontos</li>
              <li>Time em posicao correta: 2 ponto</li>
              <li>Time em zona de classificação correta: 1 pontos</li>
            </ul>
          </SecaoRegra>

          <SecaoRegra titulo="3. Classificação">
            <ul className="list-inside list-disc space-y-2">
              <li>Posição 1: Campeão</li>
              <li>Posições 1-4: Zona de classificação</li>
              <li>Posições 5-16: Zona central</li>
              <li>Posições 17-20: Zona de rebaixamento</li>
            </ul>
          </SecaoRegra>

          <SecaoRegra titulo="4. Critérios de Desempate">
            <ol className="list-inside list-decimal space-y-2">
              <li>Número de pontos</li>
              <li>Campeão correto</li>
              <li>Número de times em posição correta</li>
              <li>Número de times em zona correta</li>
            </ol>
          </SecaoRegra>

          <SecaoRegra titulo="5. Prendas">
            <ul className="list-inside list-disc space-y-2">
              <li>Gols e infrações que levam a gols</li>
              <li>Decisões de pênalti</li>
              <li>Incidentes de cartão vermelho direto</li>
              <li>Identificação equivocada de jogador</li>
            </ul>
            <p className="mt-3 text-right text-xs">
              Podem ser revistas e alteradas até a data limite da aposta.
            </p>
          </SecaoRegra>
        </div>
      </div>
    </div>
  )
}

function SecaoRegra({
  titulo,
  children,
}: {
  titulo: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
      <h2 className="mb-4 text-2xl font-bold text-slate-800">{titulo}</h2>
      <div className="text-slate-700">{children}</div>
    </section>
  )
}
