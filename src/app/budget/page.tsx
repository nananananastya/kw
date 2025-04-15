import Link from "next/link";

import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { Navbar } from "./_components/navbar";
import { SigninLink } from "./_components/signlink";

export default async function Home() {

  const session = await auth();

  return (
    <HydrateClient>
                <h1>новое</h1>
                <h2>СУПЕР ПУПЕР МЕГА ИЗМЕНЕНИЕ</h2>
      <header>
        {session ? <Navbar session={session}/> : <SigninLink/>}
      </header>
    </HydrateClient>
  );
}
