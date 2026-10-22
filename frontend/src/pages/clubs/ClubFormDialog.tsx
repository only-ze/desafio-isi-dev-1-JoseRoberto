import { Shield, Wallet } from "lucide-react";
import { useState, type FormEvent } from "react";
import { createClub } from "@/api/clubs";
import { errorMessage } from "@/api/http";
import { FormField } from "@/components/FormField";
import { Notice } from "@/components/Notice";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAction } from "@/hooks/useAction";
import { formatMoney, normalizeName } from "@/utils/format";

type FieldKey = "name" | "acronym";
type FormErrors = Partial<Record<FieldKey, string>>;

function validateName(raw: string): string | undefined {
  const name = normalizeName(raw);
  if (!name) return "Informe o nome.";
  if (name.length < 3 || name.length > 60) return "O nome deve ter de 3 a 60 caracteres.";
  return undefined;
}

function validateAcronym(acronym: string): string | undefined {
  if (!acronym) return "Informe a sigla.";
  if (!/^[A-Z]{3}$/.test(acronym)) return "A sigla deve ter exatamente 3 letras, de A a Z.";
  return undefined;
}

interface ClubFormDialogProps {
  onClose: () => void;
  onSaved: () => void;
}

export function ClubFormDialog({ onClose, onSaved }: ClubFormDialogProps) {
  const [name, setName] = useState("");
  const [acronym, setAcronym] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [refusal, setRefusal] = useState<string | null>(null);

  const save = useAction(createClub, {
    successMessage: (club) =>
      `Clube criado. ${club.name} (${club.acronym}) começa com ${formatMoney(club.cash)} em caixa.`,
    onSuccess: () => {
      onSaved();
      onClose();
    },
    onError: (error) => setRefusal(errorMessage(error)),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const found: FormErrors = { name: validateName(name), acronym: validateAcronym(acronym) };
    setErrors(found);
    if (found.name || found.acronym) return;
    setRefusal(null);
    void save.run({ name: normalizeName(name), acronym });
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !save.pending && onClose()}>
      <DialogContent className="sm:max-w-120">
        <DialogHeader>
          <DialogTitle>Novo clube</DialogTitle>
          <DialogDescription>Informe o nome e a sigla do clube.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {refusal && (
            <Notice tone="error" title="Não foi possível criar o clube">
              {refusal}
            </Notice>
          )}
          <FormField
            id="club-name"
            label="Nome"
            error={errors.name}
            hint="De 3 a 60 caracteres e de 2 a 5 palavras; só letras, espaços, hífen e ponto. Não pode repetir outro clube."
          >
            <div className="relative">
              <Shield className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="club-name"
                value={name}
                placeholder="Leões da Serra"
                onChange={(event) => setName(event.target.value)}
                className="pl-9"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "club-name-error" : undefined}
              />
            </div>
          </FormField>
          <FormField
            id="club-acronym"
            label="Sigla"
            error={errors.acronym}
            hint="3 letras de A a Z, maiúsculas, que aparecem no nome nessa ordem; a primeira é a primeira letra do nome."
          >
            <Input
              id="club-acronym"
              maxLength={3}
              value={acronym}
              placeholder="LDS"
              onChange={(event) => setAcronym(event.target.value.toUpperCase())}
              className="uppercase"
              aria-invalid={Boolean(errors.acronym)}
              aria-describedby={errors.acronym ? "club-acronym-error" : undefined}
            />
          </FormField>
          <Notice tone="info" icon={Wallet}>
            O clube começa com 300,00 em caixa e sem jogadores.
          </Notice>
          <DialogFooter className="border-t pt-4">
            <Button type="button" variant="outline" disabled={save.pending} onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={save.pending}>
              {save.pending ? "Criando..." : "Criar clube"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
