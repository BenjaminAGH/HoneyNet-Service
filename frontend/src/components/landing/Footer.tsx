import Link from "next/link";
import Image from "next/image";
import React from "react";
import { Container } from "@/components/landing/Container";

export function Footer() {
  const navigation = ["", "", "", "", ""];
  const legal = ["", "", ""];
  return (
    <div className="relative border-t-2 border-border-foreground">
      <Container>
        <div className="grid max-w-screen-xl grid-cols-1 gap-10 mx-auto mt-5 border-t border-background lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div>
              {" "}
              <Link
                href="/"
                className="flex items-center space-x-2 text-2xl font-medium text-destructive dark:text-primary"
              >
                <>
                  <Image
                    src="/img/iconLight.svg"
                    alt="Logo claro"
                    width={32}
                    height={32}
                    className="w-8 block dark:hidden"
                  />
                  <Image
                    src="/img/iconDark.svg"
                    alt="Logo oscuro"
                    width={32}
                    height={32}
                    className="w-8 hidden dark:block"
                  />
                </>
                <span>Nocturne Security</span>
              </Link>
            </div>

            <div className="max-w-md mt-4 text-gray-500 dark:text-gray-400">
              MirageNet es la tesis para el título de Ingeniero de Ejecución en Computación
              e Informática que busca formalizar una plataforma para la gestión de honeypots.
            </div>
          </div>

          <div>
            <div className="flex flex-wrap w-full -mt-2 -ml-3 lg:ml-0">
              {navigation.map((item, index) => (
                <Link
                  key={index}
                  href="/"
                  className="w-full px-4 py-2 text-gray-500 rounded-md dark:text-gray-300 hover:text-indigo-500 focus:text-indigo-500 focus:bg-indigo-100 focus:outline-none dark:focus:bg-trueGray-700"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div className="flex flex-wrap w-full -mt-2 -ml-3 lg:ml-0">
              {legal.map((item, index) => (
                <Link
                  key={index}
                  href="/"
                  className="w-full px-4 py-2 text-gray-500 rounded-md dark:text-gray-300 hover:text-indigo-500 focus:text-indigo-500 focus:bg-indigo-100 focus:outline-none dark:focus:bg-trueGray-700"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
          <div className="">
            <div>Redes Sociales</div>
            <div className="flex mt-5 space-x-5 text-accent">
              <a
                href="https://github.com/BenjaminAGH"
                target="_blank"
                rel="noopener"
              >
                <span className="sr-only">GitHub</span>
                <GitHub />
              </a>
              <a
                href="https://instagram.com/web3templates"
                target="_blank"
                rel="noopener"
              >
                <span className="sr-only">Instagram</span>
                <Instagram />
              </a>
              <a href="https://www.linkedin.com/in/benjamin-guajardo-herrera/" target="_blank" rel="noopener">
                <span className="sr-only">Linkedin</span>
                <Linkedin />
              </a>
            </div>
          </div>
        </div>

        <div className="my-10 text-sm text-center text-gray-600 dark:text-gray-400">
          Copyright © {new Date().getFullYear()}. Made by{" "}
          <a href="https://www.linkedin.com/in/benjamin-guajardo-herrera/" target="_blank" rel="noopener">
            Benjamin Guajardo Herrera
          </a>{" "}
        </div>
      </Container>

    </div>
  );
}

const Twitter = ({ size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M24 4.37a9.6 9.6 0 0 1-2.83.8 5.04 5.04 0 0 0 2.17-2.8c-.95.58-2 1-3.13 1.22A4.86 4.86 0 0 0 16.61 2a4.99 4.99 0 0 0-4.79 6.2A13.87 13.87 0 0 1 1.67 2.92 5.12 5.12 0 0 0 3.2 9.67a4.82 4.82 0 0 1-2.23-.64v.07c0 2.44 1.7 4.48 3.95 4.95a4.84 4.84 0 0 1-2.22.08c.63 2.01 2.45 3.47 4.6 3.51A9.72 9.72 0 0 1 0 19.74 13.68 13.68 0 0 0 7.55 22c9.06 0 14-7.7 14-14.37v-.65c.96-.71 1.79-1.6 2.45-2.61z" />
  </svg>
);

const GitHub = ({ size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 0C5.37 0 0 5.4 0 12.07c0 5.33 3.44 9.84 8.21 11.44.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.74-4.04-1.63-4.04-1.63-.55-1.42-1.34-1.8-1.34-1.8-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.27 1.84 1.27 1.07 1.86 2.81 1.33 3.5 1.02.11-.8.42-1.34.76-1.65-2.66-.31-5.47-1.34-5.47-5.94 0-1.31.46-2.38 1.22-3.23-.12-.31-.53-1.56.12-3.25 0 0 1-.33 3.3 1.23a11.29 11.29 0 0 1 6 0C17.98 4.48 19 4.81 19 4.81c.66 1.69.24 2.94.12 3.25.76.85 1.22 1.92 1.22 3.23 0 4.61-2.81 5.62-5.49 5.92.43.38.81 1.13.81 2.29 0 1.65-.02 2.98-.02 3.39 0 .32.22.7.83.58C20.57 21.9 24 17.39 24 12.07 24 5.4 18.63 0 12 0z" />
  </svg>
);

const Instagram = ({ size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M16.98 0a6.9 6.9 0 0 1 5.08 1.98A6.94 6.94 0 0 1 24 7.02v9.96c0 2.08-.68 3.87-1.98 5.13A7.14 7.14 0 0 1 16.94 24H7.06a7.06 7.06 0 0 1-5.03-1.89A6.96 6.96 0 0 1 0 16.94V7.02C0 2.8 2.8 0 7.02 0h9.96zm.05 2.23H7.06c-1.45 0-2.7.43-3.53 1.25a4.82 4.82 0 0 0-1.3 3.54v9.92c0 1.5.43 2.7 1.3 3.58a5 5 0 0 0 3.53 1.25h9.88a5 5 0 0 0 3.53-1.25 4.73 4.73 0 0 0 1.4-3.54V7.02a5 5 0 0 0-1.3-3.49 4.82 4.82 0 0 0-3.54-1.3zM12 5.76c3.39 0 6.2 2.8 6.2 6.2a6.2 6.2 0 0 1-12.4 0 6.2 6.2 0 0 1 6.2-6.2zm0 2.22a3.99 3.99 0 0 0-3.97 3.97A3.99 3.99 0 0 0 12 15.92a3.99 3.99 0 0 0 3.97-3.97A3.99 3.99 0 0 0 12 7.98zm6.44-3.77a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8z" />
  </svg>
);

const Linkedin = ({ size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0zM7.27 20.1H3.65V9.24h3.62V20.1zM5.47 7.76h-.03c-1.22 0-2-.83-2-1.87 0-1.06.8-1.87 2.05-1.87 1.24 0 2 .8 2.02 1.87 0 1.04-.78 1.87-2.05 1.87zM20.34 20.1h-3.63v-5.8c0-1.45-.52-2.45-1.83-2.45-1 0-1.6.67-1.87 1.32-.1.23-.11.55-.11.88v6.05H9.28s.05-9.82 0-10.84h3.63v1.54a3.6 3.6 0 0 1 3.26-1.8c2.39 0 4.18 1.56 4.18 4.89v6.21z" />
  </svg>
);
