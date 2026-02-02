import { LeaderboardEntry, RuleBet, ScoreEntry } from '@/types/domain'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface GroupPDFData {
  groupName: string
  deadline: Date | string
  leaderboard: LeaderboardEntry[]
  getRuleByRuleId: (ruleId: string) => RuleBet | undefined
}

/**
 * Generates PDF with group predictions and leaderboard
 */
export function generateGroupPredictionsPDF(data: GroupPDFData): void {
  const doc = new jsPDF('landscape') // Landscape for better table view
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Format deadline date
  const deadlineStr = new Date(data.deadline).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  // Header
  doc.setFillColor(22, 163, 74)
  doc.rect(0, 0, pageWidth, 40, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(data.groupName, 14, 18)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Apostas encerradas em ${deadlineStr}`, 14, 28)

  doc.setFontSize(9)
  doc.text(
    `Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
    14,
    35
  )

  doc.setTextColor(0, 0, 0)
  let yPosition = 50

  // ============= LEADERBOARD TABLE =============
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Classificação do Grupo', 14, yPosition)
  yPosition += 10

  const sortedLeaderboard = [...data.leaderboard].sort(
    (a, b) => b.totalScore - a.totalScore
  )

  const leaderboardData = sortedLeaderboard.map((entry, index) => [
    index + 1,
    entry.username,
    entry.totalScore.toFixed(0),
  ])

  autoTable(doc, {
    startY: yPosition,
    head: [['Pos.', 'Usuário', 'Pontuação']],
    body: leaderboardData,
    theme: 'striped',
    headStyles: {
      fillColor: [22, 163, 74],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 11,
    },
    bodyStyles: {
      fontSize: 10,
    },
    alternateRowStyles: {
      fillColor: [240, 253, 244],
    },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center' },
      1: { cellWidth: 100 },
      2: { cellWidth: 40, halign: 'center' },
    },
    margin: { left: 14, right: 14 },
  })

  // @ts-expect-error: Expected value
  yPosition = doc.lastAutoTable.finalY + 15

  // ============= FINAL STANDINGS PREDICTIONS TABLE =============
  if (yPosition > pageHeight - 80) {
    doc.addPage()
    yPosition = 20
  }

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Previsões de Classificação Final', 14, yPosition)
  yPosition += 10

  // Get max number of predictions (should be 20 for Brasileirão)
  const maxPredictions = Math.max(
    ...sortedLeaderboard.map((entry) => entry.predictions.length)
  )

  if (maxPredictions > 0) {
    // Create table headers: [Pos, User1, User2, User3, ...]
    const predictionsHeaders = [
      'Pos',
      ...sortedLeaderboard.map((entry) => {
        // Truncate long usernames
        return entry.username.length > 12
          ? entry.username.substring(0, 10) + '...'
          : entry.username
      }),
    ]

    // Create table body: each row is a position (1st, 2nd, 3rd, etc.)
    const predictionsTableData = []
    for (let position = 0; position < maxPredictions; position++) {
      const row = [
        `${position + 1}º`, // Position label
        ...sortedLeaderboard.map((entry) => {
          const team = entry.predictions[position]
          if (team) {
            // Truncate long team names
            return team.length > 15 ? team.substring(0, 13) + '...' : team
          }
          return '-'
        }),
      ]
      predictionsTableData.push(row)
    }

    // Calculate dynamic column width based on number of users
    const numUsers = sortedLeaderboard.length
    const posColumnWidth = 15
    const availableWidth = pageWidth - 28 - posColumnWidth // margins + pos column
    const userColumnWidth = Math.min(
      50,
      Math.max(25, availableWidth / numUsers)
    )

    autoTable(doc, {
      startY: yPosition,
      head: [predictionsHeaders],
      body: predictionsTableData,
      theme: 'grid',
      headStyles: {
        fillColor: [22, 163, 74],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center',
        valign: 'middle',
      },
      bodyStyles: {
        fontSize: 7,
        cellPadding: 2,
        halign: 'center',
        valign: 'middle',
      },
      columnStyles: {
        0: {
          cellWidth: posColumnWidth,
          fontStyle: 'bold',
          fillColor: [240, 253, 244],
          halign: 'center',
        },
        ...Object.fromEntries(
          sortedLeaderboard.map((_, idx) => [
            idx + 1,
            { cellWidth: userColumnWidth },
          ])
        ),
      },
      margin: { left: 14, right: 14 },
      didParseCell: (data) => {
        // Highlight empty predictions
        if (
          data.section === 'body' &&
          data.column.index > 0 &&
          data.cell.text[0] === '-'
        ) {
          data.cell.styles.textColor = [200, 200, 200]
          data.cell.styles.fillColor = [250, 250, 250]
        }
        // Highlight top 4 positions (G4 - Libertadores)
        if (data.section === 'body' && data.row.index < 4) {
          if (data.column.index === 0) {
            data.cell.styles.fillColor = [187, 247, 208] // Light green
            data.cell.styles.textColor = [22, 101, 52] // Dark green
          }
        }
        // Highlight positions 5-6 (Pré-Libertadores)
        else if (
          data.section === 'body' &&
          data.row.index >= 4 &&
          data.row.index < 6
        ) {
          if (data.column.index === 0) {
            data.cell.styles.fillColor = [254, 240, 138] // Light yellow
            data.cell.styles.textColor = [161, 98, 7] // Dark yellow
          }
        }
        // Highlight last 4 positions (Rebaixamento)
        else if (
          data.section === 'body' &&
          data.row.index >= maxPredictions - 4
        ) {
          if (data.column.index === 0) {
            data.cell.styles.fillColor = [254, 202, 202] // Light red
            data.cell.styles.textColor = [153, 27, 27] // Dark red
          }
        }
      },
    })

    // @ts-expect-error: Expected value
    yPosition = doc.lastAutoTable.finalY + 10

    // Legend for colors
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(107, 114, 128)
    doc.text(
      '🟢 Verde: Libertadores (G4) | 🟡 Amarelo: Pré-Libertadores | 🔴 Vermelho: Rebaixamento',
      14,
      yPosition
    )
    yPosition += 10
  } else {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(107, 114, 128)
    doc.text('Nenhuma previsão de classificação registrada', 14, yPosition)
    yPosition += 15
  }

  // ============= DETAILED SCORES PER USER =============
  doc.addPage()
  yPosition = 20

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('Detalhamento de Pontuação', 14, yPosition)
  yPosition += 10

  sortedLeaderboard.forEach((entry, index) => {
    if (yPosition > pageHeight - 60) {
      doc.addPage()
      yPosition = 20
    }

    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(22, 163, 74)
    doc.text(
      `${index + 1}. ${entry.username} - ${entry.totalScore.toFixed(0)} pts`,
      14,
      yPosition
    )
    yPosition += 8

    if (entry.score && entry.score.length > 0) {
      const scoreData = entry.score.map((scoreEntry: ScoreEntry) => [
        data.getRuleByRuleId(scoreEntry.ruleId)?.description ?? 'Sem descrição',
        scoreEntry.teams.join(', '),
        scoreEntry.score.toFixed(0),
      ])

      autoTable(doc, {
        startY: yPosition,
        head: [['Regra', 'Times Apostados', 'Pontos']],
        body: scoreData,
        theme: 'plain',
        headStyles: {
          fillColor: [229, 231, 235],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          fontSize: 9,
        },
        bodyStyles: {
          fontSize: 8,
        },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 100 },
          2: { cellWidth: 30, halign: 'center' },
        },
        margin: { left: 20, right: 14 },
      })

      // @ts-expect-error: Expected value
      yPosition = doc.lastAutoTable.finalY + 10
    } else {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(107, 114, 128)
      doc.text('Nenhuma pontuação registrada', 20, yPosition)
      yPosition += 10
    }

    doc.setTextColor(0, 0, 0)
  })

  // Footer on all pages
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(9)
    doc.setTextColor(107, 114, 128)
    doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 10, {
      align: 'center',
    })
    doc.text('Brazuerao © ' + new Date().getFullYear(), 14, pageHeight - 10)
  }

  const fileName = `${data.groupName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}

/**
 * Generates a simplified PDF with just the leaderboard
 */
export function generateSimpleLeaderboardPDF(data: GroupPDFData): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  const deadlineStr = new Date(data.deadline).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  // Header
  doc.setFillColor(22, 163, 74)
  doc.rect(0, 0, pageWidth, 35, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(data.groupName, 14, 15)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Apostas encerradas em ${deadlineStr}`, 14, 25)

  // Leaderboard
  const leaderboardData = data.leaderboard
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((entry, index) => [
      index + 1,
      entry.username,
      entry.totalScore.toFixed(0),
    ])

  autoTable(doc, {
    startY: 45,
    head: [['Posição', 'Usuário', 'Pontuação Total']],
    body: leaderboardData,
    theme: 'striped',
    headStyles: {
      fillColor: [22, 163, 74],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [240, 253, 244],
    },
  })

  const fileName = `${data.groupName.replace(/\s+/g, '_')}_leaderboard.pdf`
  doc.save(fileName)
}

