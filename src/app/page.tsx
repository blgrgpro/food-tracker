import { Board } from "@/components/board/Board";
import { TopBar } from "@/components/ui/TopBar";

export default function HomePage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopBar />
      <main className="flex-1 min-h-0 overflow-hidden">
        <Board />
      </main>
    </div>
  );
}
