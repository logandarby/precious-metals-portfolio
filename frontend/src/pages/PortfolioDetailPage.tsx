import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowLeft, CircleAlert } from "lucide-react";
import { type HistoryRange } from "@/api/portfolios";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectPortfolios } from "@/store/portfoliosSlice";
import {
  fetchSelectedHistory,
  fetchSelectedPortfolio,
  selectCurrentPortfolio,
  selectHistory,
  selectHistoryLoading,
  selectHistoryRange,
  selectSelectedError,
  selectTransactions,
  setHistoryRange,
} from "@/store/selectedPortfolioSlice";
import {
  formatCad,
  formatPercent,
  formatQuantity,
  formatSignedCad,
  formatSignedPercent,
  METAL_CHART_COLORS,
  METAL_LABELS,
  METAL_ORDER,
} from "@/lib/format";
import { PortfolioMenu } from "@/components/PortfolioMenu";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useUserPreference } from "@/hooks/useUserPreference";

const HISTORY_RANGES: { value: HistoryRange; label: string }[] = [
  { value: "1D", label: "1D" },
  { value: "1W", label: "1W" },
  { value: "1M", label: "1M" },
  { value: "3M", label: "3M" },
  { value: "1Y", label: "1Y" },
  { value: "YTD", label: "YTD" },
  { value: "ALL", label: "All" },
];

const DEFAULT_HISTORY_RANGE: HistoryRange = "ALL";
const HISTORY_RANGE_PREFERENCE_KEY = "portfolio.historyRange";

function isHistoryRange(value: unknown): value is HistoryRange {
  return (
    typeof value === "string" &&
    HISTORY_RANGES.some((option) => option.value === value)
  );
}

