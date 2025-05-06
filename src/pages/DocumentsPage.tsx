
import { Sidebar } from "@/components/Dashboard/Sidebar";
import { DocumentUploader } from "@/components/Documents/DocumentUploader";

export default function DocumentsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Upload Notes & Documents</h1>
            <p className="text-muted-foreground mt-2">
              Upload your study materials and documents to organize them by course and type
            </p>
          </div>
          
          <DocumentUploader />
        </div>
      </main>
    </div>
  );
}
