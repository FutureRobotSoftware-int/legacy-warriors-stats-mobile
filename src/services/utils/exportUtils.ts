import type { IShotData } from "../../types/shotData"
function calcFG(entries: IShotData[]) {
    let makes = 0

    for (const e of entries) {
        if (String(e["Make/Miss"]).trim() === "Make") makes++
    }

    return entries.length ? Math.round((makes / entries.length) * 100) : 0
}

function groupBy(
    data: IShotData[],
    field: keyof IShotData
): Record<string, IShotData[]> {
    const map: Record<string, IShotData[]> = {}

    for (const entry of data) {
        const key = String(entry[field] ?? "Unknown")

        if (!map[key]) map[key] = []
        map[key].push(entry)
    }

    return map
}

export function exportToCSV(
    data: IShotData[],
    selection: Record<string, boolean>
) {
    if (!data.length) return

    let rows: string[] = []

    for (const [category, enabled] of Object.entries(selection)) {
        if (!enabled) continue

        const grouped = groupBy(data, category as keyof IShotData)

        // Global
        rows.push(`${category},${data.length},${calcFG(data)}%`)

        // Subcategorías
        for (const [name, entries] of Object.entries(grouped)) {
            rows.push(`- ${name},${entries.length},${calcFG(entries)}%`)
        }

        rows.push("") // línea vacía separadora
    }

    const csvContent =
        "Category,Frequency,FG%\n" + rows.join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = "shot_analysis.csv"
    link.click()

    URL.revokeObjectURL(url)
}