export function PortfolioDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const selected = useAppSelector(selectCurrentPortfolio);
  const listItems = useAppSelector(selectPortfolios);
  const error = useAppSelector(selectSelectedError);
  const transactions = useAppSelector(selectTransactions);
  const history = useAppSelector(selectHistory);
  const selectedHistoryRange = useAppSelector(selectHistoryRange);
  const {
    value: historyRange,
    onChange: setHistoryRangePreference,
    reset: resetHistoryRange,
  } = useUserPreference<HistoryRange>(
    HISTORY_RANGE_PREFERENCE_KEY,
    DEFAULT_HISTORY_RANGE,
    { validate: isHistoryRange },
  );
  const historyLoading = useAppSelector(selectHistoryLoading);

  useEffect(() => {
    if (!isHistoryRange(historyRange)) {
      resetHistoryRange();
    }
    if (selectedHistoryRange !== historyRange) {
      dispatch(setHistoryRange(historyRange));
    }
  }, [dispatch, historyRange, resetHistoryRange, selectedHistoryRange]);

  const portfolio =
    selected?.id === id
      ? selected
      : (listItems.find((item) => item.id === id) ?? null);

  useEffect(() => {
    if (!id) {
      return;
    }
    void dispatch(fetchSelectedPortfolio({ id }));
  }, [dispatch, id]);

  useEffect(() => {
    if (!id) {
      return;
    }
    void dispatch(fetchSelectedHistory({ id, range: historyRange }));
  }, [dispatch, id, historyRange]);

  if (!id) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <Alert variant="destructive">
          <CircleAlert />
          <AlertTitle>Portfolio unavailable</AlertTitle>
          <AlertDescription>Portfolio not found</AlertDescription>
        </Alert>
        <Link
          to="/portfolios"
          className={buttonVariants({
            variant: "outline",
            className: "self-start",
          })}
        >
          <ArrowLeft data-icon="inline-start" />
          Back to portfolios
        </Link>
      </div>
    );
  }

  if (!portfolio && !error) {
    return <PortfolioDetailSkeleton />;
  }

  if (error || !portfolio) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <Alert variant="destructive">
          <CircleAlert />
          <AlertTitle>Portfolio unavailable</AlertTitle>
          <AlertDescription>{error ?? "Portfolio not found"}</AlertDescription>
        </Alert>
        <Link
          to="/portfolios"
          className={buttonVariants({
            variant: "outline",
            className: "self-start",
          })}
        >
          <ArrowLeft data-icon="inline-start" />
          Back to portfolios
        </Link>
      </div>
    );
  }

  const allocationEntries = METAL_ORDER.filter(
    (metal) => portfolio.allocation[metal] != null,
  ).map((metal) => ({
    metal,
    name: METAL_LABELS[metal],
    percent: Number(portfolio.allocation[metal]),
  }));

  const addHref = `/portfolios/${portfolio.id}/transactions/new`;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <div>
        <Link
          to="/portfolios"
          className={buttonVariants({
            variant: "outline",
            className: "self-start",
          })}
        >
          <ArrowLeft data-icon="inline-start" />
          Back to portfolios
        </Link>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-3xl font-semibold">
              {portfolio.name}
            </h1>
            <PortfolioMenu
              portfolio={portfolio}
              onDeleted={() => navigate("/portfolios", { replace: true })}
            />
          </div>
          <Link to={addHref} className={buttonVariants()}>
            Add transactions
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardDescription>Current value</CardDescription>
          <CardTitle className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            {formatCad(portfolio.value)}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 pt-4 sm:grid-cols-3">
          <Metric label="Cost basis" value={formatCad(portfolio.costBasis)} />
          <Metric
            label="Gain"
            value={formatSignedCad(portfolio.gain)}
            tone={signedTone(portfolio.gain)}
          />
          <Metric
            label="Return"
            value={formatSignedPercent(portfolio.returnPercent)}
            tone={signedTone(portfolio.returnPercent)}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader className="border-b">
            <CardTitle>Allocation</CardTitle>
            <CardDescription>Share of current value by metal.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {allocationEntries.length === 0 ? (
              <EmptyChart
                message="No metals yet. Add a purchase to see allocation."
                actionHref={addHref}
              />
            ) : (
              <div className="grid gap-6">
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocationEntries}
                        dataKey="percent"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={72}
                        paddingAngle={2}
                        stroke="transparent"
                      >
                        {allocationEntries.map((entry) => (
                          <Cell
                            key={entry.metal}
                            fill={METAL_CHART_COLORS[entry.metal]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatPercent(Number(value ?? 0))}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="grid gap-3">
                  {allocationEntries.map((entry) => (
                    <li
                      key={entry.metal}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="size-2.5 shrink-0"
                          style={{
                            backgroundColor: METAL_CHART_COLORS[entry.metal],
                          }}
                        />
                        {entry.name}
                      </span>
                      <span className="tabular-nums text-muted-foreground">
                        {formatPercent(entry.percent)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="border-b">
            <CardTitle>Historical value</CardTitle>
            <CardDescription>
              Portfolio value over the selected period.
            </CardDescription>
            <CardAction>
              <div className="flex overflow-hidden border border-border">
                {HISTORY_RANGES.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    size="xs"
                    variant={historyRange === option.value ? "default" : "ghost"}
                    className="rounded-none"
                    onClick={() => {
                      setHistoryRangePreference(option.value);
                      dispatch(setHistoryRange(option.value));
                    }}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </CardAction>
          </CardHeader>
          <CardContent className="pt-4">
            {historyLoading ? (
              <ChartSkeleton />
            ) : history.length === 0 ? (
              <EmptyChart
                message="No history yet. Add a purchase to generate the chart."
                actionHref={addHref}
              />
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history} margin={{ top: 8, right: 8, left: 0 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(date: string) =>
                        historyRange === "1D"
                          ? date.slice(11, 16)
                          : historyRange === "1W" || historyRange === "1M"
                          ? date.slice(5)
                          : date
                      }
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                      tickLine={false}
                      axisLine={false}
                      width={72}
                      tickFormatter={(value: number) =>
                        `$${Number(value).toLocaleString("en-US")}`
                      }
                    />
                    <Tooltip
                      formatter={(value) => formatCad(Number(value ?? 0))}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="var(--chart-1)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            {transactions.length === 0
              ? "Purchases you've logged."
              : `${transactions.length} ${
                  transactions.length === 1 ? "purchase" : "purchases"
                } logged.`}
          </CardDescription>
          <CardAction>
            <Link
              to={addHref}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Add
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent className="pt-0">
          {transactions.length === 0 ? (
            <div className="py-8">
              <EmptyChart
                message="No transactions yet."
                actionHref={addHref}
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Metal</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead className="text-right">Purchase price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="tabular-nums">
                      {formatDate(txn.transactionDate)}
                    </TableCell>
                    <TableCell>{METAL_LABELS[txn.metal]}</TableCell>
                    <TableCell className="tabular-nums">
                      {formatQuantity(txn.quantity, txn.unit)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCad(txn.purchasePrice)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PortfolioDetailSkeleton() {
  return (
    <div
      className="mx-auto flex w-full max-w-5xl flex-col gap-8"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading portfolio</span>
      <div>
        <Skeleton className="h-8 w-44" />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-9 w-36" />
        </div>
      </div>

      <Card>
        <CardHeader className="border-b">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-2 h-12 w-64 sm:h-14" />
        </CardHeader>
        <CardContent className="grid gap-6 pt-4 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="grid gap-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-36" />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader className="border-b">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="grid gap-6 pt-4">
            <Skeleton className="mx-auto size-48 rounded-full" />
            <div className="grid gap-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader className="border-b">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent className="pt-4">
            <ChartSkeleton />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-40" />
        </CardHeader>
        <CardContent className="grid gap-3 pt-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="flex h-72 flex-col justify-end gap-3" aria-hidden>
      <Skeleton className="h-[18%] w-full" />
      <Skeleton className="h-[28%] w-full" />
      <Skeleton className="h-[42%] w-full" />
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="grid gap-1">
      <p className="text-xs tracking-[0.12em] text-muted-foreground uppercase">
        {label}
      </p>
      <p
        className={cn(
          "font-heading text-xl font-semibold tracking-tight",
          tone,
        )}
      >
        {value}
      </p>
    </div>
  );
}

function EmptyChart({
  message,
  actionHref,
}: {
  message: string;
  actionHref: string;
}) {
  return (
    <div className="flex min-h-48 flex-col justify-center gap-3">
      <p className="text-sm text-muted-foreground">{message}</p>
      <div>
        <Link
          to={actionHref}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Add a purchase
        </Link>
      </div>
    </div>
  );
}

function signedTone(amount: number | string | null | undefined): string {
  const value = Number(amount ?? 0);
  if (value > 0) {
    return "text-chart-2";
  }
  if (value < 0) {
    return "text-destructive";
  }
  return "";
}

function formatDate(value: string): string {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(parsed);
}
