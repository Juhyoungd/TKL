import { FindgooScreen } from "@/src/components/screens/FindgooScreen";

export const dynamic = "force-dynamic";

export default async function Home() {
  return <FindgooScreen initialView="home" />;
}
