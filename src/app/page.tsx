import { Chat } from "@/app/(chat)/_components/Chat";

export default function Home() {
  return (
    <main className="flex h-dvh w-full flex-1 items-stretch justify-center bg-zinc-50 dark:bg-black">
      <Chat />
    </main>
  );
}
