import { DiscoverExperience } from "@/components/discover-experience"
import { PrototypeShell } from "@/components/prototype-shell"
import { getCategories, getProviders } from "@/lib/parawa-data"

export default async function DiscoverPage() {
  const [categories, providers] = await Promise.all([
    getCategories(),
    getProviders(),
  ])

  return (
    <PrototypeShell active="/discover">
      <DiscoverExperience categories={categories} providers={providers} />
    </PrototypeShell>
  )
}
