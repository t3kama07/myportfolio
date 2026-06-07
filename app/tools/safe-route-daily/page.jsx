import { permanentRedirect } from "next/navigation";

export default function SafeRouteDailyRedirectPage() {
  permanentRedirect("/en/tools/safe-route-daily");
}
