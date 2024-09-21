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
              <TooltipTrigger>
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
                        <div className="h-0.5 w-full bg-orange" />
                      </div>
                      <div className="relative flex h-5 w-5 items-center justify-center rounded-full bg-orange">
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
                        <div className="h-0.5 w-full bg-gray-200" />
                      </div>
                      <div
                        aria-current="step"
                        className="relative flex h-5 w-5 items-center justify-center rounded-full border-2 border-orange bg-white"
                      >
                        <span
                          aria-hidden="true"
                          className="h-2.5 w-2.5 rounded-full bg-orange"
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
                        <div className="h-0.5 w-full bg-gray-200" />
                      </div>
                      <div className="group relative flex h-5 w-5 items-center justify-center rounded-full border-2 border-gray-300 bg-white">
                        <span
                          aria-hidden="true"
                          className="h-2 w-2 rounded-full bg-gray-300"
                        />
                        <span className="sr-only">{step.name}</span>
                      </div>
                    </>
                  )}
                </li>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-700 text-white font-bold px-2 py-1">{step.name}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </ol>
    </nav>
  );
}
