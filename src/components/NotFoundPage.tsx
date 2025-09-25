import { Illustration, NotFoundComp } from "./not-found";

interface PageProps {
  description?: string;
  button?: string;
  buttonUrl?: string;
  title?: string;
}

export function NotFound({ description, button, buttonUrl }: PageProps) {
  return (
    <div className="relative flex min-h-svh w-full flex-col justify-center bg-background p-6 md:p-10">
      <div className="relative mx-auto w-full max-w-5xl">
        <Illustration className="absolute inset-0 h-[50vh] w-full text-primary-main opacity-[0.06] dark:opacity-[0.03]" />
        <NotFoundComp
          title="Page not found"
          description={
            description ||
            "This page has been moved temporarily or not found. Please check back later."
          }
          button={button || "Go to Homepage"}
          buttonUrl={buttonUrl || "/"}
        />
      </div>
    </div>
  );
}
