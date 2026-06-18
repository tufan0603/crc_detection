import useSWR from 'swr'

const fetcher = url => fetch(url).then(r => r.json())

export function useScans() {
  const { data, error, isLoading, mutate } = useSWR('/api/scans', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,  // cache for 30 seconds
  })
  return {
    scans:   data?.scans ?? [],
    loading: isLoading,
    error,
    refresh: mutate,
  }
}
