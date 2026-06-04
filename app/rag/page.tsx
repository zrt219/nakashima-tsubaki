import RagDashboard from "@/components/tn-command-center/rag-dashboard";

export const metadata = {
  title: "RAG Knowledge Repository",
  description: "RAG Knowledge Graph Dashboard",
};

export default function RagPage() {
  return (
    <main className="w-full h-screen bg-black overflow-hidden">
      <RagDashboard />
    </main>
  );
}
