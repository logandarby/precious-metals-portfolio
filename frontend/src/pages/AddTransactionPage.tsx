import { useState } from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { CircleAlert } from "lucide-react";
import { ApiError } from "@/api/client";
import { createTransactions } from "@/api/portfolios";
import { DatePicker } from "@/components/DatePicker";
import { METAL_LABELS, METAL_ORDER, UNIT_LABELS } from "@/lib/format";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const metals = ["GOLD", "SILVER", "PLATINUM", "PALLADIUM"] as const;
const units = ["TROY_OUNCE", "GRAM"] as const;

const transactionSchema = z.object({
  metal: z.enum(metals),
  quantity: z.coerce.number().positive("Quantity must be greater than 0"),
  unit: z.enum(units),
  purchasePrice: z.coerce
    .number()
    .min(0, "Purchase price cannot be negative"),
  transactionDate: z.string().min(1, "Date is required"),
});

const formSchema = z.object({
  transactions: z.array(transactionSchema).min(1),
});

type FormValues = z.infer<typeof formSchema>;

function emptyTransaction(): FormValues["transactions"][number] {
  return {
    metal: "GOLD",
    quantity: 1,
    unit: "TROY_OUNCE",
    purchasePrice: undefined as unknown as number,
    transactionDate: new Date().toISOString().slice(0, 10),
  };
}

export function AddTransactionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: {
      transactions: [emptyTransaction()],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "transactions",
  });

  async function onValid(values: FormValues) {
    if (!id) {
      setError("Portfolio not found");
      return;
    }
    setError(null);
    try {
      await createTransactions(id, values.transactions);
      toast.success(
        values.transactions.length === 1
          ? "Purchase added"
          : `${values.transactions.length} purchases added`,
      );
      navigate(`/portfolios/${id}`, { replace: true });
    } catch (cause) {
      const message =
        cause instanceof ApiError ? cause.message : "Could not add transactions";
      setError(message);
      toast.error(message);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <Link
        to={id ? `/portfolios/${id}` : "/portfolios"}
        className={buttonVariants({ variant: "outline" })}
      >
        Back to portfolio
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Add transactions</CardTitle>
          <CardDescription>
            Log purchases in CAD. You can add more than one at a time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-6"
            noValidate
            onSubmit={handleSubmit(onValid)}
          >
            {fields.map((field, index) => {
              const rowErrors = errors.transactions?.[index];
              return (
                <div
                  key={field.id}
                  className="grid gap-4 rounded-lg border border-border p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Purchase {index + 1}</p>
                    {fields.length > 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => remove(index)}
                      >
                        Remove
                      </Button>
                    ) : null}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor={`metal-${index}`}>Metal</Label>
                      <Controller
                        control={control}
                        name={`transactions.${index}.metal`}
                        render={({ field: metalField }) => (
                          <Select
                            value={metalField.value}
                            onValueChange={(value) => {
                              if (value) {
                                metalField.onChange(value);
                              }
                            }}
                          >
                            <SelectTrigger
                              id={`metal-${index}`}
                              className="w-full"
                            >
                              <SelectValue>
                                {(value) =>
                                  value
                                    ? METAL_LABELS[
                                        value as keyof typeof METAL_LABELS
                                      ]
                                    : "Metal"
                                }
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {METAL_ORDER.map((metal) => (
                                <SelectItem key={metal} value={metal}>
                                  {METAL_LABELS[metal]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`unit-${index}`}>Unit</Label>
                      <Controller
                        control={control}
                        name={`transactions.${index}.unit`}
                        render={({ field: unitField }) => (
                          <Select
                            value={unitField.value}
                            onValueChange={(value) => {
                              if (value) {
                                unitField.onChange(value);
                              }
                            }}
                          >
                            <SelectTrigger
                              id={`unit-${index}`}
                              className="w-full"
                            >
                              <SelectValue>
                                {(value) =>
                                  value
                                    ? UNIT_LABELS[
                                        value as keyof typeof UNIT_LABELS
                                      ]
                                    : "Unit"
                                }
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="TROY_OUNCE">oz</SelectItem>
                              <SelectItem value="GRAM">g</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                      <Input
                        id={`quantity-${index}`}
                        type="number"
                        step="any"
                        min="0"
                        {...register(`transactions.${index}.quantity`)}
                        aria-invalid={Boolean(rowErrors?.quantity)}
                      />
                      {rowErrors?.quantity ? (
                        <p className="text-xs text-destructive">
                          {rowErrors.quantity.message}
                        </p>
                      ) : null}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={`purchasePrice-${index}`}>
                        Total price (CAD)
                      </Label>
                      <Input
                        id={`purchasePrice-${index}`}
                        type="number"
                        step="any"
                        min="0"
                        {...register(`transactions.${index}.purchasePrice`)}
                        aria-invalid={Boolean(rowErrors?.purchasePrice)}
                      />
                      {rowErrors?.purchasePrice ? (
                        <p className="text-xs text-destructive">
                          {rowErrors.purchasePrice.message}
                        </p>
                      ) : null}
                    </div>
                    <div className="grid gap-2 sm:col-span-2">
                      <Label htmlFor={`transactionDate-${index}`}>Date</Label>
                      <Controller
                        control={control}
                        name={`transactions.${index}.transactionDate`}
                        render={({ field: dateField }) => (
                          <DatePicker
                            id={`transactionDate-${index}`}
                            value={dateField.value}
                            onChange={dateField.onChange}
                            invalid={Boolean(rowErrors?.transactionDate)}
                          />
                        )}
                      />
                      {rowErrors?.transactionDate ? (
                        <p className="text-xs text-destructive">
                          {rowErrors.transactionDate.message}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
            <Button
              type="button"
              variant="outline"
              onClick={() => append(emptyTransaction())}
            >
              Add another purchase
            </Button>
            {error ? (
              <Alert variant="destructive">
                <CircleAlert />
                <AlertTitle>Could not save</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save purchases"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
