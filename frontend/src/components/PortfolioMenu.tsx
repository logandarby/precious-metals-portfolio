import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Menu } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { ApiError } from "@/api/client";
import {
  deletePortfolio,
  renamePortfolio,
  type PortfolioResponse,
} from "@/api/portfolios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const renameSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
});

type RenameFormValues = z.infer<typeof renameSchema>;

type PortfolioMenuProps = {
  portfolio: Pick<PortfolioResponse, "id" | "name">;
  onRenamed: (portfolio: PortfolioResponse) => void;
  onDeleted: () => void;
};

export function PortfolioMenu({
  portfolio,
  onRenamed,
  onDeleted,
}: PortfolioMenuProps) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RenameFormValues>({
    resolver: zodResolver(renameSchema),
    values: { name: portfolio.name },
  });

  async function onRename({ name }: RenameFormValues) {
    try {
      const updated = await renamePortfolio(portfolio.id, name);
      toast.success("Portfolio renamed");
      setRenameOpen(false);
      reset({ name: updated.name });
      onRenamed(updated);
    } catch (cause) {
      toast.error(
        cause instanceof ApiError ? cause.message : "Could not rename portfolio",
      );
    }
  }

  async function onDelete() {
    setDeleting(true);
    try {
      await deletePortfolio(portfolio.id);
      toast.success("Portfolio deleted");
      setDeleteOpen(false);
      onDeleted();
    } catch (cause) {
      toast.error(
        cause instanceof ApiError ? cause.message : "Could not delete portfolio",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button type="button" variant="ghost" size="icon-sm" />}
          aria-label={`Actions for ${portfolio.name}`}
        >
          <Menu />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setRenameOpen(true)}>
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={renameOpen}
        onOpenChange={(open) => {
          setRenameOpen(open);
          if (!open) {
            reset({ name: portfolio.name });
          }
        }}
      >
        <DialogContent>
          <form className="grid gap-4" noValidate onSubmit={handleSubmit(onRename)}>
            <DialogHeader>
              <DialogTitle>Rename portfolio</DialogTitle>
              <DialogDescription>Choose a new name.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <Label htmlFor={`rename-${portfolio.id}`}>Name</Label>
              <Input
                id={`rename-${portfolio.id}`}
                maxLength={255}
                {...register("name")}
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name ? (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              ) : null}
            </div>
            <DialogFooter>
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit(onRename)}
              >
                {isSubmitting ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete portfolio</DialogTitle>
            <DialogDescription>
              This removes {portfolio.name} and every purchase in it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={() => void onDelete()}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
