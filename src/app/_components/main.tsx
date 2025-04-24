import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import { Navbar } from "./navbar";
import { SigninLink } from "./signlink";

export async function MyApp({
    children,
}: Readonly<{ children: React.ReactNode }>) {  
const session = await auth();

return (
      <div className="bg-gray-100">
        <HydrateClient>
          <header>
            {session ? <Navbar session={session} /> : <SigninLink />}
          </header>
          <main className="container mx-auto py-6">
            {session ? children : <p>Not signed in</p>}
          </main>
        </HydrateClient>
      </div>
  );
}
