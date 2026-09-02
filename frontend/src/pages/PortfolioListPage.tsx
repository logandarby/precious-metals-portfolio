import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { CircleAlert } from "lucide-react";
import { isRejectedApiError } from "@/api/client";
import { PortfolioMenu } from "@/components/PortfolioMenu";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createPortfolio,
  fetchPortfolios,
  selectPortfolios,
  selectPortfoliosError,
  selectPortfoliosLoaded,
  selectPortfoliosLoading,
  selectTotalValue,
} from "@/store/portfoliosSlice";
import {
  formatCad,
  formatSignedCad,
  formatSignedPercent,
} from "@/lib/format";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

const createSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
});

type CreateFormValues = z.infer<typeof createSchema>;

export function PortfolioListPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const portfolios = useAppSelector(selectPortfolios);
  const totalValue = useAppSelector(selectTotalValue);
  const loaded = useAppSelector(selectPortfoliosLoaded);
  const loading = useAppSelector(selectPortfoliosLoading);
  const error = useAppSelector(selectPortfoliosError);
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    void dispatch(fetchPortfolios());
  }, [dispatch]);

  async function onValid({ name }: CreateFormValues) {
    try {
      const created = await dispatch(createPortfolio(name)).unwrap();
      toast.success("Portfolio created");
      reset();
      setOpen(false);
      navigate(`/portfolios/${created.id}`);
    } catch (cause) {
      toast.error(
        isRejectedApiError(cause) ? cause.message : "Could not create portfolio",
      );
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
            Overview
          </p>
          <h1 className="font-heading mt-1 text-3xl font-semibold">
            Portfolios
          </h1>
        </div>
        <Dialog
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (!next) {
              reset();
            }
          }}
        >
          <DialogTrigger render={<Button />}>Create portfolio</DialogTrigger>
          <DialogContent>
            <form
              className="grid gap-4"
              noValidate
              onSubmit={handleSubmit(onValid)}
            >
              <DialogHeader>
                <DialogTitle>Create portfolio</DialogTitle>
                <DialogDescription>
                  Just a name. Holdings are stored in CAD.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-2">
                <Label htmlFor="portfolio-name">Name</Label>
                <Input
                  id="portfolio-name"
                  maxLength={255}
                  {...register("name")}
                  aria-invalid={Boolean(errors.name)}
                />
                {errors.name ? (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                ) : null}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating…" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error ? (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertTitle>Could not load portfolios</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {loading && !loaded ? (
        <PortfolioListSkeleton />
      ) : (
        <>
          <Card>
            <CardHeader className="border-b">
              <CardDescription>Total value</CardDescription>
              <CardTitle className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
                {formatCad(totalValue)}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                {portfolios.length === 1
                  ? "1 portfolio · CAD"
                  : `${portfolios.length} portfolios · CAD`}
              </p>
            </CardContent>
          </Card>

          {portfolios.length === 0 && !error ? (
            <Card>
              <CardHeader>
                <CardTitle>No portfolios yet</CardTitle>
                <CardDescription>
                  Create one to start logging purchases.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {portfolios.map((portfolio) => (
                <Card
                  key={portfolio.id}
                  className="relative h-full transition-colors hover:bg-accent/30"
                >
                  <div className="absolute top-3 right-3 z-10">
                    <PortfolioMenu portfolio={portfolio} />
                  </div>
                  <Link
                    to={`/portfolios/${portfolio.id}`}
                    className="block rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <CardHeader className="pr-12">
                      <CardDescription>{portfolio.name}</CardDescription>
                      <CardTitle className="text-2xl tracking-tight">
                        {formatCad(portfolio.value)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex gap-4 text-sm text-muted-foreground">
                      <span>{formatSignedCad(portfolio.gain)}</span>
                      <span>{formatSignedPercent(portfolio.returnPercent)}</span>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PortfolioListSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="grid gap-8">
      <span className="sr-only">Loading portfolios</span>
      <Card>
        <CardHeader className="border-b">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="mt-2 h-12 w-56 sm:h-14" />
        </CardHeader>
        <CardContent className="pt-4">
          <Skeleton className="h-4 w-36" />
        </CardContent>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }, (_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-2 h-8 w-40" />
            </CardHeader>
            <CardContent className="flex gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