/**
 * Generates PDF with ONLY the final standings predictions comparison
 */
export function generatePredictionsComparisonPDF(data: GroupPDFData): void {
  const doc = new jsPDF('landscape')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  const deadlineStr = new Date(data.deadline).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  // Header
  doc.setFillColor(22, 163, 74)
  doc.rect(0, 0, pageWidth, 35, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(`${data.groupName} - Previsões de Classificação`, 14, 15)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Apostas encerradas em ${deadlineStr}`, 14, 25)

  doc.setTextColor(0, 0, 0)

  const sortedLeaderboard = [...data.leaderboard].sort(
    (a, b) => b.totalScore - a.totalScore
  )

  const maxPredictions = Math.max(
    ...sortedLeaderboard.map((entry) => entry.predictions.length)
  )

  if (maxPredictions === 0) {
    doc.setFontSize(12)
    doc.text('Nenhuma previsão de classificação registrada', 14, 50)
  } else {
    // Add current scores in header
    const userScores = sortedLeaderboard.map((entry) => {
      const username =
        entry.username.length > 20
          ? entry.username.substring(0, 20) + '...'
          : entry.username
      return `${username}`
    })

    const predictionsHeaders = ['Pos', ...userScores]

    const predictionsTableData = []
    for (let position = 0; position < maxPredictions; position++) {
      const row = [
        `${position + 1}º`,
        ...sortedLeaderboard.map((entry) => {
          const team = entry.predictions[position]
          return team || '-'
        }),
      ]
      predictionsTableData.push(row)
    }

    const numUsers = sortedLeaderboard.length
    const posColumnWidth = 15
    const availableWidth = pageWidth - 28 - posColumnWidth
    const userColumnWidth = Math.min(
      50,
      Math.max(25, availableWidth / numUsers)
    )

    autoTable(doc, {
      startY: 45,
      head: [predictionsHeaders],
      body: predictionsTableData,
      theme: 'grid',
      headStyles: {
        fillColor: [22, 163, 74],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'center',
        valign: 'middle',
        cellPadding: 3,
      },
      bodyStyles: {
        fontSize: 7,
        cellPadding: 2,
        halign: 'center',
        valign: 'middle',
      },
      columnStyles: {
        0: {
          cellWidth: posColumnWidth,
          fontStyle: 'bold',
          fillColor: [240, 253, 244],
          halign: 'center',
        },
        ...Object.fromEntries(
          sortedLeaderboard.map((_, idx) => [
            idx + 1,
            { cellWidth: userColumnWidth },
          ])
        ),
      },
      margin: { left: 10, right: 10 },
      didParseCell: (data) => {
        if (
          data.section === 'body' &&
          data.column.index > 0 &&
          data.cell.text[0] === '-'
        ) {
          data.cell.styles.textColor = [200, 200, 200]
          data.cell.styles.fillColor = [250, 250, 250]
        }
        if (data.section === 'body' && data.row.index < 4) {
          if (data.column.index === 0) {
            data.cell.styles.fillColor = [187, 247, 208]
            data.cell.styles.textColor = [22, 101, 52]
          }
        } else if (
          data.section === 'body' &&
          data.row.index >= 4 &&
          data.row.index < 6
        ) {
          if (data.column.index === 0) {
            data.cell.styles.fillColor = [254, 240, 138]
            data.cell.styles.textColor = [161, 98, 7]
          }
        } else if (
          data.section === 'body' &&
          data.row.index >= maxPredictions - 4
        ) {
          if (data.column.index === 0) {
            data.cell.styles.fillColor = [254, 202, 202]
            data.cell.styles.textColor = [153, 27, 27]
          }
        }
      },
    })
  }

  // Footer
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(9)
    doc.setTextColor(107, 114, 128)
    doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 10, {
      align: 'center',
    })
    doc.text('Brazuerao © ' + new Date().getFullYear(), 14, pageHeight - 10)
  }

  const fileName = `${data.groupName.replace(/\s+/g, '_')}_previsoes_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}
