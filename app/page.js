import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";


export default function Home() {
  return (
    <div>
      <h1>Test</h1>
      <Button>Hellow</Button>
      <UserButton/>
    </div>
  );
}
