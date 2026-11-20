import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckIcon } from "@heroicons/react/20/solid";

export interface StepCicle {
  name: string;
  status: "complete" | "current" | "upcoming";
}

interface StepsProps {
  steps: StepCicle[];
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function StepperCircle({ steps }: StepsProps) {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => (
          <TooltipProvider key={step.name} delayDuration={0}>
            <Tooltip>
              <TooltipTrigger className="cursor-default">
                <li
                  key={step.name}
                  className={classNames(
                    stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20" : "",
                    "relative"
                  )}
                >
                  {step.status === "complete" ? (
                    <>
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 flex items-center"
                      >
                        <div className="h-0.5 w-full bg-cta" />
                      </div>
                      <div className="relative flex h-5 w-5 items-center justify-center rounded-full bg-cta ">
                        <CheckIcon
                          aria-hidden="true"
                          className="h-4 w-4 text-white"
                        />
                        <span className="sr-only">{step.name}</span>
                      </div>
                    </>
                  ) : step.status === "current" ? (
                    <>
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 flex items-center"
                      >
                        <div className="h-0.5 w-full bg-muted" />
                      </div>
                      <div
                        aria-current="step"
                        className="relative flex h-5 w-5 items-center justify-center rounded-full border-2 border-cta bg-white"
                      >
                        <span
                          aria-hidden="true"
                          className="h-2.5 w-2.5 rounded-full bg-cta"
                        />
                        <span className="sr-only">{step.name}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 flex items-center"
                      >
                        <div className="h-0.5 w-full bg-muted" />
                      </div>
                      <div className="group relative flex h-5 w-5 items-center justify-center rounded-full border-2 border-border bg-white">
                        <span
                          aria-hidden="true"
                          className="h-2 w-2 rounded-full bg-border"
                        />
                        <span className="sr-only">{step.name}</span>
                      </div>
                    </>
                  )}
                </li>
              </TooltipTrigger>
              <TooltipContent className="bg-foreground text-white font-bold px-2 py-1">{step.name}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </ol>
    </nav>
  );
}
