export interface Status {
    emojiHTML?: string
    message: string
    indicatesLimitedAvailability: boolean
}

export interface Profile {
    name: string
    login: string
    url: string
    avatarUrl: string
    status?: Status | null
    bio?: string
    company?: string
    location?: string
    websiteUrl?: string
    email?: string
    followers: number
    following: number
    repositories: number
    gists: number
    stars: number
    contributions: number
    createdAt: string
}