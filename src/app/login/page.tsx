import Image from "next/image";
import { login } from "./actions";

export default function LoginPage() {
  return (
    <div>
      <div className="absolute z-0 w-screen h-screen">
        <Image
          src="/vet1.avif"
          alt="Logo"
          fill
          style={{ objectFit: "cover" }}
          unoptimized
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>
      <div className="p-20 relative">
        <form className="flex flex-col gap-4 max-w-lg mx-auto mt-52 bg-gray-300 p-10 rounded">
          <label htmlFor="email">Email:</label>
          <input id="email" name="email" type="email" required />
          <label htmlFor="password">Password:</label>
          <input id="password" name="password" type="password" required />
          <div className="flex gap-10 justify-center mt-4">
            <button
              className="bg-gray-600 p-2 rounded-xl min-w-[200px] text-white"
              formAction={login}
            >
              Iniciar sesión
            </button>
            {/* <button className="bg-gray-300 p-2 rounded-xl min-w-[200px]" formAction={signup}>Sign up</button> */}
          </div>
        </form>
      </div>
    </div>
  );
}
