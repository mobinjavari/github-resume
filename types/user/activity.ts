export interface DayData {
    date: string
    count: number
}

export interface Activity {
    url: string
    data: DayData[]
}