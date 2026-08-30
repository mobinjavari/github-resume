export interface RepositoryLanguage {
  name: string
  color: string | null
}

export interface Repository {
  name: string
  description: string | null
  url: string
  stargazerCount: number
  forkCount: number
  primaryLanguage: RepositoryLanguage | null
}

export type Repositories = Repository[]
