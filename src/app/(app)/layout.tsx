import Nav from "@/components/Nav";
import { getOrCreateHouseholdId } from "@/lib/household";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure the user has a household before any (app) page renders.
  await getOrCreateHouseholdId();

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 md:px-6 py-6 pb-24 md:pb-10">
        {children}
      </main>
    </div>
  );
}
