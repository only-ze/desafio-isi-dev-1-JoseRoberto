import { fireEvent, render, screen } from "@testing-library/react";
import { ShoppingCart } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { SubmitButton } from "./SubmitButton";

describe("SubmitButton", () => {
  it("dispara a ação ao clicar", () => {
    const submit = vi.fn();
    render(
      <SubmitButton
        label="Confirmar compra"
        pendingLabel="Comprando…"
        icon={ShoppingCart}
        pending={false}
        onClick={submit}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Confirmar compra/ }));
    expect(submit).toHaveBeenCalledOnce();
  });

  it("fica desabilitado durante o envio", () => {
    const submit = vi.fn();
    render(
      <SubmitButton label="Confirmar compra" pendingLabel="Comprando…" icon={ShoppingCart} pending onClick={submit} />,
    );
    const button = screen.getByRole("button", { name: /Comprando/ });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(submit).not.toHaveBeenCalled();
  });

  it("oferece tentar de novo depois de falha de conexão", () => {
    render(
      <SubmitButton
        label="Confirmar compra"
        pendingLabel="Comprando…"
        icon={ShoppingCart}
        pending={false}
        retry
        onClick={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /Tentar de novo/ })).toBeEnabled();
  });
});
