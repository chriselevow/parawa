import { DiscoverExperience } from "@/components/discover-experience"
import { PrototypeShell } from "@/components/prototype-shell"

export default function DiscoverPage() {
  return (
    <PrototypeShell active="/discover">
      <DiscoverExperience />
    </PrototypeShell>
  )
}
