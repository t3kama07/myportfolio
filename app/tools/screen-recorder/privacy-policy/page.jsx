import { permanentRedirect } from "next/navigation";

export default function ScreenRecorderPrivacyRedirectPage() {
  permanentRedirect("/en/tools/screen-recorder/privacy-policy");
}
