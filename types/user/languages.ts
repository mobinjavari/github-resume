export interface LanguageStat {
  name: string
  color: string | null
  bytes: number
  repositoryCount: number
  percentage: number
}

export interface PolyglotRepository {
  name: string
  languageCount: number
}

export interface LanguageReport {
  languagesBySize: LanguageStat[]
  languagesByRepositoryCount: LanguageStat[]
  totalLanguageCount: number
  totalBytes: number
  totalRepositoryCount: number
  mostPolyglotRepository: PolyglotRepository | null
}
